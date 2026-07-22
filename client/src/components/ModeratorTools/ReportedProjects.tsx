import { useState, useEffect } from "react";
import { getReportedProjects } from "../../api/mod-tools";
import { PanelBox } from "../PanelBox";
import ProjectListView from "./ListViews/ProjectListView";
import { ProjectWithFollowers } from "@looking-for-group/shared";
import { getByID } from "../../api/projects";

type ReportedProjectsProps = {
    currentUserId: number,
    currentTab: number
    displayMode: 'grid' | 'list',
};

/**
 * Gets all reported projects for the tab in Mod Page
 * @param ReportedProjectsProps current user ID and the current tab of Mod Page
 */
const ReportedProjects = ({ currentUserId, currentTab, displayMode }: ReportedProjectsProps) => {
    // Variables ==============================================================
    const [loaded, setLoaded] = useState<boolean>(false);
    const [reportedProjects, setReportedProjects] = useState<ProjectWithFollowers[]>([]);

    // Helper Methods =========================================================
    useEffect(() => {

        //get reported projects to display
        const displayReportedProjects = async () => {
            const reportedProjects = ((await getReportedProjects()).data);
            const tempPendingProjectArray = [];
            let tempIds: Set<number> = new Set();

            if (reportedProjects !== undefined && reportedProjects != null) {
                for (const project of reportedProjects) {
                    const reportedId = await getByID(project.projectId);
                    if (reportedId.data?.projectId !== undefined && !tempIds.has(reportedId.data?.projectId)) {
                        tempPendingProjectArray.push(reportedId.data as ProjectWithFollowers);
                        tempIds.add(project.projectId);
                    }
                }
                setReportedProjects(tempPendingProjectArray);
                setLoaded(true);
            }
        }

        displayReportedProjects();
    }, [currentTab]);

    // The final component ====================================================
    if (loaded) {
        return (
            <div id="mod-tools">
                <div className="project-reports">
                    {reportedProjects.length > 0 ?
                        displayMode === 'grid' ?
                            // Grid view
                            <PanelBox
                                category={"projects"}
                                itemList={reportedProjects ? reportedProjects : []}
                                userId={currentUserId}
                            ></PanelBox>
                            // List view
                            : <ProjectListView projects={reportedProjects} />
                        : "No reported projects!"}
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
export default ReportedProjects;