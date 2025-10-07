//Styles
import "../Styles/credits.css";
import "../Styles/discoverMeet.css";
import "../Styles/emailConfirmation.css";
import "../Styles/general.css";
import "../Styles/loginSignup.css";
import "../Styles/messages.css";
import "../Styles/notification.css";
import "../Styles/profile.css";
import "../Styles/projects.css";
import "../Styles/settings.css";
import "../Styles/pages.css";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as paths from "../../constants/routes";
import { Header, loggedIn } from "../Header";
import { PanelBox } from "../PanelBox";
import { ProfileEditPopup } from "../Profile/ProfileEditPopup";
import { Dropdown, DropdownButton, DropdownContent } from "../Dropdown";
import { ThemeIcon } from "../ThemeIcon";
import { ProfileInterests } from "../Profile/ProfileInterests";
import profilePicture from "../../images/blue_frog.png";
import usePreloadedImage from "../../functions/imageLoad";
import { getCurrentUsername, getVisibleProjects, getProjectsByUser } from "../../api/users";
import { getUsersById } from "../../api/users";
import { MeDetail, UserSkill, ProjectPreview } from '@looking-for-group/shared';
import { getUsersById } from "../../api/users";

//backend base url for getting images
const API_BASE = `http://localhost:8081`;

type Profile = MeDetail;
type Tag = UserSkill;
type Project = ProjectPreview;

// Stores if profile is loaded from server and if it's user's respectively
// const [profileLoaded, setProfileLoaded] = useState(false);
let userID: number;
let isUsersProfile: boolean = false;

// Change this when follow backend is added, this is just for testing purposes
let toggleFollow = false;

const NewProfile = () => {
  // --------------------
  // Global variables
  // --------------------
  // Just to prevent typescript errors
  const skillsStr = [
    "Figma",
    "JavaScript",
    "Visual Studio Code",
    "Flexibility",
    "Krita",
  ];
  const skills: UserSkill[] = skillsStr.map((skillStr) => ({
    type: "Soft",
    skill: skillStr,
  }));
  // const defaultProfile: Profile = {
  //   first_name: 'User',
  //   last_name: 'Name',
  //   username: 'someguy',
  //   profile_image: profilePicture,
  //   headline: `Here's a quick lil blurb about me!`,
  //   pronouns: 'Was/Were',
  //   job_title: 'Profession',
  //   major: 'Professional Typer',
  //   academic_year: '13th',
  //   location: 'Middle of, Nowhere',
  //   fun_fact: `I'm not a real person, I'm just a digital representation of one!`,
  //   bio: 'A bunch of Lorem Ipsum text, not bothering to type it out.',
  //   skills: skills,
  // };
  const defaultProfile: MeDetail = {
    first_name: "Private",
    last_name: "User",
    username: "privateuser",
    profileImage: `private.webp`,
    headline: `This user is private`,
    pronouns: "NA/NA",
    jobTitle: "NA",
    major: "NA",
    academicYear: "NA",
    location: "NA, NA",
    funFact: ``,
    bio: "",
    skills: [],
    interests: [],
    mentor: false,
    socials: [],
  };

  const navigate = useNavigate(); // Hook for navigation

  // Get URL parameters to tell what user we're looking for and store it
  const urlParams = new URLSearchParams(window.location.search);
  // User ID of profile being viewed
  const profileID: string = urlParams.get("userID")!;

  const [displayedProfile, setDisplayedProfile] = useState(defaultProfile);

  // Stores all projects
  const [fullProjectList, setFullProjectList] = useState<ProjectPreview[]>([]);
  // Projects displayed for searches
  const [displayedProjects, setDisplayedProjects] = useState<ProjectPreview[]>([]);

  const projectSearchData = fullProjectList.map(
    (project: Project) => {
      return { name: project.name, description: project.hook };
    }
  );

  // --------------------
  // Helper functions
  // --------------------

  // 'Follow' button
  const followUser = () => {
    const followButton = document.getElementById(
      "profile-follow-button"
    ) as HTMLButtonElement;
    toggleFollow = !toggleFollow;

    if (!loggedIn) {
      navigate(paths.routes.LOGIN, { state: { from: location.pathname } }); // Redirect if logged out
    } else {
      // (Follow behavior would be implemented here)

      if (toggleFollow) {
        followButton.innerText = "Following";
        followButton.style.backgroundColor = "Orange";
        followButton.style.width = "185px";
      } else {
        followButton.innerText = "Follow";
        followButton.style.backgroundColor = "var(--primary-color)";
        followButton.style.width = "145px";
      }
    }
  };

  // Search bar doesn't really have a use, so might as well use it for projects
  const searchProjects = (searchResults: string[]) => {
    const tempProjList: Project[] = [];

    for (const result of searchResults[0]) {
      for (const proj of projectSearchData) {
        if (result === proj) {
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

  const getProfileProjectData = async () => {
    try {
      const response = isUsersProfile ? await getProjectsByUser(Number(profileID)) : await getVisibleProjects(Number(profileID)) as { data: ProjectPreview[] };          // IMPLEMENT PROJECT GETTING
      const data = response.data;
      
      console.log(data);

      // Only update if there's data
      if (data !== undefined) {
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
  };

  // Gets the profile data
  useEffect(() => {
    const getProfileData = async () => {
      const userID = await getCurrentUsername();

      // Get the profileID to pull data for whoever's profile it is
      const setUpProfileID = () => {
        // If no profileID is in search query, set to be current user
        if (profileID === undefined || profileID === null) {
          profileID = userID;
        }
        // Check if the userID matches the profile
        isUsersProfile = userID === profileID;
      };

      setUpProfileID();

      try {
        const { data } = await getUsersById(profileID ?? "");

        // Only run this if profile data exists for user
        if (data !== undefined) {
          setDisplayedProfile(data);
          await getProfileProjectData();
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
    
  }, [profileID]);

  // --------------------
  // Components
  // --------------------
  const aboutMeButtons = (
  <>
    {/* Add social links if present */}
    {displayedProfile.socials && (
      <div id="about-me-buttons">
        {displayedProfile.socials.map((link) => (
          <button
            key={link.websiteId}
            onClick={() => {
              window.open(link.url, "_blank");
            }}
          >
            <ThemeIcon
              id={link.label}
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
      <ThemeIcon id={'heart'} width={25} height={25} className={'empty-heart'} ariaLabel="follow"/>
      {/* FIXME: When following is implemented, use this: */}
      {/* <ThemeIcon id={'heart'} width={25} height={25} className={isFollowing ? 'filled-heart' : 'empty-heart'} /> */}
      
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
        {/* New profile display using css grid, will contain all info except for projects */}
        <div id="profile-information-grid">
          <img
            src={usePreloadedImage(`${API_BASE}/images/profiles/${displayedProfile.profileImage}`, profilePicture)}
            id="profile-image"
            alt="profile image"
            onError={(e) => {
              const profileImg = e.target as HTMLImageElement;
              profileImg.src = profilePicture;
            }}
          />

          <div id="profile-bio">{displayedProfile.headline}</div>

          <div id="profile-info-name">
            <span id="profile-fullname">
              {displayedProfile.firstName} {displayedProfile.lastName}
            </span>
            @{displayedProfile.username}
          </div>

          <div id="profile-info-buttons">{aboutMeButtons}</div>

          <div id="profile-info-extras">
            <div className="profile-extra">
              <ThemeIcon id={'role'} width={20} height={20} className={'mono-fill'} ariaLabel={'Profession'}/>
              {displayedProfile.jobTitle}
            </div>
            <div className="profile-extra">
              <ThemeIcon id={'major'} width={24} height={24} className={'mono-fill'} ariaLabel={'Major'}/>
              {displayedProfile.major} {displayedProfile.academicYear}
            </div>
            <div className="profile-extra">
              <ThemeIcon id={'location'} width={12} height={16} className={'mono-fill'} ariaLabel={'Location'}/>
              {displayedProfile.location}
            </div>
            <div className="profile-extra">
              <ThemeIcon id={'pronouns'} width={22} height={22} className={'mono-fill'} ariaLabel={'Pronouns'} />
              {displayedProfile.pronouns}
            </div>
            {/* Only show mentor status if user is a mentor */}
            {displayedProfile.mentor && 
              <div className="profile-extra">
                <ThemeIcon id={'mentor'} width={20} height={20} className={'mono-fill'} ariaLabel={'Mentorship Status'} />
                Mentor
              </div>
            }
          </div>

          <div id="profile-info-description">{displayedProfile.bio}</div>

          <div id="profile-info-funfact">
            <span id="fun-fact-start">
              {displayedProfile.funFact ? "Fun Fact!" : "No Fun Fact (Yet)!"}
            </span>
            {displayedProfile.funFact}
          </div>
          <div id="profile-info-interest">
            <ProfileInterests
              user={{ interests: displayedProfile.interests || [] }}
              isUsersProfile={isUsersProfile}
            />
          </div>

          <div id="profile-info-skills">
            {displayedProfile.skills !== null ? (
              /* Will take in a list of tags the user has selected, then */
              /* use a map function to generate tags to fill this div */
              displayedProfile.skills.map((tag) => {
                let category: string;
                switch (tag.type) {
                  case "Design":
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
                    key={`${tag.skill}`}
                    className={`skill-tag-label label-${category}`}
                  >
                    {tag.skill}
                  </div>
                );
              })
            ) : (
              <></>
            )}
          </div>
        </div>

        <div id="profile-projects">
          <h2>Projects</h2>
          {/* Probably fine to use 25 for itemAddInterval */}
          <PanelBox
            category={"projects"}
            itemList={displayedProjects}
            itemAddInterval={25}
            userId={userID}
          />
        </div>
      </div>
    </div>
  );
};

export default NewProfile;
