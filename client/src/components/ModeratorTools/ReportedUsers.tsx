import { useState, useEffect } from "react";
import { getReportedUsers } from "../../api/mod-tools";
import { PanelBox } from "../PanelBox";
import UserListView from "./ListViews/UserListView";
import { UserDetail } from "@looking-for-group/shared";
import { getUsersById } from "../../api/users";

type ReportedUsersProps = {
    currentUserId: number,
    currentTab: number
    displayMode: 'grid' | 'list',
};

/**
 * Gets all reported users for the tab in Mod Page
 * @param ReportedUsersProps current user ID and the current tab of Mod Page
 */
const ReportedUsers = ({ currentUserId, currentTab, displayMode }: ReportedUsersProps) => {
    // Variables ==============================================================
    const [loaded, setLoaded] = useState<boolean>(false);
    const [reportedUsers, setReportedUsers] = useState<UserDetail[]>([]);

    // Loaders ================================================================
    useEffect(() => {
        //get reported users to display
        const displayReportedUsers = async () => {
            const reportedUsers = ((await getReportedUsers()).data);
            const tempPendingUserArray = [];
            const tempIds: Set<number> = new Set<number>();

            if (reportedUsers !== undefined && reportedUsers != null) {
                for (const user of reportedUsers) {
                    const userId = user.reportedId ? user.reportedId : -1;
                    const userPreview = await getUsersById(userId);
                    if (!tempIds.has(userId) && user.active && userId !== currentUserId) {
                        tempIds.add(userId);
                        tempPendingUserArray.push(userPreview.data as UserDetail);
                    }
                }
            }
            setReportedUsers(tempPendingUserArray);
            setLoaded(true);
        }

        displayReportedUsers();
    }, [currentTab]);

    // The final component ====================================================
    if (loaded) {
        return (
            <div className="mod-tool">
                <div className="user-reports">
                    {reportedUsers.length > 0 ?
                        displayMode === 'grid' ?
                            // Grid view
                            <PanelBox
                                category={"profiles"}
                                itemList={reportedUsers ? reportedUsers : []}
                                userId={currentUserId}
                            ></PanelBox>
                            // List view
                            : <UserListView users={reportedUsers} />
                        : "No reported users!"}
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
export default ReportedUsers;