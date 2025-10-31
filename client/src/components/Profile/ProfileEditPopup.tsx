// Utilities and React functions
import { useState, useEffect } from "react";

import { editUser } from "../../api/users";

// Components
import { Popup, PopupButton, PopupContent } from "../Popup";

// Tabs
import { AboutTab } from "./tabs/AboutTab";
import { LinksTab } from "./tabs/LinksTab";
import { ProjectsTab } from "./tabs/ProjectsTab";
import { SkillsTab } from "./tabs/SkillsTab";
// import { InterestTab } from './tabs/InterestTab';
// import { interests } from '../../constants/interests';
import { getCurrentUsername, getUsersById } from "../../api/users";

import {
  MeDetail,
  UpdateUserInput,
} from "@looking-for-group/shared";

// The profile to view is independent upon the site's state changes
const pageTabs = ["About", "Projects", "Skills", "Links"];

export const ProfileEditPopup = () => {
  // The profile to view is independent upon the site's state changes
  const [profile, setProfile] = useState<MeDetail | null>(null);

  // Holds new profile image if one is selected
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [errorVisible, setErrorVisible] = useState(false);

  // Profile should be set up on intialization
  useEffect(() => {
    const setUpProfileData = async () => {
      // Pick which socials to use based on type
      // fetch for profile on ID
      const userID = await getCurrentUsername();
      const response = await getUsersById(userID.data?.userId);

      console.log("ProfileEditPopup - Raw API response:", response.data);
      console.log("ProfileEditPopup - User profile data:", response.data);
      //console.log('ProfileEditPopup - User interests from API:', response.data?.skills);

      await setProfile(response.data as MeDetail);
    };
    setUpProfileData();
  }, []);

  // Send selected image to server for save
  const saveImage = async () => {
    if (!selectedImageFile) return;

    await editUser({ profileImage: selectedImageFile });
  };

  const onSaveClicked = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // prevents any default calls

    if (!profile) return;

    // Receive all inputted values
    const getInputValue = (input: string) => {
      const element = document.getElementById(
        `profile-editor-${input}`
      ) as HTMLInputElement;
      return element?.value?.trim() || ""; // null
    };

    // required fields: ensure not just empty/spaces
    const firstName = getInputValue("firstName");
    const lastName = getInputValue("lastName");
    const bio = getInputValue("bio");

    // pop up error text if fields invalid
    if (!firstName || !lastName || !bio) {
      setErrorVisible(true);
      return;
    }

    // Prepare these values for a POST/PUT request
    const updatedProfile: MeDetail = {
      ...profile!,
      firstName,
      lastName,
      headline: getInputValue("headline"),
      pronouns: getInputValue("pronouns"),
      title: getInputValue("jobTitle"),
      majors: profile.majors ?? [],
      academicYear: getInputValue("academicYear") as MeDetail["academicYear"],
      location: getInputValue("location"),
      funFact: getInputValue("funFact"),
      bio,
      skills: profile.skills || [],
      socials: profile.socials || [],
    };
    // console.log('Saving data...');
    // console.log(dataToStore);

    // TODO track majors, skills, and socials as they're added deleted or modified so that they can be updated using their respsective endpoints.
    const updatedUserInput: UpdateUserInput = {
      firstName,
      lastName,
      headline: getInputValue("headline"),
      pronouns: getInputValue("pronouns"),
      title: getInputValue("jobTitle"),
      academicYear: getInputValue("academicYear") as MeDetail["academicYear"],
      location: getInputValue("location"),
      funFact: getInputValue("funFact"),
      bio,
    };

    // TODO error check result
    await editUser(updatedUserInput);
    await saveImage();

    setProfile(updatedProfile);
    setErrorVisible(false);

    window.location.reload(); // reload page
  };

  // In your ProfileEditPopup.tsx file

  // useEffect to initialize the tabs
  useEffect(() => {
    setTimeout(() => {
      // Initialize all tabs to be hidden except the first one
      pageTabs.forEach((tab, idx) => {
        const tabElement = document.querySelector(
          `#profile-editor-${tab.toLowerCase()}`
        );
        if (tabElement) {
          if (idx === 0) {
            tabElement.classList.remove("hidden");
          } else {
            tabElement.classList.add("hidden");
          }
        }
      });
    });

    // Highlight the first tab button
    const firstTab = document.querySelector(`#profile-tab-${pageTabs[0]}`);
    if (firstTab) {
      firstTab.classList.add("project-editor-tab-active");
    }
  }, []);

  // Component to organize the main tab content
  const renderTabContent = () => {
    if (!profile) return <p>Loading...</p>;
    switch (currentTab) {
      case 0:
        return (
          <AboutTab
            profile={profile}
            selectedImageFile={selectedImageFile}
            setSelectedImageFile={setSelectedImageFile}
          />
        );
      case 1:
        return <ProjectsTab profile={profile} />;
      case 2:
        return <SkillsTab profile={profile} />;
      case 3:
        return <LinksTab profile={profile} />;
      default:
        return null;
    }
  };

  // Maps the pageTabs into interactable page tabs, to switch between the Tab Content
  const editorTabs = pageTabs.map((tag, i) => (
    <button
      key={tag}
      onClick={(e) => {
        e.preventDefault();
        setCurrentTab(i);
      }}
      id={`profile-tab-${tag}`}
      className={`project-editor-tab ${currentTab === i ? "project-editor-tab-active" : ""}`}
    >
      {tag}
    </button>
  ));

  // Method to switch between tabs
  /*const switchTab = (tabIndex: number) => {
    // This method toggles the visibility for the previous tab and then the selected tab
    // First toggle visibility for the previous tab
    const previousTabIndex = pageTabs[currentTab].toLowerCase();
    const prevElement = document.querySelector(`#profile-editor-${previousTabIndex}`);
    const prevTab = document.querySelector(`#profile-tab-${pageTabs[currentTab]}`);
    if (prevElement) {
      prevElement.classList.toggle('hidden');
    }
    if (prevTab) {
      prevTab.classList.toggle('project-editor-tab-active');
    }

    // Update Current Tab
    currentTab = tabIndex;

    // Get current tab
    let currentElement;
    const currTab = document.querySelector(`#profile-tab-${pageTabs[currentTab]}`);
    switch (pageTabs[currentTab]) {
      case 'About':
        currentElement = document.querySelector(`#profile-editor-about`);
        break;
      case 'Projects':
        currentElement = document.querySelector(`#profile-editor-projects`);
        break;
      case 'Skills':
        currentElement = document.querySelector(`#profile-editor-skills`);
        break;
      case 'Interests':
        currentElement = document.querySelector(`#profile-editor-interests`);
        break;
      case 'Links':
        currentElement = document.querySelector(`#profile-editor-links`);
        break;
      default:
        currentElement = document.querySelector(`#profile-editor-about`);
        break;
    }
    // Toggle current tab's visibility
    if (currentElement) {
      currentElement.classList.toggle('hidden');
    }
    if (currTab) {
      currTab.classList.toggle('project-editor-tab-active');
    }
  };*/
  return (
    <Popup>
      <PopupButton buttonId="project-info-edit">Edit Profile</PopupButton>
      <PopupContent profilePopup={true} callback={() => setCurrentTab(0)}>
        <form
          id="profile-creator-editor"
          onSubmit={onSaveClicked}
          encType="multipart/form-data"
        >
          <div id="profile-editor-tabs">{editorTabs}</div>
          {renderTabContent()}
          <input type="submit" id="profile-editor-save" value="Save Changes" />
          {errorVisible && (
            <div id="invalid-input-error" className="error-message">
              <p>*Fill out all required fields before saving!*</p>
            </div>
          )}
        </form>
      </PopupContent>
    </Popup>
  );
};
