import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header, loggedIn } from "../Header";
import { Dropdown, DropdownButton, DropdownContent } from "../Dropdown";
import { ProjectCreatorEditor } from "../ProjectCreatorEditor/ProjectCreatorEditor";
import { Popup, PopupButton, PopupContent } from "../Popup";
import profileImage from "../../images/blue_frog.png";
import { ProjectCarousel } from "../ProjectCarousel";
import * as paths from "../../constants/routes";
import { ThemeIcon } from "../ThemeIcon";
import { getByID } from "../../api/projects";
import {
  getCurrentAccount,
  deleteProjectFollowing,
  addProjectFollowing,
  getProjectFollowing,
} from "../../api/users";
import { leaveProject } from "../projectPageComponents/ProjectPageHelper";
import { MePrivate, ProjectWithFollowers } from "@looking-for-group/shared";
import {
  JobAvailability as JobAvailabilityEnums,
  JobDuration as JobDurationEnums,
  JobLocation as JobLocationEnums,
  JobCompensation as JobCompensationEnums,
  ProjectStatus as ProjectStatusEnums,
} from "@looking-for-group/shared/enums";

//Main component for the project page
/**
 * Project page. Renders the project page with all project details, team member information, and available positions.
 * @returns JSX Element
 */
const NewProject = () => {
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
  const [displayedProject, setDisplayedProject] =
    useState<ProjectWithFollowers>();

  const [followCount, setFollowCount] = useState(0);
  const [isFollowing, setFollowing] = useState(false);

  /**
   * Checks in the current user is following a project
   * @returns true if user is following the project
   */
  const checkFollow = useCallback(async () => {
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
  }, [projectID, userID]);

  // Sets state variables
  useEffect(() => {
    const getProjectData = async () => {
      //get our current user for use later
      const userResp = await getCurrentAccount();
      if (userResp.data) {
        setUser(userResp.data);
        setUserID(userResp.data.userId);
      }

      //get the project itself
      const projectResp = await getByID(projectID);
      if (projectResp.data) {
        setDisplayedProject(projectResp.data);
        checkFollow();
        setFollowCount(projectResp.data.followers.count);
      }
    };
    getProjectData();
  }, [projectID, checkFollow]);

  //Checks to see whether or not the current user is the maker/owner of the project being displayed
  //oh do i need this too
  // const usersProject = true;

  /**
   * Formats the number of followers for display, converting large numbers to K format (e.g., 1.2K).
   * @param followers Total followers of the project
   * @returns String to display
   */
  const formatFollowCount = (followers: number): string => {
    if (followers >= 1000) {
      const multOfHundred = followers % 100 === 0;
      const formattedNum = (followers / 1000).toFixed(1);
      return `${formattedNum}K ${multOfHundred ? "+" : ""}`;
    }
    return `${followers}`;
  };

  /**
   * Follows a project and adds to the following count of the project.
   */
  const followProject = async () => {
    // Follow icon is only present if user is logged in.
    // If keeping this layout, this check may be redundant.
    if (!loggedIn) {
      navigate(paths.routes.LOGIN, { state: { from: location.pathname } }); // Redirect if logged out
    } else {
      const toggleFollow = !(await checkFollow());
      setFollowing(toggleFollow);
      if (toggleFollow) {
        await addProjectFollowing(projectID);
        setFollowCount(followCount + 1);
      } else {
        await deleteProjectFollowing(projectID);
        setFollowCount(followCount - 1);
      }
    }
  };

  //HTML elements containing buttons used in the info panel
  //Change depending on who's viewing the project page (Outside user, project member, project owner, etc.)
  const buttonContent =
    user && displayedProject?.owner.userId === user.userId ? (
      <>
        {
          <>
            <ProjectCreatorEditor
              newProject={false}
              updateDisplayedProject={setDisplayedProject}
              /*permissions={userPerms}*/
            />
          </>
        }
      </>
    ) : (
      user && (
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
                width={25}
                height={25}
                className={"color-fill dropdown-menu"}
                ariaLabel={"More options"}
              />
            </DropdownButton>
            <DropdownContent rightAlign={true}>
              <div id="project-info-dropdown">
                {/* TODO: Add functionality to share. Probably copy link to clipboard. Should also alert user */}
                <button className="project-info-dropdown-option">
                  <ThemeIcon
                    id={"share"}
                    width={27}
                    height={27}
                    ariaLabel={"Share project"}
                    className="mono-fill"
                  />
                  Share
                </button>
                {/* Only be able to leave if you're a member of the project */}
                {/* {userPerms === 0 ? ( */}
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
                <button
                  className="project-info-dropdown-option"
                  id="project-info-report"
                >
                  <ThemeIcon
                    id={"warning"}
                    width={27}
                    height={27}
                    ariaLabel={"Report"}
                  />
                  Report
                </button>
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

          return (
            <div
              key={memberUser.userId}
              className="project-contributor"
              onClick={() =>
                navigate(`${paths.routes.PROFILE}?userID=${memberUser.userId}`)
              }
            >
              <img
                className="project-contributor-profile"
                src={memberUser.profileImage ?? profileImage}
                alt="contributor profile"
                // Cannot use usePreloadedImage function because this is in a callback
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
            </div>
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
    if (button)  {
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


  //State variable used to track which position is currently being viewed in the popup
  const [viewedPosition, setViewedPosition] = useState(0);

  //Find first member with the job title of 'Project Lead'
  //If no such member exists, use first member in project member list
  const projectLead = displayedProject?.owner;

  //Page layout for if project data hasn't been loaded yet
  const loadingProject = <>{<div>Loading project...</div>}</>;

  return (
    <div className="page">
      <Header
        dataSets={[{ data: [] }]}
        onSearch={() => {}}
        hideSearchBar={true}
        value={undefined}
        onChange={undefined}
      />

      {displayedProject === undefined ? (
        loadingProject
      ) : (
        <div id="project-page-content">
          {/* May need to adjust width/height styles to account for description/carousel sizes */}
          {/* <div id="project-image-carousel">
            <ImageCarousel carouselType="Project" dataList={displayedProject.images} />
          </div> */}
          <ProjectCarousel project={displayedProject}></ProjectCarousel>

          <div id="project-info-panel">
            <div id="project-info-top">
              <div id="project-info-header">
                <div id="project-title">{displayedProject.title}</div>
                <div id="project-info-buttons">{buttonContent}</div>
              </div>
              <div id="project-hook">{displayedProject.hook}</div>
              <div id="project-status">
                <p>
                  Status:{" "}
                  <span className="project-info-highlight">
                    {ProjectStatusEnums[displayedProject.status]}
                  </span>
                </p>
                <Popup>
                  <PopupButton buttonId="project-open-positions-button">
                    Open Positions
                  </PopupButton>
                  <PopupContent>
                    <div id="project-open-positions-popup">
                      <div id="positions-popup-header">Join The Team</div>

                      {/* Left Container */}
                      <div id="project-team-open-positions-popup">
                        <div className="positions-popup-list">
                          <p className="positions-popup-info-title">
                            Open Positions
                          </p>
                          <div id="team-positions-popup-list-buttons">
                            {displayedProject.jobs?.map((job, index) => (
                              <button
                                className={`positions-popup-list-item`}
                                id={
                                  index === viewedPosition
                                    ? "positions-popup-list-item-active"
                                    : ""
                                }
                                onClick={() => setViewedPosition(index)}
                                key={index}
                              >
                                {job.role.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Container */}
                      <div className="positions-popup-info-wrapper">
                        <div className="positions-popup-info">
                          <div className="positions-popup-info-title">
                            {displayedProject.jobs[viewedPosition]?.role
                              ?.label ?? undefined}
                          </div>

                          <div id="position-description-header">
                            What we are looking for:
                          </div>

                          <div
                            id="position-description-content"
                            className="positions-popup-info-description"
                          >
                            {displayedProject.jobs[viewedPosition]?.description}
                          </div>

                          <div id="open-position-details">
                            <div id="open-position-details-left">
                              <div id="position-availability">
                                <span className="position-detail-indicator">
                                  Availability:{" "}
                                </span>
                                {
                                  JobAvailabilityEnums[
                                    displayedProject.jobs[viewedPosition]
                                      ?.availability
                                  ]
                                }
                              </div>
                              <div id="position-location">
                                <span className="position-detail-indicator">
                                  Location:{" "}
                                </span>
                                {
                                  JobLocationEnums[
                                    displayedProject.jobs[viewedPosition]
                                      ?.location
                                  ]
                                }
                              </div>
                            </div>

                            <div id="open-position-details-right">
                              <div id="position-duration">
                                <span className="position-detail-indicator">
                                  Duration:{" "}
                                </span>
                                {
                                  JobDurationEnums[
                                    displayedProject.jobs[viewedPosition]
                                      ?.duration
                                  ]
                                }
                              </div>
                              <div id="position-compensation">
                                <span className="position-detail-indicator">
                                  Compensation:{" "}
                                </span>
                                {
                                  JobCompensationEnums[
                                    displayedProject.jobs[viewedPosition]
                                      ?.compensation
                                  ]
                                }
                              </div>
                            </div>
                          </div>
                        </div>

                        <div id="position-contact">
                          If interested, please contact:{" "}
                          <span
                            onClick={() =>
                              navigate(
                                `${paths.routes.PROFILE}?userID=${projectLead?.userId}`
                              )
                            }
                            id="position-contact-link"
                          >
                            {/* {FIXME: get project lead profile image in a different way} */}
                            {/* <img src={(projectLead?.profile_image) 
                            ? `images/profiles/${projectLead?.profile_image}` 
                            : profilePicture} 
                          /> */}
                            {projectLead?.firstName} {projectLead?.lastName}
                          </span>
                        </div>
                      </div>

                      <PopupButton buttonId="positions-popup-close">
                        Close
                      </PopupButton>
                    </div>
                  </PopupContent>
                </Popup>
              </div>
              <div id="project-creation">
                Created by:{" "}
                <span className="project-info-highlight">
                  {projectLead?.firstName} {projectLead?.lastName}
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
            </div>
            <div id="project-tags">
              {
                //If more tag types are usable, use commented code for cases
                //Also, check to see how many additional tags a project has
                displayedProject.tags.map((tag, index) => {
                  /* let category : string;
                  switch (tag.type) {
                  } */
                  if (index < 3) {
                    return (
                      <div
                        className={`project-tag-label label-green`}
                        key={index}
                      >
                        {tag.label}
                      </div>
                    );
                  } else if (index === 3) {
                    return (
                      <div className="project-tag-label label-grey" key={index}>
                        +{displayedProject.tags.length - 3}
                      </div>
                    );
                  }
                })
              }
            </div>
          </div>

          {/* Project overview section */}
          <div id="project-overview">
            <div id="project-overview-title">About This Project</div>
            <div id="project-overview-text">{displayedProject.description}</div>
            {/* Sections could also be added with some extra function, 
          title and content can be assigned to similar elements */}
            <div className="project-overview-section-header">Purpose</div>
            <div>{displayedProject.purpose}</div>
            <div className="project-overview-section-header">
              Target Audience
            </div>
            <div>{displayedProject.audience}</div>
            <div id="project-overview-links-section">
              {displayedProject.projectSocials.length > 0 ? (
                <>
                  Keep up with us!
                  <div id="project-overview-links">
                    {displayedProject.projectSocials.map((social, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          window.open(social.url, "_blank");
                        }}
                      >
                        <ThemeIcon
                          id={
                            social.label === "Other"
                              ? "link"
                              : social.label.toLowerCase()
                          }
                          width={25}
                          height={25}
                          className={"color-fill"}
                          ariaLabel={social.label}
                        />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p>No contacts yet</p>
              )}
            </div>
          </div>

          <div id="project-people">
            <div id="project-people-tabs">
              <div // Turn this into a button after onclick is restored (involved Contributor functionality). Cursor style is commented out for now
                className={`project-people-tab ${peopleContent}`}
                //onClick={() => setDisplayedPeople("People")} wow this button is now useless
              >
                The Team
              </div>
              {/* If contributors are added as a site feature, use the commented code below */}
              {/* <button className={`project-people-tab ${displayedPeople === 'Contributors' ? 'project-people-tab-active' : ''}`} onClick={(e) => setDisplayedPeople('Contributors')}>Contributors</button> */}
            </div>
            <div id="project-people-content">{peopleContent}</div>
          </div>

          <div id="project-open-positions">
            <button id="project-open-positions-header" onClick={openOpenPositionsPanel}>Open Positions</button>
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
        </div>
      )}
    </div>
  );
};

export default NewProject;
