import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import usePreloadedImage from "../../functions/imageLoad";
import thumbnailPicture from "../../images/project_temp.png";
import { Tag } from '../Tag';
import * as paths from '../../constants/routes';
import { getByID, updateMemberRequest, getMemberRequest } from '../../api/projects';
import { getCurrentAccount, getJobTitles } from '../../api/users';
import { Role, ProjectDetail } from '@looking-for-group/shared';
import { ProjectContext, ProjectStatus } from '@looking-for-group/shared/enums';
import "../Styles/acceptInvite.css";

const AcceptInvitation = () => {
    //#region Hooks
    const navigate = useNavigate(); // Hook for navigation
    const location = useLocation(); // Hook to access the current location

    // Route and query params
    const { requestId } = useParams();
    const requestIdNum = Number(requestId);

    const [loaded, setLoaded] = useState<boolean>(false);

    // User info state
    const [firstName, setFirstName] = useState<string | null>(null);
    const [userId, setUserId] = useState<number>();
    const [loggedIn, setLoggedIn] = useState<boolean>(false);

    // Project info
    const [project, setProject] = useState<ProjectDetail>();
    const [projectId, setProjectId] = useState<number>(0);
    const [role, setRole] = useState<Role | null>(null);

    const [hasRespondPerm, setHasRespondPerm] = useState<boolean>(false); // Should the user have access to respond to this request
    const [systemMsg, setSystemMsg] = useState<string>(''); // Message for request not found or perm issue
    const [error, setError] = useState<string>(''); // Error message for missing or incorrect information
    //#endregion

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
                setProject(res.data);
            }
        } catch (err) {
            setError('Fetch Project Error: ' + err);
        }
    };

    const fetchMemberRequest = async (requestId: number, currentUserId: number) => {
        try {
            const res = await getMemberRequest({ requestId: requestId });

            if (res.data) {
                await fetchProject(res.data.projectId);
                await fetchRole(res.data.roleId);

                // only prospective member should have respond permission
                setHasRespondPerm(res.data.prospectiveMemberId === currentUserId);
                if (res.data.prospectiveMemberId !== currentUserId) {
                    setSystemMsg('You do not have permission to respond to this invitation. Only the prospective member may review and respond the invitation.');
                    return;
                }

                if (res.data.requestStatus === 'Accepted' || res.data.requestStatus === 'Declined') {
                    setHasRespondPerm(false);
                    setSystemMsg('This request has been closed.');
                    return;
                }

                setProjectId(res.data.projectId);
            }
        } catch (err) {
            setError('Fetch Project Error: ' + err);
            setSystemMsg('This invitation could not be found or may no longer be available.');
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

                setLoaded(true);
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

    //#region Loaders
    // Fetch current user info on mount
    useEffect(() => {
        fetchUser();
    }, [navigate]);

    // Load thumbnail image
    const thumbnailSrc = usePreloadedImage(
        project?.thumbnail?.image ?? thumbnailPicture,
        thumbnailPicture,
    );
    //#endregion

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
            { requestStatus: newStatus }
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

    //#region Final Component
    return (<>
        <div className="background-cover">
            <div className="error" aria-live="assertive" role="alert">{error}</div>
            {!loaded && <>
                <div className='placeholder-spacing'>
                    <div className='spinning-loader'></div>
                </div>
            </>}
            {loggedIn && <>
                <div id="accept-invite-container">
                    <div id="accept-invite-info">
                        <h1>Hi, {firstName}!</h1>
                        {hasRespondPerm
                            ? project
                                ? <>
                                    <h2>{project.owner.firstName} {project.owner.lastName} invited you to join <span id="project-title">{project.title}</span></h2>
                                    <div id='project-metadata'>
                                        <div id='project-image'>
                                            <img
                                                src={thumbnailSrc}
                                                alt={`${project.title} thumbnail image`}
                                                onError={(e) => {
                                                    const profileImg = e.target as HTMLImageElement;
                                                    profileImg.src = thumbnailPicture;
                                                }}
                                            ></img>
                                        </div>
                                        <div id='project-attributes'>
                                            <div>
                                                <p className='detail-header'>Status</p>
                                                <p>{ProjectStatus[project.status]}</p>
                                            </div>
                                            <div>
                                                <p className='detail-header'>Content</p>
                                                <p>{ProjectContext[project.context!]}</p>
                                            </div>
                                            <div>
                                                <p className='detail-header'>Audience</p>
                                                <p>{project.audience}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div id='project-tags'>
                                        <h3>Tags</h3>
                                        <ul id='tags'>
                                            {project.tags.sort((a, b) => a.displayOrder - b.displayOrder).map(tag => <li><Tag type={tag.type.toLowerCase()} selected={true}>{tag.label}</Tag></li>)}
                                        </ul>
                                    </div>
                                    <div id='project-detail'>
                                        <h3>Project Overview</h3>
                                        <p>{project.description}</p>
                                    </div>
                                    <p>Your role will be <span id="role">{role?.label}</span></p>
                                    <div id="accept-invite-btns">
                                        <button id="decline-button" onClick={() => { handleMemberRequest('Declined') }}>Decline Invite</button>
                                        <button onClick={() => { handleMemberRequest('Accepted') }}>Accept Invite</button>
                                    </div>
                                </> : <>
                                    <div className='placeholder-spacing'>
                                        <div className='spinning-loader'></div>
                                    </div>
                                </>
                            : <>
                                <p>Looks like you're in the wrong place.</p>
                                <p>{systemMsg}</p>
                                <div id="accept-invite-btns">
                                    <button onClick={() => { navigate(paths.routes.HOME) }}>Return Home</button>
                                </div>
                            </>}
                    </div>
                </div>
            </>}
        </div>
    </>);
    //#endregion
};

export default AcceptInvitation;