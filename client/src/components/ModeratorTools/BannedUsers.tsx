import { useState, useEffect } from "react";
import { getBannedUsers } from "../../api/mod-tools";
import { PanelBox } from "../PanelBox";
import UserListView from "./ListViews/UserListView";
import { UserDetail } from "@looking-for-group/shared";
import { getUsersById } from "../../api/users";

type BannedUsersProps = {
    currentUserId: number,
    currentTab: number
    displayMode: 'grid' | 'list',
};

/**
 * Gets all banned users for the tab in Mod Page
 * @param BannedUsersProps current user ID and the current tab of Mod Page
 */
const BannedUsers = ({ currentUserId, currentTab, displayMode }: BannedUsersProps) => {
    // Variables ==============================================================
    const [loaded, setLoaded] = useState<boolean>(false);
    const [bannedUsers, setBannedUsers] = useState<UserDetail[]>([]);

    // Loaders ================================================================
    useEffect(() => {
        //get banned users to display
        const displayBannedUsers = async () => {
            const bannedUsers = await getBannedUsers();

            if (bannedUsers.data) {
                setBannedUsers(bannedUsers.data);
            }
            setLoaded(true);
        }

        displayBannedUsers();
    }, [currentTab, bannedUsers]);

    // The final component ====================================================
    if (loaded) {
        return (
            <div className="mod-tool">
                <div className="banned-users">
                    {bannedUsers.length > 0 ?
                        displayMode === 'grid' ?
                            // Grid view
                            <PanelBox
                                category={"profiles"}
                                itemList={bannedUsers ? bannedUsers : []}
                                userId={currentUserId}
                            ></PanelBox>
                            // List view
                            : <UserListView users={bannedUsers} />
                        : "No banned users!"}
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
export default BannedUsers;