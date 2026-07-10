import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getReportedUsers } from "../../api/mod-tools";
import { PanelBox } from "../PanelBox";
import { getCurrentAccount } from "../../api/users";
import { ProjectPreview } from "@looking-for-group/shared";
import * as paths from '../../constants/routes';

type ReportedUsersProps = {
  currentUserId: number;
};

const ReportedUsers = ({currentUserId}: ReportedUsersProps) => {

    const [reportedUsers, setReportedUsers] = useState<ProjectPreview[]>([]);

    useEffect(() => {

        //get reported projects to display
        const displayReportedUsers = async () => {
          const reportedUsers = ((await getReportedUsers()).data);
          const tempPendingUserArray = [];
          
          if (reportedUsers !== undefined && reportedUsers!= null) {
            for (const project of reportedUsers) {
              tempPendingUserArray.push(project);
          }
          setReportedUsers(tempPendingUserArray);
        }};

        displayReportedUsers();
    }, [reportedUsers]);
    
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
                : <p>No reported users!</p>}
            </div>
        </div>
    );
};
export default ReportedUsers;