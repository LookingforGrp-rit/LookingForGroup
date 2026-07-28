import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { routes } from '../../../constants/routes';
import { getUserAccessLevel } from "../../../api/mod-tools";
import { UserDetail, UserAccessLevel } from "@looking-for-group/shared";
import { RitStatus } from "@looking-for-group/shared/enums";

type UserListViewProps = {
    users: UserDetail[],
    modsAdmins?: boolean,
};

const UserListView = ({ users, modsAdmins = false }: UserListViewProps) => {
    // Variables ==============================================================
    const [accessLevels, setAccessLevels] = useState<Record<number, UserAccessLevel>>({});

    // Helper Methods =========================================================
    /**
     * Used for navigation to other pages
     */
    const navigate = useNavigate();

    /**
     * Get user access level
     * @param userID User ID
     * @returns User access level
     */
    const getAccessLevel = async (userID: number): Promise<UserAccessLevel> => {
        const res = await getUserAccessLevel(userID);
        if (res.data)
            return res.data.toString() as UserAccessLevel;
        return 'User';
    }

    /**
     * Get access levels if this if for mods and admins
     */
    useEffect(() => {
        if (!modsAdmins) return;

        const loadAccessLevels = async () => {
            const entries = await Promise.all(
                users.map(async user => [
                    user.userId,
                    (await getAccessLevel(user.userId)) ?? "User",
                ] as const)
            );

            setAccessLevels(Object.fromEntries(entries));
        };

        void loadAccessLevels();
    }, [users, modsAdmins]);

    /**
     * Converts into list view data row
     * @param user User detail
     * @returns list view data row
     */
    const listView = (user: UserDetail) => {
        return <>
            <tr
                key={'user-report-' + user.userId}
                className="list-card"
                onClick={() => navigate(`${routes.PROFILE}?userID=${user.userId}`)}
            >
                <td className="list-card-title">{user.firstName} {user.lastName}</td>
                {modsAdmins && <td className="list-card-access-level" data-label="Access Level">{accessLevels[user.userId]}</td>}
                <td className="list-card-pronouns" data-label="Pronouns">{user.pronouns.length > 0 ? user.pronouns : 'Not Provided'}</td>
                <td className="list-card-location" data-label="Location">{user.location.length > 0 ? user.location : 'Not Provided'}</td>
                <td className="list-card-rit-status" data-label="RIT Status">{user.ritStatus ? RitStatus[user.ritStatus] : 'Not Provided'}</td>
                <td className="list-card-projects" data-label="Projects">{user.projects.length}</td>
            </tr>
        </>;
    };

    // The final component ====================================================
    return (
        <table className='responsive-table'>
            {/* User Reports List Header */}
            <thead className="list-header">
                <tr>
                    <th className="header-label title">Name</th>
                    {modsAdmins && <th className="header-label access-level">Access Level</th>}
                    <th className="header-label pronouns">Pronouns</th>
                    <th className="header-label location">Location</th>
                    <th className="header-label rit-status">RIT Status</th>
                    <th className="header-label projects">Projects</th>
                </tr>
            </thead>

            <tbody className='list-view'>
                {users.map(u => listView(u))}
            </tbody>
        </table>
    );
};
export default UserListView;