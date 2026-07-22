import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from '../../constants/routes';
import { ProjectDetail } from "@looking-for-group/shared";
import { getPendingProjects } from "../../api/mod-tools";
import { PanelBox } from "../PanelBox";

type PendingProjectsProps = {
    currentUserId: number,
    currentTab: number,
    displayMode: 'grid' | 'list',
};

/**
 * Gets all pending projects for the tab in Mod Page
 * @param PendingProjectsProps current user ID and the current tab of Mod Page
 */
const PendingProjects = ({ currentUserId, currentTab, displayMode }: PendingProjectsProps) => {
    // Variables ==============================================================
    const [loaded, setLoaded] = useState<boolean>(false);
    const [pendingProjects, setPendingProjects] = useState<ProjectDetail[]>([]);
    const [pendingProjectsIds, setPendingProjectsIds] = useState<Set<number>>(new Set);

    // Helper Methods =========================================================
    /**
     * Used for navigation to other pages
     */
    const navigate = useNavigate();

    useEffect(() => {
        //get reported projects to display
        const displayPendingProjects = async () => {
            const pendingProjects = await getPendingProjects();
            const tempPendingProjectArray = [];
            let tempIds: Set<number> = new Set();

            if (pendingProjects.data !== undefined && pendingProjects.data !== null) {
                for (const project of pendingProjects.data) {
                    tempPendingProjectArray.push(project);
                    tempIds.add(project.projectId);
                }
                setPendingProjectsIds(tempIds);
            }
            setPendingProjects(tempPendingProjectArray);
            setLoaded(true);
        }

        displayPendingProjects();
    }, [currentTab]);

    /**
     * Converts ISO date string to MM/DD/YYYY format
     * @param dateStr ISO date string
     * @returns MM/DD/YYYY
     */
    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'No data';
        const [date] = dateStr.split('T');
        const [year, month, day] = date.split('-');
        return `${month}/${day}/${year}`;
    };

    /**
     * Converts into list view data row
     * @param project Project detail
     * @returns list view data row
     */
    const listView = (project: ProjectDetail) => {
        return <>
            <tr 
                key={'pending-project-' + project.projectId}
                className="pending-project-list-card" 
                onClick={() => navigate(`${routes.PROJECT}?projectID=${project.projectId}`)}
            >
                <td className="list-card-title">{project.title}</td>
                <td className="list-card-owner" data-label="Project Owner">{project.owner.firstName} {project.owner.lastName}</td>
                <td className="list-card-status" data-label="Status">{project.status}</td>
                <td className="list-card-date" data-label="Date Created">{formatDate(project.createdAt.toString())}</td>
            </tr>
        </>;
    };

    // The final component ====================================================
    if (loaded) {
        return (
            <div id="mod-tools">
                <div className="pending-projects">
                    {pendingProjects.length > 0 ?
                        displayMode === 'grid' ?
                            // Grid view
                            <PanelBox
                                category={"projects"}
                                itemList={pendingProjects ? pendingProjects : []}
                                userId={currentUserId}
                            ></PanelBox>
                            // List view
                            : <table className='responsive-table'>
                                {/* Projects List header */}
                                <thead className="pending-projects-list-header">
                                    <tr>
                                        <th className="project-header-label title">Project Title</th>
                                        <th className="project-header-label owner">Owner</th>
                                        <th className="project-header-label status">Status</th>
                                        <th className="project-header-label date">Date Created</th>
                                    </tr>
                                </thead>

                                <tbody className='pending-projects-list'>
                                    {pendingProjects.map(p => listView(p))}
                                </tbody>
                            </table>
                        : "No pending projects!"}
                </div>
            </div>
        );
    } else {
        return (
            <div className='placeholder-spacing'>
                <div className='spinning-loader'></div>
            </div>
        );
    }
};
export default PendingProjects;