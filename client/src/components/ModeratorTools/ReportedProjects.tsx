import { useState, useEffect } from "react";
import { getReportedProjects } from "../../api/mod-tools";
import { PanelBox } from "../PanelBox";
import ProjectListView from "./ListViews/ProjectListView";
import { ProjectWithFollowers, ProjectReport } from "@looking-for-group/shared";
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
    const [association, setAssociation] = useState<Record<number, boolean>>({});

    // Helper Methods =========================================================
    /**
     * Checks if the current user (moderator) is associated to this report in any way
     * @param project Project detail
     * @param report Report detail
     * @returns [Project id, associated or not]
     */
    const checkAssociation = (project: ProjectWithFollowers, report: ProjectReport) => {
        // check if the moderator is a owner, member, or a reporter
        if (project.owner.userId === currentUserId || 
            project.members.some(member => member.user.userId === currentUserId) ||
            report.userId === currentUserId) {
            return [project.projectId, true];
        }
        return [project.projectId, false];
    }

    // Loaders ================================================================
    useEffect(() => {
        //get reported projects to display
        const displayReportedProjects = async () => {
            const reports = ((await getReportedProjects()).data);
            const tempPendingProjectArray: ProjectWithFollowers[] = [];
            let tempIds: Set<number> = new Set();

            if (reports !== undefined && reports != null) {
                let entries = [];

                for (const report of reports) {
                    const res = await getByID(report.projectId);

                    // check if data exist and no repeats
                    if (res.data && !tempIds.has(res.data.projectId)) {
                        const project = res.data;

                        tempPendingProjectArray.push(project as ProjectWithFollowers);
                        tempIds.add(project.projectId);

                        entries.push(checkAssociation(project, report));
                    }
                }

                setAssociation(Object.fromEntries(entries));
                setReportedProjects(tempPendingProjectArray);
            }
            setLoaded(true);
        }

        displayReportedProjects();
    }, [currentTab]);

    // The final component ====================================================
    if (loaded) {
        return (
            <div className="mod-tool">
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
                            : <ProjectListView projects={reportedProjects} association={association} />
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