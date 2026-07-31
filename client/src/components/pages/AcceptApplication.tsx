import { useEffect, useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import usePreloadedImage from "../../functions/imageLoad";
import profilePicture from "../../images/lfrog.png";
import { Tag } from '../Tag';
import * as paths from '../../constants/routes';
import { getByID, updateMemberRequest, getMemberRequest } from '../../api/projects';
import { getCurrentAccount, getJobTitles, getUsersById } from '../../api/users';
import { Role, UserDetail } from '@looking-for-group/shared';
import { RitStatus } from '@looking-for-group/shared/enums';
import "../Styles/acceptInvite.css";

const AcceptApplication = () => {
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
    const [projectId, setProjectId] = useState<number>(0);
    const [projectTitle, setProjectTitle] = useState<string | null>(null);
    const [role, setRole] = useState<Role | null>(null);

    //Prospective Member info
    const [applicant, setApplicant] = useState<UserDetail>();

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

    const fetchProject = async (projectId: number, currentUserId: number) => {
        try {
            const res = await getByID(projectId);

            if (res.data) {
                // only project owner should have respond permission
                setHasRespondPerm(res.data.owner.userId === currentUserId);
                if (res.data.owner.userId !== currentUserId)
                    setSystemMsg('You do not have permission to respond to this application. Only the project owner may review and respond the application.');

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
                if (res.data.requestStatus === 'Accepted' || res.data.requestStatus === 'Declined') {
                    setHasRespondPerm(false);
                    setSystemMsg('This request has been closed.');
                    return;
                }

                await fetchProject(res.data.projectId, currentUserId);
                await fetchRole(res.data.roleId);

                const member = await getUsersById(res.data.prospectiveMemberId);
                if (member.data) setApplicant(member.data);

                setProjectId(res.data.projectId);
            }
        } catch (err) {
            setError('Fetch Project Error: ' + err);
            setSystemMsg('This application could not be found or may no longer be available.');
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
    const profileSrc = usePreloadedImage(
        applicant?.profileImage ?? profilePicture,
        profilePicture,
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

        // Navigate to the project
        navigate(`${paths.routes.PROJECT}?projectID=${projectId}`);
    };
    //#endregion

    //#region Final component
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
                            ? applicant
                                ? <>
                                    <h2><span id="project-title">{projectTitle}</span> has a pending application from <span id="applicant-name">{applicant.firstName} {applicant.lastName}</span></h2>
                                    <div id='user-metadata'>
                                        <div id='profile-image'>
                                            <img
                                                src={profileSrc}
                                                alt={`${applicant.firstName} ${applicant.lastName}'s profile image`}
                                                onError={(e) => {
                                                    const profileImg = e.target as HTMLImageElement;
                                                    profileImg.src = profilePicture;
                                                }}
                                            ></img>
                                        </div>
                                        <div id='user-attributes'>
                                            <div>
                                                <p className='detail-header'>Pronouns</p>
                                                <p>{applicant.pronouns ?? 'Not Provided'}</p>
                                            </div>
                                            <div>
                                                <p className='detail-header'>Major(s)</p>
                                                <div>
                                                    {applicant.majors.length > 0
                                                        ? applicant.majors.map(major => <p>{major.label}</p>)
                                                        : <p>Not Provided</p>
                                                    }
                                                </div>
                                            </div>
                                            <div>
                                                <p className='detail-header'>RIT Status</p>
                                                <p>{applicant.ritStatus ? RitStatus[applicant.ritStatus] : 'Not Provided'}</p>
                                            </div>
                                            <div>
                                                <p className='detail-header'>Location</p>
                                                <p>{applicant.location ?? 'Not Provided'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div id='skills-tags'>
                                        <h3>Skills</h3>
                                        <ul id='tags'>
                                            {applicant.skills.sort((a, b) => a.position - b.position).map(tag => <li><Tag type={tag.type.toLowerCase()} selected={true}>{tag.label}</Tag></li>)}
                                        </ul>
                                    </div>
                                    <div id='user-detail'>
                                        <h3>About Them</h3>
                                        <p>{applicant.bio ?? 'Not Provided'}</p>
                                    </div>
                                    <p>Their role will be <span id="role">{role?.label}</span></p>
                                    <div id="accept-invite-btns">
                                        <button id="decline-button" onClick={() => { handleMemberRequest('Declined') }}>Decline Application</button>
                                        <button onClick={() => { handleMemberRequest('Accepted') }}>Accept Application</button>
                                    </div>
                                </>
                                : <>
                                    <div className='placeholder-spacing'>
                                        <div className='spinning-loader'></div>
                                    </div>
                                </>
                            : <>
                                <p>Looks like you're in the wrong place. </p>
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

export default AcceptApplication;