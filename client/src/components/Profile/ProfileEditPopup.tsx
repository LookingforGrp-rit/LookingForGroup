// Utilities and React functions
import { useState, useMemo, useEffect } from "react";

import { getCurrentAccount } from "../../api/users";
import * as paths from '../../constants/routes';
import { useNavigate } from "react-router-dom";

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
//const [dataManager, setDataManager] = useState<Awaited<ReturnType<typeof userDataManager>> | null>(null);

/**
 * Profile Edit button. Handles changing tabs.
 * @returns JSX Element
 */
export const ProfileEditPopup = () => {
  const [currentTab, setCurrentTab] = useState(5);
  const [errorVisible, setErrorVisible] = useState(false);
  const [modifiedProfile, setModifiedProfile] = useState<PendingUserProfile>();
  const [dataManager, setDataManager] = useState<Awaited<ReturnType<typeof userDataManager>> | null>(null);

  const navigate = useNavigate();

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

      const manager = await userDataManager();
      setDataManager(manager);

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
      if(!dataManager) return;
      await dataManager.saveChanges();
      setErrorVisible(false);
    } catch (e) {
      // TODO handle error
      console.error((e as Error).message);
    }

    navigate(`${paths.routes.PROFILE}?userID=${modifiedProfile?.userId}`);
    window.location.reload();
  };


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

  const checkValidData = (pendingProfile: PendingUserProfile): boolean => {
    if (!pendingProfile) return false;

    if (pendingProfile.firstName == "") {
      return false;
    }

    if (pendingProfile.lastName == "") {
      return false;
    }

    //Made bio optional because it is not required when making account
    // if (pendingProfile.bio == "") {
    //   return false;
    // }

    return true;
  }

  const validData = modifiedProfile? checkValidData(modifiedProfile as PendingUserProfile): false;

  /**
   * Component to organize the main tab content and handle switching tabs.
   * @returns JSX Element of the appropriate tab.
   */
  const renderTabContent = () => {
    if (!dataManager || !modifiedProfile) return <p>Loading...</p>;
    switch (currentTab) {
      case 0:
        return (
          <AboutTab
            profile={modifiedProfile}
            dataManager={dataManager}
            updatePendingProfile={setModifiedProfile}
          />
        );
      case 1:
        return (
          <ProjectsTab
            profile={modifiedProfile}
            dataManager={dataManager}
            updatePendingProfile={setModifiedProfile}
          />
        );
      case 2:
        return (
          <SkillsTab
            profile={modifiedProfile}
            dataManager={dataManager}
            updatePendingProfile={setModifiedProfile}
          />
        );
      case 3:
        return (
          <LinksTab
            profile={modifiedProfile}
            dataManager={dataManager}
            updatePendingProfile={setModifiedProfile}
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
            className={"profile-editor-save " + (validData ? "" : "hidden")}
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
