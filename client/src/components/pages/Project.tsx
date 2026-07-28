import { useCallback, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Header, loggedIn } from "../Header";
import { Dropdown, DropdownButton, DropdownContent } from "../Dropdown";
import { ProjectCreatorEditor } from "../ProjectCreatorEditor/ProjectCreatorEditor";
import { Popup, PopupButton, PopupContent } from "../Popup";
import profileImage from "../../images/lfrog.png";
import { ProjectCarousel } from "../ProjectCarousel";
import * as paths from "../../constants/routes";
import { TeamPositionsPanel } from "../TeamPositionsPanel";
import { ShareButton } from "../ShareButton";
import { ThemeIcon } from "../ThemeIcon";
import { getByID, getVideos, projectApprovalRequestExists, deleteProject, requestProjectReview } from "../../api/projects";
import { Tag as TagElement } from "../Tag";
import Reporter from "../Reporter";
import {
  deleteProjectFollowing,
  addProjectFollowing,
  getProjectFollowing,
  leaveProject as leaveProjectApi,
} from "../../api/users";
import { leaveProject } from "../projectPageComponents/ProjectPageHelper";
import { MePrivate, ProjectPreview, ProjectVideo, ProjectWithFollowers, ProjectReport, UnapproveProjectInput } from "@looking-for-group/shared";
import { ProjectContext, ProjectStatus as ProjectStatusEnums, ProjectApprovalStatus as ApprovalStatus } from "@looking-for-group/shared/enums";
//import { router } from "../../../../server/src/api/routes/me.ts"
import { reportProject } from "../../api/projects";
import { getCurrentAccount } from "../../api/users";
import { approveProjectRequest, deleteProjectRequest, getReportedProjects, getUserAccessLevel, deleteProjectReport, takeDownProject, sendModeratorNotification, unapproveProject } from "../../api/mod-tools";

//Main component for the project page
/**
 * Project page. Renders the project page with all project details, team member information, and available positions.
 * @returns JSX Element
 */
const Project = () => {
  //Navigation hook
  const navigate = useNavigate();

  //Get project ID from search parameters
  const urlParams = new URLSearchParams(window.location.search);
  const projectID: number = Number(urlParams.get("projectID"));

  //state variable used to check whether or not data was successfully obtained from database
  // State variable used to determine permissions level, and if user should have edit access
  // const [userPerms, setUserPerms] = useState(-1);

  const [user, setUser] = useState<MePrivate | null>();
  const [userID, setUserID] = useState<number>(0);
  const [isUserAdmin, setIsUserAdmin] = useState<boolean>();

  const [displayedProject, setDisplayedProject] =
    useState<ProjectWithFollowers>();

  const [reportList, setReportList] = useState<ProjectReport[]>([]);

  type ApprovalStatusKey = keyof typeof ApprovalStatus;
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatusKey>('not-approved');

  const [followCount, setFollowCount] = useState(0);
  const [isFollowing, setFollowing] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [viewedPosition, setViewedPosition] = useState(0);

  const [shownTags, setShownTags] = useState(3);
  const [videos, setVideos] = useState<ProjectVideo[]>();

  const reportMessage = useRef<HTMLTextAreaElement>(null);
  const declineMessage = useRef<HTMLTextAreaElement>(null);
  const takeDownMessage = useRef<HTMLTextAreaElement>(null);
  const [reportResponseText, setReportResponseText] = useState<string>("");

  /**
   * Checks mod permissions for the user on render (in useEffect)
   */
  const getUserPermissions = async () => {
    /* Ensures the user is logged in */
    const userAccount = await getCurrentAccount();
    if (userAccount.status === 200 && userAccount.data?.userId) {
      setUserID(userAccount.data?.userId);
      /* User must have mod permissions to access mod page */
      const accessLevel = await getUserAccessLevel(userAccount.data.userId);
      if (accessLevel.data?.toString() == 'Moderator' || accessLevel.data?.toString() == 'Administrator') {
        setIsUserAdmin(true);
      }
    }
  };

  /**
   * Checks in the current user is following a project
   * @returns true if user is following the project
   */
  const checkFollow = useCallback(async () => {
    if (userID) {
      const followings = (await getProjectFollowing(userID)).data?.projects;

      let isFollow = false;

      if (followings !== undefined) {
        for (const follower of followings) {
          isFollow = follower.project.projectId === projectID;
          if (isFollow) break;
        }
      }
      setFollowing(isFollow);
      return isFollow;
    }
  }, [projectID, userID]);

  // Sets state variables
  const getProjectData = async (data: MePrivate | undefined) => {
    //get our current user for use later
    if (data) {
      setUser(data);
      setUserID(data.userId);
    }

    //get the project itself
    const projectResp = await getByID(projectID);
    if (projectResp.data) {
      setDisplayedProject(projectResp.data);

      /**
       * Checks if the project has been reported and updates the useState
       */
      const isProjectReported = async () => {
        const tempReportList: ProjectReport[] = [];
        const currentProject = projectResp.data as ProjectPreview;
        const reportedProjects = await getReportedProjects();
        if (reportedProjects.data !== null && reportedProjects.data !== undefined) {
          for (const report of reportedProjects.data) {
            if (report.projectId === currentProject.projectId && data?.userId !== report.userId) {
              tempReportList.push(report);
            }
          }
        }
        setReportList(tempReportList);
      };

      isProjectReported();
      checkFollow();
      setFollowCount(projectResp.data.followers.count);

      if (data) {
        for (const member of projectResp.data.members) {
          if (member.user.userId === data.userId) {
            setIsMember(true);
            return;
          }
        }
      }
    }
  };

  // Checks mod permissions
  useEffect(() => {
    getUserPermissions();
  }, [])

  // Fetch attached videos and check approval status (for now)
  useEffect(() => {
    async function fetchVideos() {
      const res = await getVideos(projectID);
      if (res.data) {
        setVideos(res.data);
      }
    }

    const checkApprovalRequest = async () => {
      try {
        const result = await projectApprovalRequestExists(projectID);

        // if the project is marked as approved -> status is "approved"
        // if not approved -> check if an approval request exists -> "under-review"
        // otherwise -> "not-approved"
        // so it's NORMAL to see 404s
        const status = displayedProject?.approved
          ? 'approved'
          : result
            ? 'under-review'
            : 'not-approved';

        setApprovalStatus(status);
      } catch {
        const status = displayedProject?.approved
          ? 'approved'
          : 'not-approved';

        setApprovalStatus(status);
      }
    };

    fetchVideos();

    if (isMember || isUserAdmin) {
      checkApprovalRequest();
    }

  }, [projectID, isMember, isUserAdmin]);

  // Approve a project request
  const handleApproveRequest = async () => {
    if (displayedProject) {
      setApprovalStatus("approved");
      const res = await approveProjectRequest(projectID, displayedProject);
      if (res.status === 204) {
        navigate(paths.routes.MODERATION);
      }
    }
  };

  //Checks to see whether or not the current user is the maker/owner of the project being displayed
  //oh do i need this too
  // const usersProject = true;

  /**
   * Formats the number of followers for display, converting large numbers to K format (e.g., 1.2K).
   * @param followers Total followers of the project
   * @returns String to display
   */
  const formatFollowCount = (followers: number): string => {
    const trim = (n: number) => {
      const s = n.toFixed(1);
      return s.endsWith(".0") ? s.slice(0, -2) : s;
    };
    if (followers < 10000) return `${followers}`;
    if (followers < 1_000_000) return `${Math.floor(followers / 1000)}k`;
    if (followers < 1_000_000_000) {
      const m = followers / 1_000_000;
      return `${m < 10 ? trim(m) : Math.floor(m)}M`;
    }
    const b = followers / 1_000_000_000;
    return `${b < 10 ? trim(b) : Math.floor(b)}B`;
  };

  /**
   * Follows a project and adds to the following count of the project.
   */
  const followProject = async () => {
    // Follow icon is only present if user is logged in.
    // If keeping this layout, this check may be redundant.
    if (!loggedIn) {
      navigate(paths.routes.LOGIN, { state: { from: location.pathname + location.search } }); // Redirect if logged out
    } else {
      const toggleFollow = !isFollowing;
      setFollowing(toggleFollow);
      if (toggleFollow) {
        setFollowCount(followCount + 1);
        await addProjectFollowing(projectID);
      } else {
        setFollowCount(followCount - 1);
        await deleteProjectFollowing(projectID);
      }
    }
  };

  checkFollow();

  /**
   * Deletes the project (owner only) and returns to the My Projects page.
   */
  const handleDeleteProject = async () => {
    const res = await deleteProject(projectID);
    if (res.status === 200) {
      navigate(paths.routes.MYPROJECTS);
    } else {
      console.error("Error deleting project:", res.error);
    }
  };


  /**
   * Resolves a project report
   * @param action The action to take on the report ('dismiss' or 'unapprove project')
   */
  const resolveReport = async (action: 'dismiss' | 'unapprove project') => {
    if (!reportList) return;

    //delete all the reports
    if (action === 'dismiss') {
      const res = await Promise.all(reportList.map(r => deleteProjectReport(r.reportId)));

      // send an update to reporter
      const notif = await Promise.all(reportList.map(r => sendModeratorNotification({
        modUserId: userID,
        receiverId: r.userId,
        subjectLine: `Update on Your Report on ${displayedProject?.title}`,
        message: 'Thank you for submitting your report. ' +
          'Our moderation team has completed its review. ' +
          'After carefully reviewing the information provided and any relevant evidence, ' +
          'we have determined that this report does not warrant moderation action at this time. ' +
          'As a result, the report has been dismissed.',
        type: 'General',
      })));

      if (res?.every(r => r.status === 200) && notif.every(r => r.status === 201)) {
        navigate(paths.routes.MODERATION);
      }
    } else if (action === 'unapprove project') {
      //unnaprove the project, then delete the reports
      const unapproveRes = await unapproveProject(
        projectID,
        {
          reason: takeDownMessage.current?.value ?? ''
        } as UnapproveProjectInput)

      const deleteRes = await Promise.all(reportList.map(r => deleteProjectReport(r.reportId)));

      const notif = await Promise.all(reportList.map(r => sendModeratorNotification({
        modUserId: userID,
        receiverId: r.userId,
        subjectLine: `Update on Your Report on ${displayedProject?.title}`,
        message: 'Thank you for submitting your report. ' +
          'After reviewing the reported project, ' +
          'our moderation team determined that it violated our community guidelines ' +
          'and the project has been removed from public view.',
        type: 'General',
      })));

      if (unapproveRes.status === 200
        && deleteRes?.every(r => r.status === 200)
        && notif.every(r => r.status === 201)) {
        navigate(paths.routes.MODERATION);
      }
    } else {
      console.error(`Unknown action: ${action}`);
    }
  };

  /**
   * Leaves the project and returns to the My Projects page.
   */
  const handleLeaveProject = async () => {
    const res = await leaveProjectApi(projectID);
    if (res.status === 200) {
      navigate(paths.routes.MYPROJECTS);
    } else {
      console.error("Error leaving project:", res.error);
    }
  };

  /**
   * Decline a pending project request
   * @param message The message sent to the user about why their project was declined
   * if (displayedProject) {
      setApprovalStatus("approved");
      await approveProjectRequest(projectID, displayedProject, userID ? userID : -1);
    }
   */
  const handleDeleteProjectRequest = async (message: string) => {
    if (displayedProject) {
      setApprovalStatus('not-approved');
      const res = await deleteProjectRequest(projectID, message);
      if (res.status === 204) {
        navigate(paths.routes.MODERATION);
      }
    }
  };

  /**
   * Sends a report of the project if no report exists and
   * tells the user the result
   */
  const reportProjectPressed = async () => {
    /* a loop hole around an empty string */
    let message = "";
    if (reportMessage?.current?.value == "") {
      message = "No message given.";
    }
    else {
      message = reportMessage?.current?.value ?? "No message given.";
    }

    const response = await reportProject(projectID, message);
    let responseText = response.error;
    if (responseText === null || responseText === undefined) {
      responseText = "Your report was sent! Your request will be processed and receive an update shortly.";
    }
    /* A report on the project already exists */
    else if (response.status === 409) {
      responseText = "This project has already been reported!";
    }
    else {
      responseText = "Uh oh! Something went wrong with your report!";
    }
    setReportResponseText(responseText);
  };

  //HTML elements containing buttons used in the info panel
  //Change depending on who's viewing the project page (Outside user, project member, project owner, etc.)
  const buttonContent =
    user && displayedProject?.owner.userId === user.userId ? (
      <>
        <ProjectCreatorEditor
          mobileView={false} //error being caused by this prop not being passed in, but it also isn't used in the component at all, sooooo
          newProject={false}
          updateDisplayedProject={setDisplayedProject}
        /*permissions={userPerms}*/
        />

        {approvalStatus == 'not-approved' ?
                <Popup>
                  {/* Request Review button */}
                  <PopupButton buttonId='project-info-request'>
                    {/* <ThemeIcon
                      id={"request-review"}
                      width={27}
                      height={27}
                      ariaLabel={"request-Review"}
                      className="mono-fill"
                    /> */}
                    Request Review
                  </PopupButton>
                  <PopupContent>
                    <div className="small-popup">
                      <div id="project-request-review">
                        <label id="project-request-label">
                          Would you like to submit your project for review?
                        </label>
                        <div id="project-request-info">
                          Submiting a request will make your project visible to moderators who will choose to either
                          accept and make your project visible to all, request changes for you to make,
                          or reject it for various reasons. <br />
                          <strong>(moderators are not capable of directly altering or deleting your projects)</strong>
                        </div>
                        <div id="project-request-buttons">
                          <PopupButton buttonId="request-confirm-button"
                            callback={() => {
                              if (displayedProject) requestProjectReview(projectID);
                              setApprovalStatus("under-review");
                            }}
                          >
                            Request Review
                          </PopupButton>
                          <PopupButton buttonId="request-cancel-button">
                            Cancel
                          </PopupButton>
                        </div>
                      </div>
                    </div>
                  </PopupContent>
                </Popup> : ""}

        {/* Owner options: leave or delete the project */}
        <Dropdown>
          <DropdownButton className="project-info-dropdown-btn">
            <ThemeIcon
              id={"menu"}
              width={40}
              height={40}
              className={"color-fill dropdown-menu"}
              ariaLabel={"More options"}
            />
          </DropdownButton>
          <DropdownContent rightAlign={true}>
            <div id="project-info-dropdown">
              {/* Share Button */}
              <ShareButton />
              {/* Leave Project */}
              <Popup>
                <PopupButton className="project-info-dropdown-option">
                  <ThemeIcon
                    id={"logout"}
                    width={27}
                    height={27}
                    ariaLabel={"Leave project"}
                    className="mono-fill"
                  />
                  Leave
                </PopupButton>
                <PopupContent>
                  <div className="small-popup">
                    <h3>Leave Project</h3>
                    <p className="confirm-msg">
                      Are you sure you want to leave{" "}
                      <span className="project-info-highlight">
                        {displayedProject?.title}
                      </span>
                      ? You won't be able to rejoin unless you're re-added by a
                      project member.
                    </p>
                    <div className="confirm-deny-btns">
                      <PopupButton
                        className="confirm-btn"
                        callback={handleLeaveProject}
                      >
                        Leave
                      </PopupButton>
                      <PopupButton className="deny-btn">Cancel</PopupButton>
                    </div>
                  </div>
                </PopupContent>
              </Popup>

              {/* Delete Project */}
              <Popup>
                <PopupButton className="project-info-dropdown-option">
                  <ThemeIcon
                    id={"trash"}
                    width={27}
                    height={27}
                    ariaLabel={"Delete project"}
                    className="mono-stroke"
                  />
                  Delete
                </PopupButton>
                <PopupContent>
                  <div className="small-popup">
                    <h3>Delete Project</h3>
                    <p className="confirm-msg">
                      Are you sure you want to delete{" "}
                      <span className="project-info-highlight">
                        {displayedProject?.title}
                      </span>
                      ? This action cannot be undone.
                    </p>
                    <div className="confirm-deny-btns">
                      <PopupButton
                        className="confirm-btn delete-button"
                        callback={handleDeleteProject}
                      >
                        Delete
                      </PopupButton>
                      <PopupButton className="deny-btn">Cancel</PopupButton>
                    </div>
                  </div>
                </PopupContent>
              </Popup>
            </div>
          </DropdownContent>
        </Dropdown>
      </>
    ) : (
      (
        <>
          {/* Heart icon, with number indicating follows */}
          <div className="project-info-followers">
            <p className={`follow-amt ${isFollowing ? "following" : ""}`}>
              {formatFollowCount(followCount)}
            </p>
            {isFollowing ? (
              <ThemeIcon
                width={28}
                height={25}
                id={"heart-filled"}
                ariaLabel="following"
                onClick={followProject}
              />
            ) : (
              <ThemeIcon
                width={28}
                height={25}
                id={"heart-empty"}
                ariaLabel="following"
                onClick={followProject}
              />
            )}
          </div>
          {/* Share, leave, and report dropdown */}
          <Dropdown>
            <DropdownButton className="project-info-dropdown-btn">
              <ThemeIcon
                id={"menu"}
                width={40}
                height={40}
                className={"color-fill dropdown-menu"}
                ariaLabel={"More options"}
              />
            </DropdownButton>
            <DropdownContent rightAlign={true}>
              <div id="project-info-dropdown">
                <ShareButton />

                {/* Only be able to leave if you're a member of the project */}
                {isMember ?
                  <Popup>
                    <PopupButton className="project-info-dropdown-option">
                      <ThemeIcon
                        id={"logout"}
                        width={27}
                        height={27}
                        ariaLabel={"Leave project"}
                        className="mono-fill"
                      />
                      Leave
                    </PopupButton>
                    <PopupContent>
                      <div className="small-popup">
                        <h3>Leave Project</h3>
                        <p className="confirm-msg">
                          Are you sure you want to leave this project? You won't
                          be able to rejoin unless you're re-added by a project
                          member.
                        </p>
                        <div className="confirm-deny-btns">
                          <PopupButton
                            className="confirm-btn"
                            callback={leaveProject}
                          >
                            Confirm
                          </PopupButton>
                          <PopupButton className="deny-btn">Cancel</PopupButton>
                        </div>
                      </div>
                    </PopupContent>
                  </Popup>
                  :
                  <></>
                }
                <Popup>
                  <PopupButton
                    className="project-info-dropdown-option"
                  >
                    <ThemeIcon
                      id={"warning"}
                      width={27}
                      height={27}
                      ariaLabel={"Report"}
                    />
                    Report
                  </PopupButton>
                  <PopupContent>
                    <div className="small-popup" id="report-popup">
                      <h3>Report {displayedProject?.title ?? "Project"}</h3>
                      <p>You are about to report {displayedProject?.title ?? "Project"}. Please provide your reasoning below.</p>
                      <textarea placeholder="Write your reasoning here..." className="input input-multiline" ref={reportMessage}></textarea>
                      <div className="confirm-deny-btns">
                        <PopupButton
                          buttonId="team-delete-member-cancel-button"
                          className="button-reset"
                        >
                          Cancel
                        </PopupButton>
                        {/* The Report Button */}
                        <Popup>
                          <PopupButton
                            className="delete-button"
                            callback={reportProjectPressed}
                            closeParent={() => true}> {/* doesnt work*/}
                            Report
                          </PopupButton>
                          <PopupContent>
                            <div className="small-popup">
                              <p>{reportResponseText}</p>
                              <PopupButton buttonId="continue-button" closeParent={() => true}>
                                Continue
                              </PopupButton>
                            </div>
                          </PopupContent>
                        </Popup>
                      </div>
                    </div>
                  </PopupContent>
                </Popup>
              </div>
            </DropdownContent>
          </Dropdown>
        </>
      )
    );

  //Lists of users who have worked on this project
  //Members - people who actively work on the project
  // const projectMembers = displayedProject === undefined ? [] : displayedProject.members;
  const projectMembers = displayedProject?.members;
  //Contributors - people who have helped, but aren't actively working on the project
  // const projectContributors = [];
  //People list holds whatever list is currently being displayed
  //const [peopleList, setPeopleList] = useState(displayedProject === undefined ? [] : displayedProject.members);

  //HTML containing info on the members of the project

  const peopleContent =
    projectMembers && projectMembers.length > 0 ? (
      <>
        {projectMembers?.map((member) => {
          // Don't show users that chose to hide themselves as a member of this project
          // if (user.visibility !== 'public') {         // changed from user.profile_visibility; possible break
          //   return (
          //     <></>
          //   );
          // }
          const memberUser = member.user; //so i don't have to go user.user.userId or anything

          // Use placeholder image if user does not have a profile picture
          let userProfile = memberUser.profileImage
          if (!memberUser.profileImage) {
            userProfile = profileImage;
          }

          return (
            <a
              key={memberUser.userId}
              className="project-contributor"
              href={`${paths.routes.PROFILE}?userID=${memberUser.userId}`}
            >
              <img
                className="project-contributor-profile"
                src={userProfile!}
                alt="contributor profile"
                onError={(e) => {
                  const profileImg = e.target as HTMLImageElement;
                  profileImg.src = profileImage;
                }}
              />
              <div className="project-contributor-info">
                <div className="team-member-name">
                  {memberUser.firstName} {memberUser.lastName}
                </div>
                <div className="team-member-role">{member.role.label}</div>
              </div>
            </a>
          );
        })}
      </>
    ) : (
      <div>Somehow, there are no team members.</div>
    );

  //FIXME: contributors are not implemented in the database or within the project editor: implement or remove feature
  //HTML containing info on people who have contributed to the project (not necessarily members)
  // const contributorContent =
  //   projectContributors !== undefined ? (
  //     projectContributors.length > 0 ? (
  //       <>
  //         {projectContributors.map((user) => {
  //           const imgSrc = useProfileImage(user);

  //           return (
  //             <div
  //               className="project-contributor"
  //               onClick={() =>
  //                 navigate(`${paths.routes.PROFILE}?userID=${user.userId}`)
  //               }
  //             >
  //               <img
  //                 className="project-contributor-profile"
  //                 src={imgSrc}
  //                 alt="contributor profile"
  //               />
  //               <div className="project-contributor-info">
  //                 <div>
  //                   {user.firstName} {user.lastName}
  //                 </div>
  //                 <div>{user.jobTitle}</div>
  //               </div>
  //             </div>
  //           );
  //         })}
  //       </>
  //     ) : (
  //       <div>There are no other contributors right now.</div>
  //     )
  //   ) : (
  //     <div>There are no other contributors right now.</div>
  //   );

  //State variable that tracks whether project members or contributors will be displayed
  //uncomment when contributors exist in the database
  // const [displayedPeople, setDisplayedPeople] = useState("People");

  //Variable holding either 'peopleContent' or 'contributorContent', depending on 'displayedPeople' state (seen above)
  // const profileContent =
  //   displayedPeople === "People" ? (
  //     peopleContent
  //   ) : (
  //     <div>There are no other contributors right now.</div>
  //   );

  /**
   * Opens the position details panel.
   * NOTE: This should really be done differently, and the position details panel should really be separated
   * into it's own component.
   */
  const openOpenPositionsPanel = () => {
    const button = document.getElementById("project-open-positions-button");
    if (button) {
      button.click();
    }
  };

  /**
   * Sets the viewed position and triggers the popup to display the selected open position details.
   * @param positionNumber The position to open the popup to
   */
  const openPositionListing = (positionNumber: number) => {
    //Set state to position being clicked
    //Call Popup open function from other button
    setViewedPosition(positionNumber);
    openOpenPositionsPanel();
  };

  //Find first member with the job title of 'Project Lead'
  //If no such member exists, use first member in project member list
  const projectLead = displayedProject?.owner;

  //Page layout for if project data hasn't been loaded yet
  const loadingProject = (
    <div className='placeholder-spacing'>
      <div className='spinning-loader'></div>
    </div>
  );

  return (
    <div className="page">
      <Header
        dataSets={[{ data: [] }]}
        onSearch={() => { }}
        hideSearchBar={true}
        value={undefined}
        onChange={undefined}
        setCurrentUserId={getProjectData}
        hideBackButton={false}
        placeholderText=''
      />

      {displayedProject === undefined ? (
        loadingProject
      ) : (
        <main id="main" tabIndex={-1} aria-label="main content" >
          <div id="project-page-content">
            <ProjectCarousel project={displayedProject} videos={videos}></ProjectCarousel>
            <div id="project-info-panel">
              <div id="project-info-top">
                <div id="project-info-header">
                  <div id="project-title">{displayedProject.title}</div>
                  <div id="project-info-buttons">{buttonContent}</div>
                </div>
                <div id="project-hook">{displayedProject.hook}</div>
                {isMember && (
                  <div id="project-approval-status">
                    <p>
                      Approval Status:{" "}
                      <span className="project-info-highlight">
                        {ApprovalStatus[approvalStatus]}
                      </span>
                    </p>
                  </div>
                )}
                <div id="project-status">
                  <p>
                    Status:{" "}
                    <span className="project-info-highlight">
                      {ProjectStatusEnums[displayedProject.status]}
                    </span>
                  </p>
                </div>
                <div id="project-creation">
                  Created by:{" "}
                  <span className="project-info-highlight">
                    <a href={`${paths.routes.PROFILE}?userID=${projectLead?.userId}`}>
                      {projectLead?.firstName} {projectLead?.lastName}
                    </a>
                  </span>
                  <br />
                  {new Date(
                    displayedProject.createdAt.toString()
                  ).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                {displayedProject.jobs.length > 0 ?
                  <Popup>
                    <PopupButton buttonId="project-open-positions-button">
                      Open Positions
                    </PopupButton>
                    <PopupContent>
                      <TeamPositionsPanel currentUserId={userID} displayedProject={displayedProject}
                        viewedPosition={viewedPosition} setViewedPosition={setViewedPosition} />
                    </PopupContent>
                  </Popup>
                  : ""}
              </div>
              <div id="project-tags">
                <div id="tags">
                  {
                    //If more tag types are usable, use commented code for cases
                    //Also, check to see how many additional tags a project has
                    displayedProject.tags.map((tag, index) => {
                      /* let category : string;
                      switch (tag.type) {
                      } */
                      if (index < shownTags) {
                        return (
                          <TagElement
                            type={tag.type.toLowerCase()}
                            key={index} selected={true}
                          >
                            <p>{tag.label}</p>
                          </TagElement>
                        );
                      }
                    })
                  }
                </div>
                {shownTags === 999 ?
                  <button key={shownTags} className="tag-contract" onClick={() => setShownTags(3)}>
                    <p>-</p>
                  </button>
                  :
                  displayedProject.tags.length > 3 ?
                    <button key={shownTags} className="tag-extend" onClick={() => setShownTags(999)}>
                      <p>+</p>
                    </button>
                    : ""}
              </div>
            </div>

            {/* Project overview section */}
            <div id="project-overview">
              <div id="project-overview-title">Project Overview</div>
              <div id="project-overview-text">{displayedProject.description}</div>
              {/* Sections could also be added with some extra function, 
                title and content can be assigned to similar elements */}
              {displayedProject.context && (
                <>
                  <div className="project-overview-section-header">Context</div>
                  <div>{ProjectContext[displayedProject.context]}</div>
                </>
              )}
              {displayedProject.audience?.trim() && (
                <>
                  <div className="project-overview-section-header">
                    Target Audience
                  </div>
                  <div>{displayedProject.audience}</div>
                </>
              )}
              <div id="project-overview-links-section">
                {displayedProject.projectSocials.length > 0 ? (
                  <>
                    Keep up with us!
                    <div id="project-overview-links">
                      {displayedProject.projectSocials.map((social, index) => (
                        <a
                          key={index}
                          href={social.url}
                          target="_blank"
                        >
                          <ThemeIcon
                            id={
                              social.label === "Other"
                                ? "link"
                                : social.label.toLowerCase()
                            }
                            width={25}
                            height={25}
                            className={"mono-fill"}
                            ariaLabel={social.label}
                          />
                          {social.alias}
                        </a>
                      ))}
                    </div>
                  </>
                ) : (
                  <p>No social links yet</p>
                )}
              </div>
            </div>

            <div id="project-open-positions">
              <div className="centerer">
                {displayedProject.jobs.length > 0 ?
                  // <button id="project-open-positions-header" onClick={openOpenPositionsPanel}>Open Positions</button>
                  <div id="project-people-tab">Open Positions</div>
                  : ""}
              </div>

              <div id="project-open-positions-list">
                {displayedProject.jobs.map((position, index) => (
                  <button
                    className="project-tag-label label-position"
                    onClick={() => openPositionListing(index)}
                    key={index}
                  >
                    {position.role.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mod options to approveor reject a project request (request edits in order to approve) */}
            {isUserAdmin && approvalStatus == 'under-review' && userID !== displayedProject.owner.userId ? <div className="mod-project-options">
              <h4>Project Review Request</h4>
              <p>You can approve this project and it will show up in the public view from now on or request changes by declining the request.</p>
              <div id="mod-options-btns">
                <button id="mod-approve-btn" onClick={() => { if (displayedProject) { handleApproveRequest(); } }}>Approve</button>
                <Popup>
                  <PopupButton className="delete-button">Decline</PopupButton>
                  <PopupContent>
                    <div className="small-popup" id="report-popup">
                      <h3>Decline Approval Request</h3>
                      <p>What changes should be made to <strong>{displayedProject?.title}</strong> in order to receive approval?</p>
                      <textarea placeholder="Write the requested changes here..." className="input input-multiline" ref={declineMessage}></textarea>
                      <div className="confirm-deny-btns">
                        <PopupButton
                          buttonId="request-decline-button"
                          className="button-reset"
                        >
                          Cancel
                        </PopupButton>
                        <button className="confirm-btn" onClick={() => { handleDeleteProjectRequest(declineMessage?.current ? declineMessage.current.value : "No message provided."); }}>Submit</button>
                      </div>
                    </div>
                  </PopupContent>
                </Popup>
              </div>
            </div>
              : ""}

            {/* Mod options to accept, decline, or request changes to a reported project // are we doing edits on reported projects?  */}
            {isUserAdmin && reportList.length !== 0 && userID !== displayedProject.owner.userId ? (
              <div className="mod-project-options">
                <h4>Reports</h4>
                <p>You can dismiss this report or request edits. Requesting edits will remove the project from public view until the requested changes have been made and approved.</p>
                {reportList.map(r => <Reporter modUserId={userID} reporterId={r.userId} reason={r.reason} key={'reporter-' + r.userId} />)}
                <div className="mod-options-btns">
                  <button id="mod-dismiss-btn" onClick={() => resolveReport('dismiss')}>Dismiss Report</button>
                  <Popup>
                    <PopupButton className="mod-edit-btn">Request Edits</PopupButton>
                    <PopupContent>
                      <div className="small-popup" id="report-popup">
                        <h3>Request Edits</h3>
                        <p>Explain what the user should change about their project. Their project will be taken down from public view until the requested changes have been made and approved.</p>
                        <textarea placeholder="Write your reasoning here..." className="input input-multiline" ref={takeDownMessage}></textarea>
                        <div className="confirm-deny-btns">
                          <PopupButton
                            buttonId="edits-cancel-button"
                            className="button-reset"
                          >
                            Cancel
                          </PopupButton>
                          <button className="confirm-btn" onClick={() => resolveReport('unapprove project')}>Submit</button>
                        </div>
                      </div>
                    </PopupContent>
                  </Popup>
                </div>
              </div>
            ) : ""}

            <div id="project-people">
              <div id="project-people-tabs">
                <div id="project-people-tab" // Turn this into a button after onclick is restored (involved Contributor functionality). Cursor style is commented out for now

                //onClick={() => setDisplayedPeople("People")} wow this button is now useless
                >
                  The Team
                </div>
                {/* If contributors are added as a site feature, use the commented code below */}
                {/* <button className={`project-people-tab ${displayedPeople === 'Contributors' ? 'project-people-tab-active' : ''}`} onClick={(e) => setDisplayedPeople('Contributors')}>Contributors</button> */}
              </div>
              <div id="project-people-content">{peopleContent}</div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default Project;
