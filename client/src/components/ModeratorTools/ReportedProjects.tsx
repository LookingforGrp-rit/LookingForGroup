import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getReportedProjects } from "../../api/mod-tools";
import { PanelBox } from "../PanelBox";
import { getCurrentAccount } from "../../api/users";
import { ProjectPreview } from "@looking-for-group/shared";
import * as paths from '../../constants/routes';

type ReportedProjectsProps = {
  currentUserId: number;
};

const ReportedProjects = ({currentUserId}: ReportedProjectsProps) => {

    const [reportedProjects, setReportedProjects] = useState<ProjectPreview[]>([]);
    const [reportedProjectsIds, setReportedProjectsIds] = useState<Set<number>>(new Set);
    const [userId, setUserId] = useState<number>(-1);

    useEffect(() => {

        //get reported projects to display
        const displayReportedProjects = async () => {
          const reportedProjects = ((await getReportedProjects()).data);
          const tempPendingProjectArray = [];
          let tempIds :Set<number> = new Set();
          
          if (reportedProjects !== undefined && reportedProjects!= null) {
            for (const project of reportedProjects) {
              tempPendingProjectArray.push(project);
              tempIds.add(project.projectId);
            }
            setReportedProjectsIds(tempIds);
          }
          setReportedProjects(tempPendingProjectArray);
        }

        displayReportedProjects();
    }, [reportedProjects]);
    
    // The final component
    return (
        <div id="mod-tools">
            <div className="project-reports">
                {reportedProjects.length >= 0 ? 
                    <PanelBox
                        category={"projects"}
                        itemList={reportedProjects ? reportedProjects : []}
                        userId={currentUserId}
                    ></PanelBox> 
                : <p>No reported projects!</p>}
            </div>
        </div>
    );
};
export default ReportedProjects;