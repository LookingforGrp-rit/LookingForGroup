import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from '../../constants/routes';
import { ProjectPreview, ProjectWithFollowers } from "@looking-for-group/shared";
import { getPendingProjects } from "../../api/mod-tools";
import { getByID } from "../../api/projects";
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

    const [loaded, setLoaded] = useState<boolean>(false);
    const [pendingProjects, setPendingProjects] = useState<ProjectPreview[]>([]);
    const [details, setDetails] = useState<ProjectWithFollowers[]>([]);
    const [pendingProjectsIds, setPendingProjectsIds] = useState<Set<number>>(new Set);

    /**
     * Used for navigation to other pages
     */
    const navigate = useNavigate();

    useEffect(() => {
        //get reported projects to display
        const displayPendingProjects = async () => {
            const pendingProjects = await getPendingProjects();
            const tempPendingProjectArray = [];
            let tempDetails: ProjectWithFollowers[] = [];
            let tempIds: Set<number> = new Set();

            if (pendingProjects.data !== undefined && pendingProjects.data !== null) {
                for (const project of pendingProjects.data) {
                    tempPendingProjectArray.push(project);
                    tempIds.add(project.projectId);

                    const detailed = await getByID(project.projectId);
                    if (detailed.data)
                        tempDetails.push(detailed.data);
                }
                setPendingProjectsIds(tempIds);
            }
            setPendingProjects(tempPendingProjectArray);
            setDetails(tempDetails);
            setLoaded(true);
        }

        displayPendingProjects();
    }, [currentTab]);

    //Converts ISO date string to MM/DD/YYYY format
    const formatDate = (dateStr: string) => {
        if (!dateStr) return 'No data';
        const [date] = dateStr.split('T');
        const [year, month, day] = date.split('-');
        return `${month}/${day}/${year}`;
    };

    const listView = (project: ProjectWithFollowers) => {
        return <>
            <tr className="my-project-list-card">
                <td className="list-card-section1">
                    <div
                        className="list-card-title"
                        onClick={() => navigate(`${routes.PROJECT}?projectId=${project.projectId}`)}
                    >{project.title}</div>
                </td>
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
                            <PanelBox
                                category={"projects"}
                                itemList={pendingProjects ? pendingProjects : []}
                                userId={currentUserId}
                            ></PanelBox>
                            : <>
                                <table className='responsive-table'>
                                    {/* Projects List header */}
                                    <thead className="my-projects-list-header">
                                        <tr>
                                            <th className="project-header-label title">Project Title</th>
                                            <th className="project-header-label owner">Owner</th>
                                            <th className="project-header-label status">Status</th>
                                            <th className="project-header-label date">Date Created</th>
                                        </tr>
                                    </thead>

                                    <tbody className='my-projects-list'>
                                        {details.map(p => listView(p))}
                                    </tbody>
                                </table>
                            </>
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