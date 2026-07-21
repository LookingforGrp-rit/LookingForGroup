import { useState, useEffect } from "react";
import { UserPreview } from "@looking-for-group/shared";
import { getUserAccessLevel } from "../../../api/mod-tools";
import { PanelBox } from "../../PanelBox";
import { getUsers } from "../../../api/users";

type AllModeratorsProps = {
  currentUserId: number,
  currentTab: number
};

/**
 * A list of all moderators to manage their permissions
 * @param PendingProjectsProps user ID of current user, moderation page tab currently in use
 * @returns 
 */
const AllModerators = ({currentUserId, currentTab}: AllModeratorsProps) => {

    const [allModerators, setAllModerators] = useState<UserPreview[]>([]);

    useEffect(() => {

        //get reported projects to display
        const displayAllModerators = async () => {
          const allUsers = (await getUsers()).data;
          const tempModsArray = [];
          if (allUsers !== null && allUsers !== undefined) {
            for (const user of allUsers)
            {
                const accessLevel = await getUserAccessLevel(user.userId);
                if (accessLevel.data?.toString() == 'Moderator')
                {
                    tempModsArray.push(user);
                }
            }
            setAllModerators(tempModsArray);
            }
        }

        displayAllModerators();
    }, [currentTab]);
    
    // The final component
    return (
        <div id="mod-tools">
            <div className="pending-projects">
                {allModerators.length > 0 ? 
                    <PanelBox
                        category={"profiles"}
                        itemList={allModerators ? allModerators : []}
                        userId={currentUserId}
                    ></PanelBox> 
                : "No moderators!"}
            </div>
        </div>
    );
};
export default AllModerators;