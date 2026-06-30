import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import * as paths from '../../constants/routes';
import { getByID, updateMemberRequest, getMemberRequest } from '../../api/projects';
import { getCurrentAccount, getJobTitles, getUsersById } from '../../api/users';
import { Role } from '@looking-for-group/shared';
import "../Styles/acceptInvite.css";

const AcceptApplication = () => {
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
    const [projectId, setProjectId] = useState<number>(0);
    const [projectTitle, setProjectTitle] = useState<string | null>(null);
    const [role, setRole] = useState<Role | null>(null);

    //Prospective Member info
    const [memberFirstName, setMemberFirstName] = useState<String | null>(null);
    const [memberLastName, setMemberLastName] = useState<String | null>(null);

    const [hasRespondPerm, setHasRespondPerm] = useState<boolean>(false); // Should the user have access to respond to this request
    const [msg, setMsg] = useState<string>(''); // Message for request not found or perm issue
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

    const fetchProject = async (projectId: number, currentUserId: number) => {
        try {
            const res = await getByID(projectId);

            if (res.data) {
                // only project owner should have respond permission
                setHasRespondPerm(res.data.owner.userId === currentUserId);
                if (res.data.owner.userId !== currentUserId)
                    setMsg('You do not have permission to respond to this application. Only the project owner may review and respond the application.');

                setProjectTitle(res.data.title);
            }
        } catch (err) {
            setError('Fetch Project Error: ' + err);
        }
    };

    const fetchMemberRequest = async (requestId: number, currentUserId: number) => {
        try {
            const res = await getMemberRequest({ requestId: requestId });

            if (res.data) {
                await fetchProject(res.data.projectId, currentUserId);
                await fetchRole(res.data.roleId);

                const member = await getUsersById(res.data.prospectiveMemberId);
                setMemberFirstName(member.data?.firstName ?? null);
                setMemberLastName(member.data?.lastName ?? null);

                setProjectId(res.data.projectId);
            }
        } catch (err) {
            setError('Fetch Project Error: ' + err);
            setMsg('This application could not be found or may no longer be available.');
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

                // use res.data.userId because setUserId() does not immediately update userId
                await fetchMemberRequest(requestIdNum, res.data.userId);
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
            requestIdNum,
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
                            {
                                hasRespondPerm
                                    ? <>
                                        <h2>{memberFirstName ?? "The owner"} {memberLastName ?? ""} has requested to join <span id="project-title">{projectTitle ?? "a project"}</span></h2>
                                        <p>Their role will be {role?.label ?? "Member"}</p>
                                        <div id="accept-invite-btns">
                                            <button id="decline-button" onClick={() => { handleMemberRequest('Declined') }}>Decline Application</button>
                                            <button onClick={() => { handleMemberRequest('Accepted') }}>Accept Application</button>
                                        </div>
                                    </>
                                    : <>
                                        <p>Looks like you're in the wrong place. </p>
                                        <p>{msg}</p>
                                        <div id="accept-invite-btns">
                                            <button onClick={() => { navigate(paths.routes.HOME) }}>Return Home</button>
                                        </div>
                                    </>
                            }
                        </div>
                    </div>
                }
            </div>
        </>
    );
};

export default AcceptApplication;