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

import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as paths from "../../constants/routes";
import { Header, loggedIn } from "../Header";
import { PanelBox } from "../PanelBox";
import { ProfileEditPopup } from "../Profile/ProfileEditPopup";
import { Dropdown, DropdownButton, DropdownContent } from "../Dropdown";
import { ThemeIcon } from "../ThemeIcon";
// import { ProfileInterests } from "../Profile/ProfileInterests";
import profilePicture from "../../images/blue_frog.png";
import { getVisibleProjects, getProjectsByUser, addUserFollowing, deleteUserFollowing, getCurrentAccount, getUserFollowing } from "../../api/users";
import { getUsersById } from "../../api/users";
import { MeDetail, ProjectPreview, UserDetail } from '@looking-for-group/shared';
import usePreloadedImage from "../../functions/imageLoad";

type Profile = MeDetail;
//type Tag = UserSkill;
type Project = ProjectPreview;

// Stores if profile is loaded from server and if it's user's respectively
// const [profileLoaded, setProfileLoaded] = useState(false);


const Profile = () => {
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
  const [userID, setUserID] = useState<number>(0);

  const [isFollow, setIsFollow] = useState<boolean>(false); //for the buttons specifically

  // Stores all projects
  const [fullProjectList, setFullProjectList] = useState<ProjectPreview[]>([]);
  // Projects displayed for searches
  const [displayedProjects, setDisplayedProjects] = useState<ProjectPreview[]>([]);

  const projectSearchData = fullProjectList?.map(
    (project: Project) => {
      return { name: project.title, description: project.hook };
    }
  );

  // --------------------
  // Helper functions
  // --------------------

  //a direct check to backend for determining whether or not a user is followed
const checkFollow = useCallback(async () => {
  const followings = (await getUserFollowing(userID)).data?.users;

  let isFollowing = false;

  if(followings !== undefined){ //if they have no follows then obviously they can't be following the guy we're looking at
  for (const follower of followings){
    isFollowing = (follower.user.userId === parseInt(profileID))
    if (isFollowing) break;
  }
  }
  setIsFollow(isFollowing);
  return isFollowing;
}, [profileID, userID])

  // 'Follow' button
  const followUser = async () => {

    if (!loggedIn) {
      navigate(paths.routes.LOGIN, { state: { from: location.pathname } }); // Redirect if logged out
    } else {
      //adds the user following
    const toggleFollow = !(await checkFollow());
    setIsFollow(toggleFollow);
      if (toggleFollow) {
        const follow = await addUserFollowing(parseInt(profileID));
        if(follow.status === 401) navigate(paths.routes.LOGIN, { state: { from: location.pathname } });
      }
      else {
        await deleteUserFollowing(parseInt(profileID)); //this would never show if you weren't logged in
      }
    }
  };

  // Search bar doesn't really have a use, so might as well use it for projects
  const searchProjects = (searchResults: string[]) => {
    const tempProjList: Project[] = [];

    for (const result of searchResults[0]) {
      for (const proj of projectSearchData) {
        if (result === proj.name) {
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


  const getProfileProjectData = useCallback(async () => {
    try {
      const response = isUsersProfile ? await getProjectsByUser() : await getVisibleProjects(Number(profileID)) as { data: ProjectPreview[] };          // IMPLEMENT PROJECT GETTING
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
  useEffect(() => {
    const getProfileData = async () => {
      // Get the userID for our current user
      const response = await getCurrentAccount()
      if (response.data) setUserID(response.data.userId);
      setIsUsersProfile(userID.toString() === profileID);

      try {
        const { data } = await getUsersById(profileID);
        console.log('user data', data);

        // Only run this if profile data exists for user
        if (data) {
          setDisplayedProfile(data);
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
    getProfileData();
  }, [getProfileProjectData, checkFollow, isUsersProfile, profileID, userID]);

  // --------------------
  // Components
  // --------------------
  const aboutMeButtons = (
  <>
    {/* Add social links if present */}
    {displayedProfile?.socials && (
      <div id="about-me-buttons">
        {displayedProfile?.socials.map((link) => (
          <button
            key={link.websiteId}
            onClick={() => {
              window.open(link.url, "_blank");
            }}
          >
            <ThemeIcon
              id={link.label.toLowerCase()}
              width={25}
              height={25}
              className={"color-fill"}
              ariaLabel={link.label}
            />
          </button>
        ))}
      </div>
    )}

    {/* If the displayed user is the user's profile */}
    {isUsersProfile ? (
      // Show edit buttons
      <ProfileEditPopup />
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
          <ThemeIcon id={'menu'} width={25} height={25} className={'color-fill dropdown-menu'} ariaLabel={'More options'}/>
        </DropdownButton>
        <DropdownContent rightAlign={true}>
          <div id="profile-menu-dropdown">
            <button className="profile-menu-dropdown-button">
              <ThemeIcon id={'share'} width={27} height={27} className={'mono-fill'} ariaLabel={'Share'}/>
              Share
            </button>
            <button className="profile-menu-dropdown-button">
              <ThemeIcon id={'cancel'} width={27} height={27} className={'mono-fill'} ariaLabel={'Block'}/>
              Block
            </button>
            <button
              className="profile-menu-dropdown-button"
              id="profile-menu-report"
            >
              <ThemeIcon id={'warning'} width={27} height={27} ariaLabel={'Report'}/>
              Report
            </button>
          </div>
        </DropdownContent>
      </Dropdown>
      </>
    )}
  </>
  );

  // --------------------
  // Final component
  // --------------------
  return (
    <div className="page">
      {/* Should probably use the search bar for projects I guess? */}
      <Header
        dataSets={{ data: fullProjectList }}
        onSearch={searchProjects}
        hideSearchBar={true}
      />

      {/* Checks if we have profile data to use, then determines what to render */}
      <div id="profile-page-content">
        <div id="profile-hero">
          <div id="profile-img-container">
            <img
              src={usePreloadedImage(`images/profiles/${displayedProfile?.profileImage}`, profilePicture)}
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
                <div className="profile-extra">
                  <ThemeIcon id={'role'} width={20} height={20} className={'mono-fill'} ariaLabel={'Profession'}/>
                  {displayedProfile?.title}
                </div>
                <div className="profile-extra">
                  <ThemeIcon id={'major'} width={24} height={24} className={'mono-fill'} ariaLabel={'Major'}/>
                  {displayedProfile?.majors?.join(", ")} {displayedProfile?.academicYear}
                </div>
                <div className="profile-extra">
                  <ThemeIcon id={'location'} width={12} height={16} className={'mono-fill'} ariaLabel={'Location'}/>
                  {displayedProfile?.location}
                </div>
                <div className="profile-extra">
                  <ThemeIcon id={'pronouns'} width={22} height={22} className={'mono-fill'} ariaLabel={'Pronouns'} />
                  {displayedProfile?.pronouns}
                </div>
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

            <div id="profile-skills">
              {displayedProfile?.skills !== undefined && (
                /* Will take in a list of tags the user has selected, then */
                /* use a map function to generate tags to fill this div */
                displayedProfile?.skills.map((tag) => {
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

        <div id="profile-projects">
          <h2>Projects</h2>
          {/* Probably fine to use 25 for itemAddInterval */}
          {displayedProjects ? (
            <PanelBox
              category={"projects"}
              itemList={displayedProjects}
              itemAddInterval={25}
            />
          ) : (
            <div>No projects to display</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
