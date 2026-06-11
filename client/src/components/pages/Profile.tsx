//Styles
import "../Styles/credits.css";
import "../Styles/discoverMeet.css";
import "../Styles/emailConfirmation.css";
import "../Styles/general.css";
import "../Styles/loginSignup.css";
import "../Styles/profile.css";
import "../Styles/projects.css";
import "../Styles/settings.css";
import "../Styles/pages.css";

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as paths from "../../constants/routes";
import { Header, loggedIn } from "../Header";
import { PanelBox } from "../PanelBox";
import { ProfileEditPopup } from "../Profile/ProfileEditPopup";
import { Dropdown, DropdownButton, DropdownContent } from "../Dropdown";
import { ThemeIcon } from "../ThemeIcon";
import { ShareButton } from "../ShareButton";
// import { ProfileInterests } from "../Profile/ProfileInterests";
import profilePicture from "../../images/blue_frog.png";
import { getVisibleProjects, getProjectsByUser, addUserFollowing, deleteUserFollowing, getUserFollowing } from "../../api/users";
import { getUsersById } from "../../api/users";
import { MeDetail, MePrivate, ProjectPreview, UserDetail } from '@looking-for-group/shared';
import usePreloadedImage from "../../functions/imageLoad";
import AboutFooter from "../AboutFooter";

type Profile = MeDetail;
//type Tag = UserSkill;
type Project = ProjectPreview;

// Stores if profile is loaded from server and if it's user's respectively
// const [profileLoaded, setProfileLoaded] = useState(false);

/**
 * Profile page with user information collected from profileID.
 * @returns JSX Element
 */
const Profile = (userProfile : any) => {
  // --------------------
  // Global variables
  // --------------------

  const navigate = useNavigate(); // Hook for navigation

  // Get URL parameters to tell what user we're looking for and store it
  const urlParams = new URLSearchParams(window.location.search);
  // User ID of profile being viewed
  const profileID: string = urlParams.get("userID")!;

  const [isUsersProfile, setIsUsersProfile] = useState<boolean>(false);

  const [displayedProfile, setDisplayedProfile] = useState<UserDetail>();
  const [userID, setUserID] = useState<number>();

  const [isFollow, setIsFollow] = useState<boolean>(false); //for the buttons specifically

  // Stores all projects
  const [fullProjectList, setFullProjectList] = useState<ProjectPreview[]>([]);
  // Projects displayed for searches
  const [displayedProjects, setDisplayedProjects] = useState<ProjectPreview[]>([]);

  const [majorsArr, setMajorsArr] = useState<string[]>([]);

  const projectSearchData = fullProjectList?.map(
    (project: Project) => {
      return { name: project.title, description: project.hook };
    }
  );

  // --------------------
  // Helper functions
  // --------------------
  /**
   * Checks if the user is following this user
   * @returns true if following
   */
  const checkFollow = useCallback(async () => {
    if (userID !== -1 && userID !== undefined) {
      const followings = (await getUserFollowing(userID)).data?.users;

      let isFollowing = false;

      if (followings !== undefined) { //if they have no follows then obviously they can't be following the guy we're looking at
        for (const follower of followings) {
          isFollowing = (follower.user.userId === parseInt(profileID))
          if (isFollowing) break;
        }
      }
      setIsFollow(isFollowing);
      return isFollowing;

    }
  }, [profileID, userID])

  /**
   * Toggles following the user.
   */
  const followUser = async () => {

    if (!loggedIn) {
      navigate(paths.routes.LOGIN, { state: { from: location.pathname } }); // Redirect if logged out
    } else {
      //adds the user following
      const toggleFollow = !(await checkFollow());
      setIsFollow(toggleFollow);
      if (toggleFollow) {
        const follow = await addUserFollowing(parseInt(profileID));
        if (follow.status === 401) navigate(paths.routes.LOGIN, { state: { from: location.pathname } });
      }
      else {
        await deleteUserFollowing(parseInt(profileID)); //this would never show if you weren't logged in
      }
    }
  };

  /**
   * Updates the displayed projects based on the search results.
   * @param searchResults Filtered projects based on the search query.
   */
  const searchProjects = (searchResults: unknown[][]) => {
    const tempProjList: Project[] = [];

    for (const result of searchResults[0]) {
      for (const proj of projectSearchData) {
        if (result === proj.name) {
          if(fullProjectList[projectSearchData.indexOf(proj)].globalVisibility === "public")
            tempProjList.push(fullProjectList[projectSearchData.indexOf(proj)]);
          continue;
        }
      }
    }

    // If no projects were found
    if (tempProjList.length === 0) {
      setDisplayedProjects([]); // Clear the displayed list
      console.log("No matching projects found.");
    } else {
      setDisplayedProjects(tempProjList);
    }
  };

  /**
   * Gets the user's projects to display.
   */
  const getProfileProjectData = useCallback(async () => {
    try {
      const response = isUsersProfile ? await getProjectsByUser() : await getVisibleProjects(Number(profileID)) as { data: ProjectPreview[] }; //TODO: IMPLEMENT PROJECT GETTING
      const data = response.data;

      // Only update if there's data
      if (data) {
        setFullProjectList(data);
        setDisplayedProjects(data);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.log(`Unknown error: ${error}`);
      }
    }
  }, [profileID, isUsersProfile, setFullProjectList, setDisplayedProjects]);

  // Gets the profile data
  const getProfileData = async (data: MePrivate | undefined) => {
    // Get the userID for our current user
    if (data) { 
      setUserID(data.userId);  
      setIsUsersProfile(data.userId.toString() === profileID);
    }
    else setUserID(-1);

    //set the variable i just set the damn variable bro
    try {
      const { data } = await getUsersById(Number(profileID));

      // Only run this if profile data exists for user
      if (data) {
        setDisplayedProfile(data);
        setMajorsArr(data.majors.map((maj) => maj.label));
        await getProfileProjectData();
        checkFollow();
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.log(`Unknown error: ${error}`);
      }
    }
  };
    

  // --------------------
  // Components
  // --------------------
  const aboutMeButtons = (
    <>
      {/* If the displayed user is the user's profile */}
      {isUsersProfile ? (
        <>
          <ShareButton />
          <ProfileEditPopup />
        </>
      ) : (
        <>
          {/* Or, show follow and options buttons */}
          {/*must change state based on follow status*/}
          {isFollow ? (
            <ThemeIcon
              width={28}
              height={25}
              id={"heart-filled"}
              ariaLabel="following"
              onClick={() => followUser()}
            />
          ) : (
            <ThemeIcon
              width={28}
              height={25}
              id={"heart-empty"}
              ariaLabel="following"
              onClick={() => followUser()}
            />
          )}

          {/* TODO: Implement Share, Block, and Report functionality */}
          <Dropdown>
            <DropdownButton>
              <ThemeIcon id={'menu'} width={25} height={25} className={'color-fill dropdown-menu'} ariaLabel={'More options'} />
            </DropdownButton>
            <DropdownContent rightAlign={true}>
              <div id="profile-menu-dropdown">
                <ShareButton />
                <button
                  className="profile-menu-dropdown-button"
                  id="profile-menu-block"
                >
                  <ThemeIcon id={'cancel'} width={27} height={27} ariaLabel={'Block'} />
                  Block
                </button>
                <button
                  className="profile-menu-dropdown-button"
                  id="profile-menu-report"
                >
                  <ThemeIcon id={'warning'} width={27} height={27} ariaLabel={'Report'} />
                  Report
                </button>
              </div>
            </DropdownContent>
          </Dropdown>
        </>
      )}
    </>
  );

  //console.log(displayedProfile);
  // --------------------
  // Final component
  // --------------------
  return (
    <div className="page" tabIndex={-1}>
      <Header
        dataSets={[{ data: fullProjectList }]}
        onSearch={searchProjects}
        hideSearchBar={true}
        onChange={() => { }}
        setCurrentUserId={getProfileData} //brother you're not even passing anything
      />

      {/* Checks if we have profile data to use, then determines what to render */}
      <main id="main" tabIndex={-1}>
        <div id="profile-page-content">
          <ThemeIcon id={'back'} width={70} height={25} className={'color-fill project-back-btn'} ariaLabel={'back'} onClick={() => { navigate(-1); }} />
          <div id="profile-hero">
            <div id="profile-img-container">
              <img
                src={usePreloadedImage(`${displayedProfile?.profileImage}`, profilePicture)}
                id="profile-image"
                alt="profile image"
                onError={(e) => {
                  const profileImg = e.target as HTMLImageElement;
                  profileImg.src = profilePicture;
                }}
              />
              <div id="profile-bio">{displayedProfile?.headline}</div>
            </div>

            <div id="profile-info">
              <div id="profile-info-text">
                <div id="profile-top-row">
                  <div id="profile-names">
                    <p id="profile-fullname">
                      {displayedProfile?.firstName} {displayedProfile?.lastName}
                    </p>
                    <p id="profile-username">
                      @{displayedProfile?.username}
                    </p>
                  </div>
                  <div id="profile-buttons">{aboutMeButtons}</div>
                </div>

                <div id="profile-extras">
                  {displayedProfile?.title ?
                  <div className="profile-extra">
                    <ThemeIcon id={'role'} width={20} height={20} className={'mono-fill'} ariaLabel={'Profession'} />
                    {displayedProfile.title}
                  </div> : ""}
                  {displayedProfile?.academicYear ? 
                  <div className="profile-extra">
                    <ThemeIcon id={'major'} width={24} height={24} className={'mono-fill'} ariaLabel={'Major'} />
                    {majorsArr.join(", ")} {displayedProfile?.academicYear}
                  </div> : ""}
                  {displayedProfile?.location ?
                  <div className="profile-extra">
                    <ThemeIcon id={'location'} width={12} height={22} className={'mono-fill'} ariaLabel={'Location'} />
                    {displayedProfile?.location}
                  </div> : ""}
                  {displayedProfile?.pronouns ?
                  <div className="profile-extra">
                    <ThemeIcon id={'pronouns'} width={22} height={22} className={'mono-fill'} ariaLabel={'Pronouns'} />
                    {displayedProfile?.pronouns}
                  </div> : ""}
                  {/* Only show mentor status if user is a mentor */}
                  {displayedProfile?.mentor &&
                    <div className="profile-extra">
                      <ThemeIcon id={'mentor'} width={20} height={20} className={'mono-fill'} ariaLabel={'Mentorship Status'} />
                      Mentor
                    </div>
                  }
                </div>

                <div id="profile-description">{displayedProfile?.bio}</div>

                <div id="profile-funfact">
                  <span id="funfact-start">
                    {displayedProfile?.funFact ? "Fun Fact!" : "No Fun Fact (Yet)!"}
                  </span>
                  {displayedProfile?.funFact}
                </div>

                {/* <div id="profile-interest">
                  <ProfileInterests
                    user={{ interests: displayedProfile.interests || [] }}
                    isUsersProfile={isUsersProfile}
                  />
                </div> */}
              </div>
            </div>
          </div>

          <div id="profile-extra">
            <div id="socials">
              <p id="title">Contact Me</p>
              <div id="profile-email">
                {/* TODO: make icon for email and phone */}
                {displayedProfile?.username ? 
                <a href={`mailto:${displayedProfile?.username}@g.rit.edu`}>  
                <ThemeIcon id={'link'} width={25} height={25} className={'mono-fill'} ariaLabel={'mail'}/>
                {displayedProfile?.username}@g.rit.edu</a>
                : <a><ThemeIcon id={'link'} width={25} height={25} className={'mono-fill'} ariaLabel={'mail'}/>no email</a>}
              </div>
              {/* Show phone number if present */}
              {displayedProfile?.phoneNumber ? /* no need to also check displayPhone, the number won't be in the request if it's false */
                <div id="profile-number">
                  <a id="profile-number" href={`sms:${displayedProfile.phoneNumber}`}>  
                  <ThemeIcon id={'link'} width={25} height={25} className={'mono-fill'} ariaLabel={'mail'}/>
                  {displayedProfile.phoneNumber}</a>
                </div>
              //dead link when no number
              : <></>}
              {/* Add social links if present */}
              {displayedProfile?.socials && (
                <div id="about-me-buttons">
                  {displayedProfile?.socials.map((link) => (
                    <a
                      key={link.websiteId}
                      href={link.url}
                      target="_blank"
                    >
                      <ThemeIcon
                        id={link.label === "Other" ? "link" : link.label.toLowerCase()}
                        width={25}
                        height={25}
                        className={"color-fill"}
                        ariaLabel={link.label}
                      />
                    </a>
                  ))}
                </div>
              )}
            </div>

            <div id="skills">
              <p id="title">Skills</p>
              <div id="skill-block">
              {displayedProfile?.skills !== undefined && (
                /* Will take in a list of tags the user has selected, then */
                /* use a map function to generate tags to fill this div */
                displayedProfile?.skills.sort((a, b) => a.position - b.position).map((tag) => {
                  let category: string;
                  switch (tag.type) {
                    case "Designer":
                      category = "red";
                      break;
                    case "Developer":
                      category = "yellow";
                      break;
                    case "Soft":
                      category = "purple";
                      break;
                    case "Audio":
                      category = "periwinkle";
                      break;
                    default:
                      category = "grey";
                  }
                  return (
                    <div
                      key={`${tag.skillId}`}
                      className={`skill-tag-label label-${category}`}
                    >
                      {tag.label}
                    </div>
                  );
                })
              )}
              </div>
            </div>
          </div>
          {displayedProjects.length > 0 ?
          <div id="profile-projects">
            <h2>Projects</h2>
              <PanelBox
                category={"projects"}
                itemList={displayedProjects}
                userId={userID as number}
              />
          </div> : ""}
        </div>
      </main>
      <AboutFooter />
    </div>
  );
};

export default Profile;
