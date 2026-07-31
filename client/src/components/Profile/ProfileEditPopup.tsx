// Utilities and React functions
import { useState, useEffect, useRef } from "react";

import { getCurrentAccount } from "../../api/users";
import { useNavigate } from "react-router-dom";

// Components
import { Popup, PopupButton, PopupContent } from "../Popup";
import { ThemeIcon } from "../ThemeIcon";

// Tabs
import { AboutTab } from "./tabs/AboutTab";
import { LinksTab } from "./tabs/LinksTab";
import { ProjectsTab } from "./tabs/ProjectsTab";
import { SkillsTab } from "./tabs/SkillsTab";
import { userDataManager } from "../../api/data-managers/user-data-manager";
import { DeleteAccountButton } from "./DeleteAccountButton";
import { PendingUserProfile } from "../../../types/types";
import { MePrivate } from "@looking-for-group/shared";
import { GalleryTab } from "./tabs/GalleryTab";

// The profile to view is independent upon the site's state changes
const pageTabs = ["About", "Projects", "Skills", "Gallery", "Links"];
//const [dataManager, setDataManager] = useState<Awaited<ReturnType<typeof userDataManager>> | null>(null);

//for editing user profile through buttons near "Skills" and "Contact",
//so they open up to the appropriate tab
interface EditProfileProps {
  editSkills?: boolean;
  editContact?: boolean;
  editGallery?: boolean;
}

/**
 * Profile Edit button. Handles changing tabs.
 * @returns JSX Element
 */
export const ProfileEditPopup = ({ editSkills = false, editContact = false, editGallery = false }: EditProfileProps) => {
  const [currentTab, setCurrentTab] = useState(0);
  const [errorVisible, setErrorVisible] = useState(false);
  const [modifiedProfile, setModifiedProfile] = useState<PendingUserProfile>();
  const [unmodifiedProfile, setUnmodifiedProfile] = useState<MePrivate>();
  const [dataManager, setDataManager] = useState<Awaited<ReturnType<typeof userDataManager>> | null>(null);
  const [confirm, setConfirm] = useState(false);
  const [saved, setSaved] = useState(true);
  // Bumped on close to force the tab subtree to remount, so uncontrolled inputs
  // (e.g. the Select dropdowns seeded from initialVal) reset along with state.
  const [editorKey, setEditorKey] = useState(0);

  const isOpening = useRef(true);
  const isSaving = useRef(false);
  const navigate = useNavigate();

  /**
   * Runs when the editor popup is closed. Discards any unsaved edits so that
   * reopening the editor shows the current saved profile instead of stale
   * in-editor changes. (The component stays mounted while the popup is hidden,
   * so this state would otherwise persist until a full page refresh.)
   */
  const handleEditorClose = () => {
    if (editSkills) setCurrentTab(2);
    else if (editGallery) setCurrentTab(3);
    else if (editContact) setCurrentTab(4);
    else setCurrentTab(0);

    isOpening.current = true;

    // Discard unsaved field edits...
    if (unmodifiedProfile) setModifiedProfile(structuredClone(unmodifiedProfile));
    // ...and the pending changes tracked by the data manager, so they can't be
    // re-applied on a later save.
    dataManager?.resetChanges();
    setSaved(true);

    // Remount the tabs so their inputs re-seed from the reset profile.
    setEditorKey((key) => key + 1);
  };

  // Fires when the popup is closed (X, Escape, or click-outside). With
  // confirmation={!saved} on the PopupContent below, an unsaved close is
  // intercepted — the popup stays open and we surface the confirm dialog
  // instead of discarding the edits.
  const handlePopupCallback = () => {
    // A save navigates + reloads; don't flash the confirm dialog during it.
    if (isSaving.current) return;
    if (saved) {
      handleEditorClose();
    } else {
      setConfirm(true);
    }
  };

  const cancelConfirm = () => setConfirm(false);

  // User confirmed they want to leave without saving: discard edits and let the
  // popup close (the Confirm button has doNotClose=false, so it closes itself).
  const confirmExit = () => {
    setConfirm(false);
    handleEditorClose();
  };

  const updatePendingProfile = (updatedPendingProject: PendingUserProfile) => {
    setModifiedProfile(updatedPendingProject);
    setSaved(false);
  }

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

      setUnmodifiedProfile(getUser.data);
      setModifiedProfile(structuredClone(getUser.data));

      const manager = await userDataManager();
      setDataManager(manager);

      // console.log("ProfileEditPopup - Raw API response:", response.data);
      // console.log("ProfileEditPopup - User profile data:", response.data);
      //console.log('ProfileEditPopup - User interests from API:', response.data?.skills);
    };
    setUpProfileData();
  }, []);

  // Warn on browser-level navigation/refresh while there are unsaved edits,
  // matching the project creator/editor behavior.
  useEffect(() => {
    window.onbeforeunload = () => {
      if (!saved) return ' ';
    };
    return () => {
      window.onbeforeunload = null;
    };
  }, [saved]);

  /**
   * Receives changed/inputted information and stores it. Reloads page with new information.
   * @param e Event
   */
  const onSaveClicked = async (e: React.FormEvent<HTMLFormElement>) => {
    isSaving.current = true;
    navigate(-1);
    e.preventDefault(); // prevents any default calls

    console.log('Saving...'); //yo having this like change the button as feedback for the user that it's saving could be amazing holup

    try {
      if (!dataManager) return;
      await dataManager.saveChanges();
      setErrorVisible(false);
    } catch (e) {
      // TODO handle error
      console.error((e as Error).message);
    }
    setSaved(true);
    // Clear the unsaved-changes guard so the save's own reload below doesn't
    // trigger a spurious "leave site?" browser prompt.
    window.onbeforeunload = null;
    window.location.reload();
  };

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

  //if button clicked apppears in skills or contacts, set starting tab to appropriate value
  const editButtonAppearance = () => {
    if (editSkills) setCurrentTab(2);
    else if (editGallery) setCurrentTab(3);
    else if (editContact) setCurrentTab(4);
    else setCurrentTab(0);
  }

  const validData = modifiedProfile ? checkValidData(modifiedProfile as PendingUserProfile) : false;

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
            unmodifiedProfile={unmodifiedProfile!}
            dataManager={dataManager}
            updatePendingProfile={updatePendingProfile}
          />
        );
      case 1:
        return (
          <ProjectsTab
            profile={modifiedProfile}
            unmodifiedProfile={unmodifiedProfile!}
            dataManager={dataManager}
            updatePendingProfile={updatePendingProfile}
          />
        );
      case 2:
        return (
          <SkillsTab
            profile={modifiedProfile}
            unmodifiedProfile={unmodifiedProfile!}
            dataManager={dataManager}
            updatePendingProfile={updatePendingProfile}
          />
        );
      case 3:
        return (
          <GalleryTab
            profile={modifiedProfile}
            dataManager={dataManager}
          />
        )
      case 4:
        return (
          <LinksTab
            profile={modifiedProfile}
            unmodifiedProfile={unmodifiedProfile!}
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
      <PopupButton buttonId="project-info-edit" callback={editButtonAppearance}>
        {editSkills || editContact || editGallery ?
          <ThemeIcon
            id={"pencil"}
            width={11}
            height={12}
            className={"gradient-color-fill edit-project-member-icon"}
            ariaLabel={"edit"} />
          : "Edit Profile"}

      </PopupButton>
      <PopupContent profilePopup={true} callback={handlePopupCallback} confirmation={!saved}>
        {confirm ? (
          <PopupContent confirmation={true} useClose={false}>
            <div id="confirm-editor-save-text">Are you sure you want to exit without saving?</div>
            <div id="confirm-editor-save">
              <PopupButton doNotClose={() => false} callback={confirmExit} buttonId="project-editor-save">
                Confirm
              </PopupButton>
              <PopupButton doNotClose={() => true} callback={cancelConfirm} buttonId="team-edit-member-cancel-button">
                Cancel
              </PopupButton>
            </div>
          </PopupContent>
        ) : ""}
        <div id="project-creator-editor">
          <div id="project-editor-tabs">{editorTabs}</div>
          <div id="project-editor-content" key={editorKey}>{renderTabContent()}</div>
          <div className="editor-save-actions">
            <form
              //id="project-creator-editor"
              onSubmit={onSaveClicked}
              encType="multipart/form-data">
              <input
                type="submit"
                id="project-editor-save"
                className={"profile-editor-save " + (validData ? "" : "hidden")}
                value="Save Changes"
              />
            </form>

            <DeleteAccountButton />
          </div>

          {errorVisible && (
            <div id="invalid-input-error" className="error-message">
              <p>*Fill out all required fields before saving!*</p>
            </div>
          )}
        </div>
      </PopupContent>
    </Popup>
  );
};
