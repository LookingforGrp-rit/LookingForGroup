import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getReportedUsers } from "../../api/mod-tools";
import { PanelBox } from "../PanelBox";
import { getCurrentAccount } from "../../api/users";
import { ProjectPreview } from "@looking-for-group/shared";
import * as paths from '../../constants/routes';

const ReportedUsers = () => {

    const [reportedUsers, setReportedUsers] = useState<ProjectPreview[]>([]);
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
        }

        //get reported projects to display
        const displayReportedUsers = async () => {
          const reportedUsers = ((await getReportedUsers()).data);
          const tempPendingUserArray = [];
          
          if (reportedUsers !== undefined && reportedUsers!= null) {
            for (const project of reportedUsers) {
              tempPendingUserArray.push(project);
          }
          setReportedUsers(tempPendingUserArray);
        }

        getAccount();
        displayReportedUsers();
    }}, [reportedUsers]);
    
    // The final component
    return (
        <div id="mod-tools">
            <div className="user-reports">
                {reportedUsers.length >= 0 ? 
                    <PanelBox
                        category={"profiles"}
                        itemList={reportedUsers ? reportedUsers : []}
                        userId={userId}
                    ></PanelBox> 
                : <p>No reported users!</p>}
            </div>
        </div>
    );
};
export default ReportedUsers;