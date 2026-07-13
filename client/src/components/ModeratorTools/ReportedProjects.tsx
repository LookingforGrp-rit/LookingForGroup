import { useState, useEffect } from "react";
import { getReportedProjects } from "../../api/mod-tools";
import { PanelBox } from "../PanelBox";
import { ProjectWithFollowers } from "@looking-for-group/shared";
import { getByID } from "../../api/projects";

type ReportedProjectsProps = {
  currentUserId: number,
  currentTab: number
};

const ReportedProjects = ({currentUserId, currentTab}: ReportedProjectsProps) => {

    const [reportedProjects, setReportedProjects] = useState<ProjectWithFollowers[]>([]);
    const [reportedProjectsIds, setReportedProjectsIds] = useState<Set<number>>(new Set);

    useEffect(() => {

        //get reported projects to display
        const displayReportedProjects = async () => {
          const reportedProjects = ((await getReportedProjects()).data);
          const tempPendingProjectArray = [];
          let tempIds :Set<number> = new Set();
          
          if (reportedProjects !== undefined && reportedProjects!= null) {
            for (const project of reportedProjects) {
              const reportedId = await getByID(project.projectId);
              tempPendingProjectArray.push(reportedId.data as ProjectWithFollowers);
              tempIds.add(project.projectId);
            }
            setReportedProjectsIds(tempIds);
          }
          setReportedProjects(tempPendingProjectArray);     /* not exactly sure what's causing this error */
        }

        displayReportedProjects();
    }, [currentTab]);
    
    // The final component
    return (
        <div id="mod-tools">
            <div className="project-reports">
                {reportedProjects.length > 0 ? 
                    <PanelBox
                        category={"projects"}
                        itemList={reportedProjects ? reportedProjects : []}
                        userId={currentUserId}
                    ></PanelBox> 
                : "No reported projects!"}
            </div>
        </div>
    );
};
export default ReportedProjects;