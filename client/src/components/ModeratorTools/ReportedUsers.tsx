import { useState, useEffect } from "react";
import { getReportedUsers } from "../../api/mod-tools";
import { PanelBox } from "../PanelBox";
import UserListView from "./ListViews/UserListView";
import { UserDetail, UserReport } from "@looking-for-group/shared";
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
    const [association, setAssociation] = useState<Record<number, boolean>>({});

    // Loaders ================================================================
    useEffect(() => {
        //get reported users to display
        const displayReportedUsers = async () => {
            const reports = ((await getReportedUsers()).data);
            const tempPendingUserArray = [];
            const tempIds: Set<number> = new Set<number>();

            if (reports) {
                let entries = [];
                for (const report of reports) {
                    const userId = report.reportedId ? report.reportedId : -1;
                    // check if report is repeated and is active
                    if (!tempIds.has(userId) && report.active) {
                        // get user detail
                        const res = await getUsersById(userId);

                        if (res.data) {
                            const userDetail = res.data;

                            tempIds.add(userId);
                            tempPendingUserArray.push(userDetail);
                            
                            entries.push(checkAssociation(userDetail, report))
                        }
                    }
                }
                setAssociation(Object.fromEntries(entries));
            }

            setReportedUsers(tempPendingUserArray);
            setLoaded(true);
        }

        displayReportedUsers();
    }, [currentTab]);

    // Helper Methods =========================================================
    /**
     * Checks if the current user (moderator) is associated to this report in any way
     * @param user User detail
     * @param report Report detail
     * @returns [User id, associated or not]
     */
    const checkAssociation = (user: UserDetail, report: UserReport) => {
        // check if the moderator is the user or the reporter
        if (user.userId === currentUserId ||
            report.reporterId === currentUserId) {
            return [user.userId, true];
        }
        return [user.userId, false];
    }

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
                            : <UserListView users={reportedUsers} association={association} />
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