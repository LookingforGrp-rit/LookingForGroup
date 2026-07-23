import { useState, useEffect } from "react";
import ProjectListView from "./ListViews/ProjectListView";
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

    // The final component ====================================================
    if (loaded) {
        return (
            <div className="mod-tool">
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
                            : <ProjectListView projects={pendingProjects} />
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