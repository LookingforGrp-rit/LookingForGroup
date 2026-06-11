import { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import * as paths from '../../constants/routes';
import { getByID, updatePendingMember, deleteMember } from '../../api/projects';
import { getCurrentAccount, getJobTitles, getUserByEmail } from '../../api/users';
import { Role } from '@looking-for-group/shared';
import "../Styles/acceptInvite.css";

const AcceptInvitation = () => {
    const navigate = useNavigate(); // Hook for navigation
    const location = useLocation(); // Hook to access the current location

    // Route and query params
    const { projectId, roleId } = useParams();
    const projectIdNum = Number(projectId);
    const roleIdNum = Number(roleId);

    // User info state
    const [firstName, setFirstName] = useState<string | null>(null);
    const [userId, setUserId] = useState<number>();
    const [loggedIn, setLoggedIn] = useState<boolean>(false);

    // Project info
    const [projectTitle, setProjectTitle] = useState<string | null>(null);
    const [role, setRole] = useState<Role | null>(null);
    const [ownerFirstName, setOwnerFirstName] = useState<String | null>(null);
    const [ownerLastName, setOwnerLastName] = useState<String | null>(null);

    const [error, setError] = useState<string>(''); // Error message for missing or incorrect information

    //#region Helper Methods
    const fetchRole = async () => {
        try {
            const res = await getJobTitles();

            if (res.data) {
                const role = res.data.find((r, i) => r.roleId === roleIdNum);
                if (!role) {
                    setError(`No role found with ID: ${roleIdNum}`);
                    return;
                }
                setRole(role);
            }
        } catch (err) {
            setError('Fetch Project Error: ' + err);
        }
    };

    const fetchProject = async (projectId: number) => {
        try {
            const res = await getByID(projectId);

            if (res.data) {
                setProjectTitle(res.data.title);
                setOwnerFirstName(res.data.owner.firstName);
                setOwnerLastName(res.data.owner.lastName);
                
            }
        } catch (err) {
            setError('Fetch Project Error: ' + err);
        }
    };

    const fetchUser = async () => {
        try {
            if (userId === -1) return;
            const res = await getCurrentAccount();

            if (res.data) {
                setLoggedIn(true);
                setUserId(res.data.userId);
                setFirstName(res.data.firstName);

                await fetchProject(projectIdNum);
                await fetchRole();
            } else {
                navigate(paths.routes.LOGIN, {
                    state: { from: location }
                });
            }
        } catch (err) {
            setLoggedIn(false);
            setError('Fetch User Error: ' + err);
        }
    }
    //#endregion

    // Fetch current user info on mount
    useEffect(() => {
        fetchUser();
    }, [navigate]);

    //#region Handlers
    const handleDecline = async () => {
        if (!userId) {
            setError('Not Logged In');
            return;
        }
        const result = await deleteMember(projectIdNum, userId);
        if (result.error) {
            setError(result.error);
        }
        navigate(paths.routes.HOME);
    };

    const handleAccept = async () => {
        if (!userId) {
            setError('Not Logged In');
            return;
        }
        const result = await updatePendingMember(
            projectIdNum,
            userId,
            {
                roleId: roleIdNum,
                profileVisibility: 'public'    // set to private when invited
            }
        );
        if (result.error) {
            setError(result.error);
        }
        navigate(`${paths.routes.PROJECT}?projectID=${projectId}`);
    };
    //#endregion

    return (
        <>
            <div className="background-cover">
                <div className="error" aria-live="assertive" role="alert">{error}</div>
                {
                    loggedIn && 
                        <div id="accept-invite-container">
                            <div id="accept-invite-info">
                                <h1>Hi, {firstName}!</h1>
                                <h2>{ownerFirstName ?? "The Owner"} {ownerLastName ?? ""} 
                                    invited you to join <h2 id="project-title">{projectTitle?.toUpperCase() ?? " a project"}</h2></h2>
                                <p>Your role will be {role?.label ?? "Member"}</p>
                                <div id="accept-invite-btns">
                                    <button id="decline-button" onClick={handleDecline}>Decline Invite</button>
                                    <button onClick={handleAccept}>Accept Invite</button>
                                </div>
                            </div>
                        </div>
                }
            </div>
        </>
    );
};

export default AcceptInvitation;