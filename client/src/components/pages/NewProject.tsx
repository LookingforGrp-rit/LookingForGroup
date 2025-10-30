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

//TODO
//✅ Have team member listings link to their respective profiles
//Ensure 'ProjectCreatorEditor' component is complete and works on this page for project editing (import found above)


//Main component for the project page
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
  const [displayedProject, setDisplayedProject] = useState<ProjectWithFollowers>();

  const [followCount, setFollowCount] = useState(0);
  const [isFollowing, setFollowing] = useState(false);

  // API FUNCTIONS (/PROJECTS/)

  // FETCHING PROJECTS DATA

  //Function used to get project data
  
  
  //checking function for if the current user is following a project
const checkFollow = useCallback(async () => {
  const followings = (await getProjectFollowing(userID)).data?.projects;

  let isFollow = false;

  if(followings !== undefined){
  for (const follower of followings){
    isFollow = (follower.project.projectId === projectID);
    if(isFollow) break;
  }
  }
  setFollowing(isFollow);
  return isFollow;
}, [projectID, userID]);

useEffect(() => {
  const getProjectData = async () => {
    //get our current user for use later
    const userResp = await getCurrentAccount();
    if(userResp.data) { 
      setUser(userResp.data);
      setUserID(userResp.data.userId)
    }

    //get the project itself
    const projectResp = await getByID(projectID);
    if (projectResp.data) { 
      setDisplayedProject(projectResp.data)
      checkFollow();
      setFollowCount(projectResp.data.followers.count);
    }
  };
    getProjectData();
}, [projectID, checkFollow])

  
    //Checks to see whether or not the current user is the maker/owner of the project being displayed
    //oh do i need this too
  // const usersProject = true;

  // Formats follow-count based on Figma design. Returns a string
  // Formats follow-count based on Figma design. Returns a string
  const formatFollowCount = (followers: number): string => {
    if (followers >= 1000) {
      const multOfHundred = (followers % 100) === 0;
      const formattedNum = (followers / 1000).toFixed(1);
      return `${formattedNum}K ${multOfHundred ? '+' : ''}`;
    }
    return `${followers}`;
  };

  const followProject = (async () => {
    if (!loggedIn) {
      navigate(paths.routes.LOGIN, { state: { from: location.pathname } }); // Redirect if logged out
    }
    else{
    const toggleFollow = !await checkFollow();
    setFollowing(toggleFollow);
      if (toggleFollow) {
      await addProjectFollowing(projectID);
        setFollowCount(followCount + 1);
    } else {
      await deleteProjectFollowing(projectID);
        setFollowCount(followCount - 1);
    }

    }
  })

  //HTML elements containing buttons used in the info panel
  //Change depending on who's viewing the project page (Outside user, project member, project owner, etc.)
  const buttonContent =
    user &&
    displayedProject?.members.some(
      (member) =>
        displayedProject.owner.userId === member.user.userId
    ) ? (
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
    ) : user ? (
      <>
        {/* Heart icon, with number indicating follows */}
        <div className="project-info-followers">
          <p className={`follow-amt ${isFollowing ? "following" : ""}`}>
            {formatFollowCount(followCount)}
          </p>
          <button
            className={`follow-icon ${isFollowing ? "following" : ""}`}
            onClick={followProject}
          >
            <i
              className={`fa-solid fa-heart ${isFollowing ? "following" : ""}`}
            ></i>
          </button>
        </div>
        {/* Share, leave, and report dropdown */}
        <Dropdown>
          <DropdownButton className="project-info-dropdown-btn">
            •••
          </DropdownButton>
          <DropdownContent rightAlign={true}>
            <div id="project-info-dropdown">
              {/* TO-DO: Add functionality to share. Probably copy link to clipboard. Should also alert user */}
              <button className="project-info-dropdown-option">
                <i className="fa-solid fa-share"></i>
                Share
              </button>
              {/* Only be able to leave if you're a member of the project */}
              {/* {userPerms === 0 ? ( */}
              <Popup>
                <PopupButton className="project-info-dropdown-option">
                  <i
                    className="fa-solid fa-arrow-right-from-bracket"
                    style={{ fontStyle: "normal", transform: "rotate(180deg)" }}
                  ></i>
                  Leave
                </PopupButton>
                <PopupContent>
                  <div className="small-popup">
                    <h3>Leave Project</h3>
                    <p className="confirm-msg">
                      Are you sure you want to leave this project? You won't be
                      able to rejoin unless you're re-added by a project member.
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
              {/* ) : (
                      <></>
                    )} */}
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
    ) : (
      <></>
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

  const openPositionListing = (positionNumber: number) => {
    //Set state to position being clicked
    //Call Popup open function from other button
    setViewedPosition(positionNumber);
    const button = document.getElementById("project-open-positions-button");
    if (button) button.click();
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
      <Header dataSets={{ data: [] }} onSearch={() => {}} />

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
            <div id="project-info-header">
              <div id="project-title">{displayedProject.title}</div>
              <div id="project-info-buttons">{buttonContent}</div>
            </div>
            <div id="project-hook">{displayedProject.hook}</div>
            <div id="project-status">
              Status:{" "}
              <span className="project-info-highlight">
                {displayedProject.status}{" "}
              </span>
              <Popup>
                <PopupButton buttonId="project-open-positions-button">
                  Open Positions
                </PopupButton>
                <PopupContent>
                  <div id="project-open-positions-popup">
                    <div id="positions-popup-header">Join The Team</div>

                    <div className="positions-popup-content">
                      <div className="positions-popup-list">
                        <div id="positions-popup-list-header">
                          Open Positions
                        </div>
                        <div id="positions-popup-list-buttons">
                          {displayedProject.jobs?.map((job, index) => (
                            <button
                              className={`positions-popup-list-item ${index === viewedPosition ? "positions-popup-list-item-active" : ""}`}
                              onClick={() => setViewedPosition(index)}
                              key={index}
                            >
                              {job.role.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div id="positions-popup-info">
                        <div id="positions-popup-info-title">
                          {displayedProject.jobs[viewedPosition]?.role?.label ??
                            undefined}
                        </div>
                        <div id="positions-popup-info-description">
                          <div id="position-description-header">
                            What we are looking for:
                          </div>
                          <div id="position-description-content">
                            {displayedProject.jobs[viewedPosition]?.description}
                          </div>
                        </div>
                        <div id="position-details">
                          <div id="position-availability">
                            <span className="position-detail-indicator">
                              Availability:{" "}
                            </span>
                            {
                              displayedProject.jobs[viewedPosition]
                                ?.availability
                            }
                          </div>
                          <div id="position-duration">
                            <span className="position-detail-indicator">
                              Duration:{" "}
                            </span>
                            {displayedProject.jobs[viewedPosition]?.duration}
                          </div>
                          <div id="position-location">
                            <span className="position-detail-indicator">
                              Location:{" "}
                            </span>
                            {displayedProject.jobs[viewedPosition]?.location}
                          </div>
                          <div id="position-compensation">
                            <span className="position-detail-indicator">
                              Compensation:{" "}
                            </span>
                            {
                              displayedProject.jobs[viewedPosition]
                                ?.compensation
                            }
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
                            {projectLead?.firstName}{" "}
                            {projectLead?.lastName}
                          </span>
                        </div>
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
              Created by: {" "}
              <span className="project-info-highlight">
                {projectLead?.firstName} {projectLead?.lastName}
              </span>
              <br />
              Creation date
              <span className="project-info-highlight">
                {" "}
                {new Date(
                  displayedProject.createdAt.toString()
                ).toLocaleDateString()}
              </span>
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
              Keep up with us!
              <div id="project-overview-links">
                {/* Use function to insert various links here */}
              </div>
            </div>
          </div>

          <div id="project-people">
            <div id="project-people-tabs">
              <button
                className={`project-people-tab ${peopleContent}`}
                //onClick={() => setDisplayedPeople("People")} wow this button is now useless
              >
                The Team
              </button>
              {/* If contributors are added as a site feature, use the commented code below */}
              {/* <button className={`project-people-tab ${displayedPeople === 'Contributors' ? 'project-people-tab-active' : ''}`} onClick={(e) => setDisplayedPeople('Contributors')}>Contributors</button> */}
            </div>
            <div id="project-people-content">{peopleContent}</div>
          </div>

          <div id="project-open-positions">
            <div id="project-open-positions-header">Open Positions</div>
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
