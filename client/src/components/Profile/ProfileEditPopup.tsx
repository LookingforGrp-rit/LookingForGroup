// Utilities and React functions
import { useState, useEffect } from "react";

import { getCurrentAccount } from "../../api/users";

// Components
import { Popup, PopupButton, PopupContent } from "../Popup";

// Tabs
import { AboutTab } from "./tabs/AboutTab";
import { LinksTab } from "./tabs/LinksTab";
import { ProjectsTab } from "./tabs/ProjectsTab";
import { SkillsTab } from "./tabs/SkillsTab";
import { userDataManager } from "../../api/data-managers/user-data-manager";
import { PendingUserProfile } from "../../../types/types";

// The profile to view is independent upon the site's state changes
const pageTabs = ["About", "Projects", "Skills", "Links"];
let dataManager: Awaited<ReturnType<typeof userDataManager>>;

/**
 * Profile Edit button. Handles changing tabs.
 * @returns JSX Element
 */
export const ProfileEditPopup = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [errorVisible, setErrorVisible] = useState(false);
  const [modifiedProfile, setModifiedProfile] = useState<PendingUserProfile>();

  /**
   * Updates the temporary profile data.
   * @param profileData The user's profile data.
   */
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

  /**
   * Receives changed/inputted information and stores it. Reloads page with new information.
   * @param e Event
   */
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

  /**
   * Component to organize the main tab content and handle switching tabs.
   * @returns JSX Element of the appropriate tab.
   */
  const renderTabContent = () => {
    if (!modifiedProfile) return <p>Loading...</p>;
    switch (currentTab) {
      case 0:
        return (
          <AboutTab
            profile={modifiedProfile}
            dataManager={dataManager}
            updatePendingProfile={updatePendingProfile}
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
