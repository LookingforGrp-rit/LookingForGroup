import { useState, useEffect } from "react";
import { ProjectPreview } from "@looking-for-group/shared";
import { getPendingProjects } from "../../api/mod-tools";
import { PanelBox } from "../PanelBox";

type PendingProjectsProps = {
  currentUserId: number,
  currentTab: number
};

/**
 * Gets all pending projects for the tab in Mod Page
 * @param PendingProjectsProps current user ID and the current tab of Mod Page
 */
const PendingProjects = ({currentUserId, currentTab}: PendingProjectsProps) => {

    const [pendingProjects, setPendingProjects] = useState<ProjectPreview[]>([]);
    const [pendingProjectsIds, setPendingProjectsIds] = useState<Set<number>>(new Set);

    useEffect(() => {

        //get reported projects to display
        const displayPendingProjects = async () => {
          const pendingProjects = await getPendingProjects();
          const tempPendingProjectArray = [];
          let tempIds :Set<number> = new Set();
          
          if (pendingProjects.data !== undefined && pendingProjects.data !== null) {
            for (const project of pendingProjects.data) {
              tempPendingProjectArray.push(project);
              tempIds.add(project.projectId);
            }
            setPendingProjectsIds(tempIds);
          }
          setPendingProjects(tempPendingProjectArray);
        }

        displayPendingProjects();
    }, [currentTab]);
    
    // The final component
    return (
        <div id="mod-tools">
            <div className="pending-projects">
                {pendingProjects.length > 0 ? 
                    <PanelBox
                        category={"projects"}
                        itemList={pendingProjects ? pendingProjects : []}
                        userId={currentUserId}
                    ></PanelBox> 
                : "No pending projects!"}
            </div>
        </div>
    );
};
export default PendingProjects;