import { useState, useRef, FC, Dispatch, SetStateAction } from "react";
import { Popup, PopupButton, PopupContent } from "../Popup";
import { GeneralTab } from "./tabs/GeneralTab";
import { MediaTab } from "./tabs/MediaTab";
import { LinksTab } from "./tabs/LinksTab";
import { TeamTab } from "./tabs/TeamTab";
import { TagsTab } from "./tabs/TagsTab";
import { ThemeIcon } from "../ThemeIcon";
import * as paths from '../../constants/routes';
import {
  createNewProject,
  getProjectSocials,
  updateProjectSocial,
  addProjectSocial,
  deleteProjectSocial,
  deleteProject,
} from "../../api/projects";

import { getProjectsByUser } from "../../api/users";
import { projectDataManager } from "../../api/data-managers/project-data-manager";
import { PendingProject } from "../../../types/types";
import { ProjectWithFollowers, } from '@looking-for-group/shared';
import { useNavigate } from "react-router-dom";
import { getCurrentUsername } from "../../api/users";

// NO COMMENTS FOR WHAT THESE ARE??????
interface Props {
  // If this project already exists to be edited or if it's being created
  newProject: boolean;

  //if the user is currently in mobile view, set to true (default is false)-
  //created for styling of bottom navbar in mobile view
  mobileView: boolean;

  // Not a real property, set to a variable to a function in the code
  buttonCallback?: () => void;

  // Unused property, don't know why it's here
  updateDisplayedProject?: Dispatch<SetStateAction<ProjectWithFollowers | undefined>>
  // permissions?: number;
}

let dataManager: Awaited<ReturnType<typeof projectDataManager>>;

/**
 * This component enables both creating new projects and editing existing ones. 
 * It provides a tabbed interface for managing different aspects of a project, including general information, media, tags, team members, and social links. 
 * The component is accessed via either the 'edit project' button on project pages or the 'create' button in the sidebar.
 * @returns React component Popup - Renders a modal for creating or editing projects
 */
export const ProjectCreatorEditor: FC<Props> = ({ newProject, mobileView = false, buttonCallback = () => { }, updateDisplayedProject }) => {
  //Get project ID from search parameters
  const urlParams = new URLSearchParams(window.location.search);
  const navigate = useNavigate();
  const projectID = urlParams.get("projectID");

  // --- Hooks ---

  // Stores current project data: represents actual data from the server
  const [projectData, setProjectData] = useState<ProjectWithFollowers>();

  // Tracks temporary project data changes before saving: compared against projectData
  const [modifiedProject, setModifiedProject] = useState<PendingProject>();

  // Indicates if the data validation has failed: prevents saving when invalid
  const [failCheck, setFailCheck] = useState(false);

  // Tracks which tab is currently active: 0 - general, 1 - Media, 2 - tags, 3 - team, 4 - links
  const [currentTab, setCurrentTab] = useState(0);

  // Error message for member validation (used in TeamTab)
  const [errorAddMember, setErrorAddMember] = useState("");
  // Error message for position addition (used in TeamTab)
  const [errorAddPosition, setErrorAddPosition] = useState("");
  // Error message for Links validation (used in LinksTab)
  const [errorLinks, setErrorLinks] = useState("");

  // Tracker that checks if the project is currently saveable.
  // If this is set to true, the "Save Changes" button appears in every tab
  const [saveable, setSaveable] = useState(false);

  // Tracks whether the project was successfully saved (prevents deletion on cleanup after save)
  const [saved, setSaved] = useState(true);

  const [confirm, setConfirm] = useState(false);

  const [message, setMessage] = useState("");

  // Component Refs
  const exitButton = useRef(null);
  const startButton = useRef(null);

  // Check if the current project can be saved
  let valid = false;
  if (modifiedProject?.title != "" && modifiedProject?.title != undefined) {
    if (modifiedProject?.hook != "" && modifiedProject?.hook != undefined) {
      if (modifiedProject?.description != "" && modifiedProject?.description != undefined) {
        valid = true;
      }
    }
  }
  if (modifiedProject?.tags.length == 0 || modifiedProject?.mediums.length == 0) {
    valid = false;
  }
  if (valid != saveable) {
    setSaveable(valid);
  }

  /**
   * update the red missing fields message to show what is missing from the page
   */
  const updateMessage = async () => {
    let newMessage = "";
    if (modifiedProject?.title === "" || modifiedProject?.title === undefined) newMessage = "Project is missing a title!";
    else if (modifiedProject?.mediums.length == 0) newMessage = "Project is missing a medium!";
    else if (modifiedProject?.tags.length == 0) newMessage = "Project is missing tags!";
    else if (modifiedProject?.hook === "" || modifiedProject?.hook === undefined) newMessage = "Project is missing a short description!";
    else if (modifiedProject?.description === "" || modifiedProject?.description === undefined) newMessage = "Project is missing a description!";

    setMessage(newMessage);
  }

  /**
   * faster version of updateMessage, for use with updateDisplayedProject()
   * @param updatedPendingProject - parameter of updateDisplayedProject, using is faster than trying for modifiedProject
   */
  const fastUpdateMessage = (updatedPendingProject: PendingProject) => {
    let newMessage = "Project is missing hate";
    if (updatedPendingProject?.title === "" || updatedPendingProject?.title === undefined) newMessage = "Project is missing a title!";
    else if (updatedPendingProject?.mediums.length == 0) newMessage = "Project is missing a medium!";
    else if (updatedPendingProject?.tags.length == 0) newMessage = "Project is missing tags!";
    else if (updatedPendingProject?.hook === "" || updatedPendingProject?.hook === undefined) newMessage = "Project is missing a Short Description!";
    else if (updatedPendingProject?.description === "" || updatedPendingProject?.description === undefined) newMessage = "Project is missing an About This Project!";
    setMessage(newMessage);
  }

  // Start editing the project creator
  const createOrEdit = async () => {
    setSaved(true);
    setConfirm(false);
    const res = await getCurrentUsername();
    if (!(res.status === 200 && res.data?.username)) {
      //redirect user to login if they aren't logged in
      navigate(paths.routes.LOGIN);
      return;
    }

    if (!newProject && projectID) {

      // Load existing project
      try {
        // const response = await getByID(Number(projectID));
        // if (!response.data) return;

        dataManager = await projectDataManager(Number(projectID));

        const data = dataManager.getSavedProject();
        setProjectData(data);
        setModifiedProject(data);
      } catch (err) {
        console.error("Error loading existing project:", err);
      }
    }
    else if (newProject) {
      // Setup default project for creation
      try {
        const response = await createNewProject({ title: "My Project" });
        if (!response.error && response.data) {
          dataManager = await projectDataManager(response.data.projectId);

          const data = dataManager.getSavedProject();

          setProjectData(data);
          setModifiedProject(data);
          console.log(projectData);
        }
      } catch (err) {
        console.error("Error creating new project:", err);
      }
    }
    if (startButton.current) {
      (startButton.current as unknown as HTMLElement).focus();
    }
    updateMessage();
  }

  buttonCallback = createOrEdit;

  /**
   * Collects and validates all link information from the LinksTab
   * Updates the modifiedProject state with valid link data
   * Sets error messages for invalid link data
   * @returns void
   */
  const updateLinks = async () => {
    if (newProject || !projectID) return; // Only for existing projects

    const projectNumID = Number(projectID);

    try {
      // Get current socials from database
      const currentSocialsResponse = await getProjectSocials(projectNumID);
      const currentSocials = currentSocialsResponse.data || [];

      // Process each social in the modified project
      for (const social of modifiedProject?.projectSocials || []) {
        if (!social.url || !social.websiteId || social.websiteId === 0) continue; // Skip empty/invalid socials

        // Check if this social already exists
        const existingSocial = currentSocials.find(s => s.websiteId === social.websiteId);

        if (existingSocial) {
          // Update existing social if URL changed
          if (existingSocial.url !== social.url) {
            await updateProjectSocial(projectNumID, social.websiteId, { url: social.url });
          }
        } else {
          // Create new social
          await addProjectSocial(projectNumID, { websiteId: social.websiteId, url: social.url });
        }
      }

      // Delete socials that were removed
      const modifiedSocialIds = (modifiedProject?.projectSocials || [])
        .filter(s => s.url && s.websiteId && s.websiteId !== 0)
        .map(s => s.websiteId);

      for (const currentSocial of currentSocials) {
        if (!modifiedSocialIds.includes(currentSocial.websiteId)) {
          await deleteProjectSocial(projectNumID, currentSocial.websiteId);
        }
      }
    } catch (error) {
      console.error('Error updating social links:', error);
      setErrorLinks('Error updating social links. Please try again.');
    }
  };

  //this deletes the newly created project when the create window is manually closed
  //this is called below as the PopupContent's callback function (that only calls when it's closed so should it just be called onClose?)
  const closeWithoutSaving = async () => {
    // Why is this here? If it's a new project then it won't be on the API anyway
    setCurrentTab(0);
    // Only delete if this is a new project AND it was not saved yet
    if (projectData && newProject && !saved) await deleteProject(projectData?.projectId);
  }

  const toggleConfirm = async () => {
    setConfirm(!confirm);
  }

  // Isn't this what createoredit is supposed to do? it never calls this though


  /**
   *  Adds a number to the end of a project so you don't have duplicate project titles(Unity style)
   * @returns A unique project title
   */
  const getUniqueProjectTitle = async (
    desiredTitle: string,
    currentProjectId: number
  ): Promise<string> => {
    const base = desiredTitle.trim();

    const res = await getProjectsByUser();
    const projects = res.data ?? [];

    // Lower-cased titles of the user's OTHER projects
    const takenNames = new Set(
      projects
        .filter((p) => p.projectId !== currentProjectId)
        .map((p) => p.title.trim().toLowerCase())
    );

    if (!takenNames.has(base.toLowerCase())) {
      return base;
    }

    // Find the lowest available "(n)" suffix
    let n = 1;
    while (takenNames.has(`${base}(${n})`.toLowerCase())) {
      n++;
    }
    updateMessage();
    return `${base}(${n})`;
  };

  /**
   * Handles saving project changes to the server, validates input data before saving
   * For existing projects: updates thumbnails, images, positions, and project information
   * For new projects: creates the project and adds images and thumbnails
   * Handles errors during the save process
   * @returns Promise<void>
   */
  const saveProject = async () => {

    // default to no errors
    setFailCheck(false);

    // save if on link tab
    if (currentTab === 4) await updateLinks();

    //Error Handling
    if (errorAddMember !== "" || errorAddPosition !== "" || errorLinks !== "") {
      await setFailCheck(true);
      return;
    }
    //pops up error text if required fields in general haven't been filled out
    if (
      !modifiedProject?.title ||
      !modifiedProject.description ||
      !modifiedProject.status ||
      !modifiedProject.hook
    ) {
      const errorText = document.getElementById("invalid-input-error");
      await setFailCheck(true);

      if (errorText) {
        errorText.style.display = "block";
      }
      return;
    }

    //pops up error text if no tags have been chosen
    if (
      modifiedProject.tags.length == 0 ||
      modifiedProject.mediums.length == 0
    ) {
      const errorText = document.getElementById("invalid-input-error");
      await setFailCheck(true);

      if (errorText) {
        errorText.style.display = "block";
      }
      return;
    }

    console.log("Created project thumbnail: ");
    console.log(modifiedProject.thumbnail);
    setCurrentTab(0);

    // Prevent duplicate project names in the user's project list.
    // If the title collides with another of their projects, auto-rename it
    // (e.g. "ProjectTitle" -> "ProjectTitle(1)").
    const currentProjectId = dataManager.getSavedProject().projectId;
    const uniqueTitle = await getUniqueProjectTitle(
      modifiedProject.title,
      currentProjectId
    );
    if (uniqueTitle !== modifiedProject.title) {
      dataManager.updateFields({
        id: { value: currentProjectId, type: "canon" },
        data: { title: uniqueTitle },
      });
      setModifiedProject({ ...modifiedProject, title: uniqueTitle });
    }

    try {
      await dataManager.saveChanges();

      // EXISTING PROJECT
      if (!newProject && projectID) {

        if (updateDisplayedProject) {
          updateDisplayedProject(dataManager.getSavedProject());
        }
      }

      // Mark project as saved so cleanup won't delete it
      setSaved(true);
      navigate(`${paths.routes.PROJECT}?projectID=${dataManager.getSavedProject().projectId}`);
    } catch (err) {
      console.error(err);
    }
  };

  const updatePendingProject = (updatedPendingProject: PendingProject) => {
    setModifiedProject(updatedPendingProject);
    setSaved(false);
    fastUpdateMessage(updatedPendingProject);
  }

  const generalTabInvalid = !modifiedProject?.title || !modifiedProject?.hook || !modifiedProject?.description;
  const tagsTabInvalid = modifiedProject?.tags.length === 0 || modifiedProject?.mediums.length === 0;
  const teamTabInvalid = errorAddMember !== "" || errorAddPosition !== "";
  const linksTabInvalid = errorLinks !== "";

  return (
    <Popup>
      {newProject ? (
        <PopupButton callback={buttonCallback} buttonId="project-info-create">
          {" "}
          <ThemeIcon
            id={"create"}
            width={25}
            height={25}
            className={"color-fill"}
            ariaLabel={"create"}
          />{" "}
          {!mobileView ? <p>Create</p> : ""}

        </PopupButton>
      ) : (
        <PopupButton callback={buttonCallback} buttonId="project-info-edit">
          Edit Project
        </PopupButton>
      )}

      <PopupContent callback={saved ? toggleConfirm : closeWithoutSaving} closeButtonRef={exitButton} confirmation={!saved}>
        {confirm ? <PopupContent confirmation={true} useClose={false}>
          <div id="confirm-editor-save-text">Are you sure you want to exit without saving?</div>
          <div id="confirm-editor-save">
            <PopupButton doNotClose={() => false} callback={closeWithoutSaving} buttonId="project-editor-save">
              Confirm
            </PopupButton>
            <PopupButton doNotClose={() => true} callback={toggleConfirm} buttonId="team-edit-member-cancel-button" >
              Cancel
            </PopupButton>
          </div>
        </PopupContent> : ""}
        <div id="project-creator-editor">
          <div id="project-editor-tabs">
            <button
              id="general-tab"
              onClick={() => {
                if (currentTab === 4) updateLinks();
                setCurrentTab(0);
              }}
              className={`project-editor-tab ${currentTab === 0 ? "project-editor-tab-active" : ""}`}
              ref={startButton}
            >
              General{generalTabInvalid && <span className="invalid-tab-alert" aria-hidden="true">*</span>}
            </button>
            <button
              id="media-tab"
              onClick={() => {
                if (currentTab === 4) updateLinks();
                setCurrentTab(1);
              }}
              className={`project-editor-tab ${currentTab === 1 ? "project-editor-tab-active" : ""}`}
            >
              Media
            </button>
            <button
              id="tags-tab"
              onClick={() => {
                if (currentTab === 4) updateLinks();
                setCurrentTab(2);
              }}
              className={`project-editor-tab ${currentTab === 2 ? "project-editor-tab-active" : ""}`}
            >
              Tags{tagsTabInvalid && <span className="invalid-tab-alert" aria-hidden="true">*</span>}
            </button>
            <button
              id="team-tab"
              onClick={() => {
                if (currentTab === 4) updateLinks();
                setCurrentTab(3);
              }}
              className={`project-editor-tab ${currentTab === 3 ? "project-editor-tab-active" : ""}`}
            >
              Team{teamTabInvalid && <span className="invalid-tab-alert" aria-hidden="true">*</span>}
            </button>
            <button
              id="links-tab"
              onClick={() => {
                if (currentTab === 4) updateLinks();
                setCurrentTab(4);
              }}
              className={`project-editor-tab ${currentTab === 4 ? "project-editor-tab-active" : ""}`}
            >
              Links{linksTabInvalid && <span className="invalid-tab-alert" aria-hidden="true">*</span>}
            </button>
          </div>

          <div id="project-editor-content">
            {projectData && modifiedProject ? (currentTab === 0 ? (
              <GeneralTab
                dataManager={dataManager}
                projectData={modifiedProject}
                unmodifiedProject={projectData}
                updatePendingProject={updatePendingProject}
                saveProject={saveProject}
                saveable={saveable}
                failCheck={failCheck}
                message={message}
              />
            ) : currentTab === 1 ? (
              <MediaTab
                dataManager={dataManager}
                projectData={modifiedProject}
                unmodifiedProject={projectData}
                updatePendingProject={updatePendingProject}
                saveProject={saveProject}
                saveable={saveable}
                failCheck={failCheck}
                message={message}
              />
            ) : currentTab === 2 ? (
              <TagsTab
                dataManager={dataManager}
                projectData={modifiedProject}
                unmodifiedProject={projectData}
                updatePendingProject={updatePendingProject}
                saveProject={saveProject}
                saveable={saveable}
                failCheck={failCheck}
                message={message}
              />
            ) : currentTab === 3 ? (
              <TeamTab
                dataManager={dataManager}
                updatePendingProject={updatePendingProject}
                saveProject={saveProject}
                projectData={modifiedProject}
                unmodifiedProject={projectData}
                setErrorMember={setErrorAddMember}
                setErrorPosition={setErrorAddPosition} /*permissions={permissions}*/
                saveable={saveable}
                failCheck={failCheck}
                message={message}
              />
            ) : currentTab === 4 ? (
              <LinksTab
                dataManager={dataManager}
                projectData={modifiedProject}
                unmodifiedProject={projectData}
                saveProject={saveProject}
                updatePendingProject={updatePendingProject}
                setErrorLinks={setErrorLinks}
                saveable={saveable}
                failCheck={failCheck}
                message={message}
              />
            ) : (
              <></>
            )) : (
              <></>
            )}
          </div>

          {/*Focus control*/}
          <div tabIndex={0} onFocus={() => (exitButton.current as unknown as HTMLElement).focus()}></div>

          {/* Responsiveness fix: General Tab has its own button/error text for layout change 
            - This never actually displays anywhere, so I'm commenting it out
          */}
          {/*
          currentTab !== 0 ? (
            <div id="invalid-input-error" className={"save-error-msg"}>
              <p>{message}</p>
            </div>
          ) : (
            <></>
          )
          */}
        </div>
      </PopupContent>

    </Popup>
  );
};

