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
    const [association, setAssociation] = useState<Record<number, boolean>>({});

    // Helper Methods =========================================================
    /**
     * Checks if the current user (moderator) is associated to this project in any way 
     * @param project Project detail
     * @returns [Project id, associated or not]
     */
    const checkAssociation = (project: ProjectDetail) => {
        // check if the moderator is the owner or a member
        if (project.owner.userId === currentUserId ||
            project.members.some(member => member.user.userId === currentUserId)
        ) {
            return [project.projectId, true];
        }
        return [project.projectId, false];
    }

    // Loaders ================================================================
    useEffect(() => {
        //get reported projects to display
        const displayPendingProjects = async () => {
            const pendingProjects = await getPendingProjects();
            const tempPendingProjectArray = [];
            let tempIds: Set<number> = new Set();

            if (pendingProjects.data !== undefined && pendingProjects.data !== null) {
                let entries = [];

                for (const project of pendingProjects.data) {
                    tempPendingProjectArray.push(project);
                    tempIds.add(project.projectId);

                    entries.push(checkAssociation(project));
                }

                setAssociation(Object.fromEntries(entries));
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
                            : <ProjectListView projects={pendingProjects} association={association} />
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