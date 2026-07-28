import { useState, useEffect } from "react";
import UserListView from "../ListViews/UserListView";
import { UserDetail } from "@looking-for-group/shared";
import { getUserAccessLevel } from "../../../api/mod-tools";
import { PanelBox } from "../../PanelBox";
import { getUsers, getUsersById } from "../../../api/users";

type AllModsAdminsProps = {
    currentUserId: number,
    currentTab: number,
    displayMode: 'grid' | 'list',
};

/**
 * A list of all moderators to manage their permissions
 * @param PendingProjectsProps user ID of current user, moderation page tab currently in use
 * @returns 
 */
const AllModsAdmins = ({ currentUserId, currentTab, displayMode }: AllModsAdminsProps) => {
    // Variables ==============================================================
    const [loaded, setLoaded] = useState<boolean>(false);
    const [allModsAdmins, setAllModsAdmins] = useState<UserDetail[]>([]);

    // Helper Methods =========================================================
    useEffect(() => {

        //get reported projects to display
        const displayAllModsAdmins = async () => {
            const allUsers = (await getUsers()).data;
            const tempModsArray: UserDetail[] = [];
            if (allUsers !== null && allUsers !== undefined) {
                for (const user of allUsers) {
                    const accessLevel = await getUserAccessLevel(user.userId);
                    if (accessLevel.data?.toString() == 'Moderator' || accessLevel.data?.toString() == 'Administrator') {
                        const userDetail = await getUsersById(user.userId);

                        if (userDetail.data)
                            tempModsArray.push(userDetail.data);
                    }
                }
                setAllModsAdmins(tempModsArray);
            }
            setLoaded(true);
        }

        displayAllModsAdmins();
    }, [currentTab]);

    // The final component ====================================================
    if (loaded) {
        return (
            <div className="mod-tool">
                <div className="pending-projects">
                    {allModsAdmins.length > 0 ?
                        displayMode === 'grid' ?
                            // Grid view
                            <PanelBox
                                category={"profiles"}
                                itemList={allModsAdmins ? allModsAdmins : []}
                                userId={currentUserId}
                            ></PanelBox>
                            : <UserListView users={allModsAdmins} modsAdmins={true} />
                        : "No moderators!"}
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
export default AllModsAdmins;