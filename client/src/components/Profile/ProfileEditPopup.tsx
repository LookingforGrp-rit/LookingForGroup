// Utilities and React functions
import { useState, useEffect } from "react";

import { editUser, getCurrentAccount } from "../../api/users";

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
  MePrivate,
  UpdateUserInput,
} from "@looking-for-group/shared";
import { userDataManager } from "../../api/data-managers/user-data-manager";
import { PendingUserProfile } from "../../../types/types";

// The profile to view is independent upon the site's state changes
const pageTabs = ["About", "Projects", "Skills", "Links"];
let dataManager: Awaited<ReturnType<typeof userDataManager>>;

export const ProfileEditPopup = () => {
  // Holds new profile image if one is selected
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [errorVisible, setErrorVisible] = useState(false);
  const [modifiedProfile, setModifiedProfile] = useState<PendingUserProfile>();

  const updatePendingProfile = (profileData: PendingUserProfile) => {
    setModifiedProfile(profileData);
  };

  // Profile should be set up on intialization
  useEffect(() => {
    const setUpProfileData = async () => {
      // Pick which socials to use based on type
      // fetch for profile on ID

      const getUser = await getCurrentAccount();
      if (getUser.error || !getUser.data) {
        // TODO do something with this error
        throw "error getting current user " + getUser.error;
      }

      setModifiedProfile(structuredClone(getUser.data));
      dataManager = await userDataManager();

      // console.log("ProfileEditPopup - Raw API response:", response.data);
      // console.log("ProfileEditPopup - User profile data:", response.data);
      //console.log('ProfileEditPopup - User interests from API:', response.data?.skills);
    };
    setUpProfileData();
  }, []);

  // TODO move to about tab
  // Send selected image to server for save
  const saveImage = async () => {
    if (!selectedImageFile) return;

    await editUser({ profileImage: selectedImageFile });
  };

  const onSaveClicked = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // prevents any default calls

    try {
      await dataManager.saveChanges();
      setErrorVisible(false);
      window.location.reload(); // reload page
    } catch (e) {
      // TODO handle error
      console.error((e as Error).message);
    }

    // probably not necessary
    // window.location.reload(); // reload page
  };

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
    if (!modifiedProfile) return <p>Loading...</p>;
    switch (currentTab) {
      case 0:
        return (
          <AboutTab
            profile={modifiedProfile}
            dataManager={dataManager}
            updatePendingProfile={updatePendingProfile}
            selectedImageFile={selectedImageFile}
            setSelectedImageFile={setSelectedImageFile}
          />
        );
      case 1:
        return (
          <ProjectsTab
            profile={modifiedProfile}
            dataManager={dataManager}
            updatePendingProfile={updatePendingProfile}
          />
        );
      case 2:
        return (
          <SkillsTab
            profile={modifiedProfile}
            dataManager={dataManager}
            updatePendingProfile={updatePendingProfile}
          />
        );
      case 3:
        return (
          <LinksTab
            profile={modifiedProfile}
            dataManager={dataManager}
            updatePendingProfile={updatePendingProfile}
          />
        );
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
          id="project-creator-editor"
          onSubmit={onSaveClicked}
          encType="multipart/form-data"
        >
          <div id="project-editor-tabs">{editorTabs}</div>
          <div id="project-editor-content">{renderTabContent()}</div>
          <input
            type="submit"
            id="project-editor-save"
            className="profile-editor-save"
            value="Save Changes"
          />
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
