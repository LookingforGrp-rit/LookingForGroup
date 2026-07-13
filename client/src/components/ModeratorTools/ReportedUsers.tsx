import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getReportedUsers } from "../../api/mod-tools";
import { PanelBox } from "../PanelBox";
import { getCurrentAccount, getUsers } from "../../api/users";
import { ProjectPreview } from "@looking-for-group/shared";
import * as paths from '../../constants/routes';
import { getUsersById } from "../../api/users";

type ReportedUsersProps = {
  currentUserId: number,
  currentTab: number
};

const ReportedUsers = ({currentUserId, currentTab}: ReportedUsersProps) => {

    const [reportedUsers, setReportedUsers] = useState<ProjectPreview[]>([]);

    useEffect(() => {

        //get reported projects to display
        const displayReportedUsers = async () => {
          const reportedUsers = ((await getReportedUsers()).data);
          const tempPendingUserArray = [];
          
          if (reportedUsers !== undefined && reportedUsers!= null) {
            for (const user of reportedUsers) {
              const reportedId = await getUsersById(user.userId);
              tempPendingUserArray.push(reportedId);
          }
          setReportedUsers(tempPendingUserArray);           /* not exactly sure what's causing this error */
        }};
    }, [currentTab]);
    
    // The final component
    return (
        <div id="mod-tools">
            <div className="user-reports">
                {reportedUsers.length >= 0 ? 
                    <PanelBox
                        category={"profiles"}
                        itemList={reportedUsers ? reportedUsers : []}
                        userId={currentUserId}
                    ></PanelBox> 
                : ""}
            </div>
        </div>
    );
};
export default ReportedUsers;