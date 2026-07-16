import { useState, useEffect } from "react";
import { getReportedUsers } from "../../api/mod-tools";
import { PanelBox } from "../PanelBox";
import { UserDetail, UserPreview } from "@looking-for-group/shared";
import { getUsersById } from "../../api/users";

type ReportedUsersProps = {
  currentUserId: number,
  currentTab: number
};

/**
 * Gets all reported users for the tab in Mod Page
 * @param ReportedUsersProps current user ID and the current tab of Mod Page
 */
const ReportedUsers = ({currentUserId, currentTab}: ReportedUsersProps) => {

    const [reportedUsers, setReportedUsers] = useState<UserPreview[]>([]);

    useEffect(() => {

        //get reported projects to display
        const displayReportedUsers = async () => {
          const reportedUsers = ((await getReportedUsers()).data);
          const tempPendingUserArray = [];
          
          if (reportedUsers !== undefined && reportedUsers!= null) {
            for (const user of reportedUsers) {
              const userId = user.reportedId ? user.reportedId : -1;
              const userPreview = await getUsersById(userId);
              tempPendingUserArray.push(userPreview.data as UserPreview);
          }
          setReportedUsers(tempPendingUserArray);
        }};

        displayReportedUsers();
    }, [currentTab]);
    
    // The final component
    return (
        <div id="mod-tools">
            <div className="user-reports">
                {reportedUsers.length > 0 ? 
                    <PanelBox
                        category={"profiles"}
                        itemList={reportedUsers ? reportedUsers : []}
                        userId={currentUserId}
                    ></PanelBox> 
                : "No reported users!"}
            </div>
        </div>
    );
};
export default ReportedUsers;