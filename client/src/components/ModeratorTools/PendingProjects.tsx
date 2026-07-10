import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { ProjectPreview } from "@looking-for-group/shared";
import { getPendingProjects } from "../../api/mod-tools";
import { PanelBox } from "../PanelBox";
import { getCurrentAccount } from "../../api/users";
import * as paths from '../../constants/routes';

const PendingProjects = () => {

    const [pendingProjects, setPendingProjects] = useState<ProjectPreview[]>([]);
    const [pendingProjectsIds, setPendingProjectsIds] = useState<Set<number>>(new Set);
    const [userId, setUserId] = useState<number>(-1);

    useEffect(() => {

        // Gets the user's account and sets the user ID
        const getAccount = async() => {
            const navigate = useNavigate();
            const userAccount = await getCurrentAccount();
            if (userAccount.status === 200 && userAccount.data?.userId)
            {
                setUserId(userAccount.data.userId);
            }
            else /* Redirect to login */
            {
                navigate(paths.routes.HOME);
            }
            // TO-DO: add case where user is not logged in (redirect or ?)
        }

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

        getAccount();
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
                        userId={userId}
                    ></PanelBox> 
                : <p>No pending projects!</p>}
            </div>
        </div>
    );
};
export default PendingProjects;