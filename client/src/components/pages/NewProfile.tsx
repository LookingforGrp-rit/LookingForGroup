//Styles
import '../Styles/credits.css';
import '../Styles/discoverMeet.css';
import '../Styles/emailConfirmation.css';
import '../Styles/general.css';
import '../Styles/loginSignup.css';
import '../Styles/messages.css';
import '../Styles/notification.css';
import '../Styles/profile.css';
import '../Styles/projects.css';
import '../Styles/settings.css';
import '../Styles/pages.css';

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as paths from '../../constants/routes';
import { Header, loggedIn } from '../Header';
import { PanelBox } from '../PanelBox';
import { ProfileEditPopup } from '../Profile/ProfileEditPopup';
import { Dropdown, DropdownButton, DropdownContent } from '../Dropdown';
import { ThemeIcon } from '../ThemeIcon';
import { fetchUserID } from '../../functions/fetch';
import { ProfileInterests } from '../Profile/ProfileInterests';
import profilePicture from '../../images/blue_frog.png';

// --------------------
// Interfaces
// --------------------
interface Project {
  name: string;
  hook: string;
}

interface Tag {
  type: string;
  skill: string;
}

interface Profile {
  first_name: string;
  last_name: string;
  username: string;
  profile_image: HTMLImageElement;
  headline: string;
  pronouns: string;
  job_title: string;
  major: string;
  academic_year: string;
  location: string;
  fun_fact: string;
  bio: string;
  skills: Tag[];
  interests?: string[];
}

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
  const skillsStr = ['Figma', 'JavaScript', 'Visual Studio Code', 'Flexibility', 'Krita'];
  const skills: Tag[] = skillsStr.map((skillStr) => {
    return { type: 'Soft', skill: skillStr };
  });
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
  const defaultProfile: Profile = {
    first_name: 'Private',
    last_name: 'User',
    username: 'privateuser',
    profile_image: `private.webp`,
    headline: `This user is private`,
    pronouns: 'NA/NA',
    job_title: 'NA',
    major: 'NA',
    academic_year: 'NA',
    location: 'NA, NA',
    fun_fact: ``,
    bio: '',
    skills: [],
    interests: [],
  };

  const navigate = useNavigate(); // Hook for navigation

  // Get URL parameters to tell what user we're looking for and store it
  let urlParams = new URLSearchParams(window.location.search);
  let profileID = urlParams.get('userID');

  let displayedProfile: Profile;
  let setDisplayedProfile: Function;
  [displayedProfile, setDisplayedProfile] = useState(defaultProfile);

  // Project variables
  let fullProjectList, displayedProjects: Project[];
  let setFullProjectList, setDisplayedProjects: Function;
  // Former stores all projects, latter only stores ones to be displayed so you can do searches
  [fullProjectList, setFullProjectList] = useState([]);
  [displayedProjects, setDisplayedProjects] = useState([]);

  const projectSearchData = fullProjectList.map((project: { title: string; hook: string }) => {
    return { name: project.title, description: project.hook };
  });

  // --------------------
  // Helper functions
  // --------------------

  // 'Follow' button
  const followUser = () => {
    const followButton = document.getElementById('profile-follow-button') as HTMLButtonElement;
    toggleFollow = !toggleFollow;

    if (!loggedIn) {
      navigate(paths.routes.LOGIN, { state: { from: location.pathname } }); // Redirect if logged out
    }
    else {

      // (Follow behavior would be implemented here)

      if (toggleFollow) {
        followButton.innerText = 'Following';
        followButton.style.backgroundColor = 'Orange';
        followButton.style.width = '185px';
      } else {
        followButton.innerText = 'Follow';
        followButton.style.backgroundColor = 'var(--primary-color)';
        followButton.style.width = '145px';
      }
    }
  };

  // Search bar doesn't really have a use, so might as well use it for projects
  const searchProjects = (searchResults) => {
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
      console.log('No matching projects found.');
    } else {
      setDisplayedProjects(tempProjList);
    }
  };

  const getProfileProjectData = async () => {
    let url = `/api/users/${profileID}/projects`;

    // Only get visible projects when not the user's profile
    if (!isUsersProfile) {
      url += '/profile';
    }

    try {
      const response = await fetch(url);
      const { data } = await response.json();

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
      userID = await fetchUserID();

      // Get the profileID to pull data for whoever's profile it is
      const setUpProfileID = () => {
        // urlParams = new URLSearchParams(window.location.search);
        // profileID = urlParams.get('userID');
        // If no profileID is in search query, set to be current user
        if (profileID === undefined || profileID === null) {
          profileID = `${userID}`;
        }
        // Check if the userID matches the profile
        isUsersProfile = `${userID}` === profileID;
      };

      setUpProfileID();
      const url = `/api/users/${profileID}`;

      try {
        const response = await fetch(url);
        const { data } = await response.json();

        // Only run this if profile data exists for user
        if (data[0] !== undefined) {
          // If profile is private, and isn't the user's, don't display it
          if (isUsersProfile || data[0].visibility == 1) {
            setDisplayedProfile(data[0]);
            await getProfileProjectData();
          }
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
  const aboutMeButtons = isUsersProfile ? (
    <>
      {
        <div id="about-me-buttons">
          <button
            onClick={() => {
              window.open('https://www.linkedin.com/', '_blank');
            }}
          >
            <ThemeIcon
              light={'assets/black/linkedIn_black.png'}
              dark={'assets/white/linkedIn_white.png'}
              alt={'LinkedIn'}
            />
          </button>
          <button
            onClick={() => {
              window.open('https://www.instagram.com/', '_blank');
            }}
          >
            <ThemeIcon
              light={'assets/black/instagram_black.png'}
              dark={'assets/white/instagram_white.png'}
              alt={'Instagram'}
            />
          </button>
          <ProfileEditPopup />
        </div>
      }
    </>
  ) : (
    <>
      {
        <div id="about-me-buttons" className="about-me-buttons-minimal">
          <button>
            <ThemeIcon
              light={'assets/linkedIn_logo_light.png'}
              dark={'assets/linkedIn_logo_dark.png'}
              alt={'LinkedIn'}
            />
          </button>
          <button>
            <ThemeIcon
              light={'assets/instagram_logo_light.png'}
              dark={'assets/instagram_logo_dark.png'}
              alt={'Instagram'}
            />
          </button>
          <button>
            <ThemeIcon
              light={'assets/follow_user_light.png'}
              dark={'assets/follow_user_dark.png'}
              alt={'Like/Follow'}
            />
          </button>
          {/* TO-DO: Implement Share, Block, and Report functionality */}
          <Dropdown>
            <DropdownButton>
              <ThemeIcon
                light={'assets/menu_light.png'}
                dark={'assets/menu_dark.png'}
                alt={'More options'}
                addClass={'dropdown-menu'}
              />
            </DropdownButton>
            <DropdownContent rightAlign={true}>
              <div id="profile-menu-dropdown">
                <button className="profile-menu-dropdown-button">
                  <i className="fa-solid fa-share"></i>
                  Share
                </button>
                <button className="profile-menu-dropdown-button">
                  <i className="fa-solid fa-shield"></i>
                  Block
                </button>
                <button className="profile-menu-dropdown-button" id="profile-menu-report">
                  <i className="fa-solid fa-flag"></i>
                  Report
                </button>
              </div>
            </DropdownContent>
          </Dropdown>
        </div>
      }
    </>
  );

  // --------------------
  // Final component
  // --------------------
  return (
    <div className="page">
      {/* Should probably use the search bar for projects I guess? */}
      <Header dataSets={{ data: fullProjectList }} onSearch={searchProjects} hideSearchBar={true} />

      {/* Checks if we have profile data to use, then determines what to render */}
      <div id="profile-page-content">
        {/* New profile display using css grid, will contain all info except for projects */}
        <div id="profile-information-grid">
          <img
            src={
              displayedProfile.profile_image
                ? `/images/profiles/${displayedProfile.profile_image}`
                : profilePicture
            }
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
              {displayedProfile.first_name} {displayedProfile.last_name}
            </span>
            @{displayedProfile.username}
          </div>

          <div id="profile-info-buttons">{aboutMeButtons}</div>

          <div id="profile-info-extras">
            <div className="profile-extra">
              <ThemeIcon
                light={'assets/black/role.png'}
                dark={'assets/white/role.png'}
                alt={'Profession'}
              />
              {displayedProfile.job_title}
            </div>
            <div className="profile-extra">
              <ThemeIcon
                light={'assets/black/major.png'}
                dark={'assets/white/major.png'}
                alt={'Major'}
              />
              {displayedProfile.major} {displayedProfile.academic_year}
            </div>
            <div className="profile-extra">
              <ThemeIcon
                light={'assets/black/location.png'}
                dark={'assets/white/location.png'}
                alt={'Location'}
              />
              {displayedProfile.location}
            </div>
            <div className="profile-extra">
              <ThemeIcon
                light={'assets/black/pronouns.png'}
                dark={'assets/white/pronouns.png'}
                alt={'Pronouns'}
              />
              {displayedProfile.pronouns}
            </div>
          </div>

          <div id="profile-info-description">{displayedProfile.bio}</div>
          {/*Only loads follow button if not on own page*/}
          {isUsersProfile ? (
            <></>
          ) : (
            <button id="profile-follow-button" onClick={followUser}>
              Follow
            </button>
          )}

          <div id="profile-info-funfact">
            <span id="fun-fact-start">
              {displayedProfile.fun_fact ? 'Fun Fact!' : 'No Fun Fact (Yet)!'}
            </span>
            {displayedProfile.fun_fact}
          </div>
          <div id="profile-info-interest">
            <ProfileInterests user={{ interests: displayedProfile.interests || [] }}
              isUsersProfile={isUsersProfile} />
          </div>

          <div id="profile-info-skills">
            {displayedProfile.skills !== null ? (
              /* Will take in a list of tags the user has selected, then */
              /* use a map function to generate tags to fill this div */
              displayedProfile.skills.map((tag) => {
                let category: string;
                switch (tag.type) {
                  case 'Design':
                    category = 'red';
                    break;
                  case 'Developer':
                    category = 'yellow';
                    break;
                  case 'Soft':
                    category = 'purple';
                    break;
                  default:
                    category = 'grey';
                }

                return <div className={`skill-tag-label label-${category}`}>{tag.skill}</div>;
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
            category={'projects'}
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
