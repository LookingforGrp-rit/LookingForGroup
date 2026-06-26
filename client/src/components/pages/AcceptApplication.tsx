import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import * as paths from '../../constants/routes';
import { getByID, updateMemberRequest, getRequestByID } from '../../api/projects';
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
            }
        } catch (err) {
            setError('Fetch Project Error: ' + err);
        }
    };

    const fetchMemberRequest = async (requestId: number) => {
        try {
            const res = await getRequestByID(requestId);

            if (res.data) {
                await fetchProject(res.data.projectId);
                await fetchRole(res.data.roleId);

                const member = await getUsersById(res.data.prospectiveMemberId);
                setMemberFirstName(member.data?.firstName ?? null);
                setMemberLastName(member.data?.lastName ?? null);

                setProjectId(res.data.projectId);
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

                await fetchMemberRequest(requestIdNum);
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
                            <h2>{memberFirstName ?? "The owner"} {memberLastName ?? ""} has requested to join <h2 id="project-title">{projectTitle?.toUpperCase() ?? "a project"}</h2></h2>
                            <p>Their role will be {role?.label ?? "Member"}</p>
                            <div id="accept-invite-btns">
                                <button id="decline-button" onClick={() => { handleMemberRequest('Declined') }}>Decline Application</button>
                                <button onClick={() => { handleMemberRequest('Accepted') }}>Accept Application</button>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </>
    );
};

export default AcceptApplication;