import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ProjectPreview } from "@looking-for-group/shared";
import { getPendingProjects } from "../../api/mod-tools";
import { PanelBox } from "../PanelBox";
import { getCurrentAccount } from "../../api/users";
import * as paths from '../../constants/routes';

type PendingProjectsProps = {
  currentUserId: number;
};

const PendingProjects = ({currentUserId}: PendingProjectsProps) => {

    const [pendingProjects, setPendingProjects] = useState<ProjectPreview[]>([]);
    const [pendingProjectsIds, setPendingProjectsIds] = useState<Set<number>>(new Set);
    const [userId, setUserId] = useState<number>(-1);

    useEffect(() => {

        //get reported projects to display
        const displayPendingProjects = async () => {
          const pendingProjects = ((await getPendingProjects()).data);
          const tempPendingProjectArray = [];
          let tempIds :Set<number> = new Set();
          
          if (pendingProjects !== undefined && pendingProjects!= null) {
            for (const project of pendingProjects) {
              tempPendingProjectArray.push(project);
              tempIds.add(project.projectId);
            }
            setPendingProjectsIds(tempIds);
          }
          setPendingProjects(tempPendingProjectArray);
        }

        displayPendingProjects();
    }, [pendingProjects]);
    
    // The final component
    return (
        <div id="mod-tools">
            <div className="pending-projects">
                {pendingProjects.length >= 0 ? 
                    <PanelBox
                        category={"projects"}
                        itemList={pendingProjects ? pendingProjects : []}
                        userId={currentUserId}
                    ></PanelBox> 
                : <p>No pending projects!</p>}
            </div>
        </div>
    );
};
export default PendingProjects;