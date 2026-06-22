import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import * as paths from '../../constants/routes';
import { getByID, updateMemberRequest } from '../../api/projects';
import { getCurrentAccount, getJobTitles } from '../../api/users';
import { Role } from '@looking-for-group/shared';
import "../Styles/acceptInvite.css";

const AcceptInvitation = () => {
    const navigate = useNavigate(); // Hook for navigation
    const location = useLocation(); // Hook to access the current location

    // Route and query params
    const { requestId } = useParams();
    const requestIdNum = Number(requestId);

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
    const fetchRole = async (roleId: number) => {
        try {
            const res = await getJobTitles();

            if (res.data) {
                const role = res.data.find((r) => r.roleId === roleId);
                if (!role) {
                    setError(`No role found with ID: ${roleId}`);
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

    const fetchMemberRequest = async (requestId: number) => {
        try {
            const res = await getRequestByID(requestId);

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

                const request = await fetchMemberRequest(requestId);

                await fetchProject(request.projectId);
                await fetchRole(request.roleId);
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
    const handleMemberRequest = async (
        newStatus: 'Accepted' | 'Declined'
    ) => {
        if (!userId) {
            setError('Not Logged In');
            return;
        }

        const result = await updateMemberRequest(
            projectIdNum,
            userId,
            { newStatus }
        );

        if (result.error) {
            setError(result.error);
            return;
        }

        navigate(
            newStatus === 'Accepted'
                ? `${paths.routes.PROJECT}?projectID=${projectId}`
                : paths.routes.HOME
        );
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
                            <h2>{ownerFirstName ?? "The Owner"} {ownerLastName ?? ""} invited you to join <h2 id="project-title">{projectTitle?.toUpperCase() ?? "a project"}</h2></h2>
                            <p>Your role will be {role?.label ?? "Member"}</p>
                            <div id="accept-invite-btns">
                                <button id="decline-button" onClick={() => {handleMemberRequest('Declined')}}>Decline Invite</button>
                                <button onClick={() => {handleMemberRequest('Accepted')}}>Accept Invite</button>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </>
    );
};

export default AcceptInvitation;