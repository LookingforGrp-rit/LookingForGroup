  import { useState, FC, Dispatch, SetStateAction } from "react";
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

import { projectDataManager } from "../../api/data-managers/project-data-manager";
import { PendingProject } from "../../../types/types";
import { ProjectWithFollowers, } from '@looking-for-group/shared';
import { useNavigate } from "react-router-dom";

// NO COMMENTS FOR WHAT THESE ARE??????
interface Props {
  // If this project already exists to be edited or if it's being created
  newProject: boolean;

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
export const ProjectCreatorEditor: FC<Props> = ({ newProject, buttonCallback = () => { }, updateDisplayedProject }) => {
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

  //State variable for error message
  const [message, setMessage] = useState("");

  // Tracker that checks if the project is currently saveable.
  // If this is set to true, the "Save Changes" button appears in every tab
  const [saveable, setSaveable] = useState(false);

  // Check if the current project can be saved
  let valid = false;
  if (modifiedProject?.title != "") {
    if (modifiedProject?.hook != "") {
      if (modifiedProject?.description != "") {
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

  // Submit the form to save or create the project
  const createOrEdit = async () => {
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
  //TODO: update this to show a close without saving prompt
  const closeWithoutSaving = async () => {
    // Why is this here? If it's a new project then it won't be on the API anyway
    if(projectData && newProject) await deleteProject(projectData?.projectId)
  }


  // Isn't this what createoredit is supposed to do? it never calls this though
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
      setMessage("*Fill out all required info under General before saving!*");
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
      setMessage("*Choose a project type and tag under Tags before saving!*");
      await setFailCheck(true);

      if (errorText) {
        errorText.style.display = "block";
      }
      return;
    }

    console.log("Created project thumbnail: ");
    console.log(modifiedProject.thumbnail);

    try {
      await dataManager.saveChanges();

      // EXISTING PROJECT
      if (!newProject && projectID) {

        if(updateDisplayedProject) {
          updateDisplayedProject(dataManager.getSavedProject());
        }
      }
      navigate(`${paths.routes.NEWPROJECT}?projectID=${dataManager.getSavedProject().projectId}`)
    } catch (err) {
      console.error(err);
    }
  };

  const updatePendingProject = (updatedPendingProject: PendingProject) => {
    setModifiedProject(updatedPendingProject);
  }

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
          <p>Create</p>{" "}
        </PopupButton>
      ) : (
        <PopupButton callback={buttonCallback} buttonId="project-info-edit">
          Edit Project
        </PopupButton>
      )}

      <PopupContent callback={closeWithoutSaving}>
        
        <div id="project-creator-editor">
          <div id="project-editor-tabs">
            <button
              id="general-tab"
              onClick={() => {
                if (currentTab === 4) updateLinks();
                setCurrentTab(0);
              }}
              className={`project-editor-tab ${currentTab === 0 ? "project-editor-tab-active" : ""}`}
            >
              General
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
              Tags
            </button>
            <button
              id="team-tab"
              onClick={() => {
                if (currentTab === 4) updateLinks();
                setCurrentTab(3);
              }}
              className={`project-editor-tab ${currentTab === 3 ? "project-editor-tab-active" : ""}`}
            >
              Team
            </button>
            <button
              id="links-tab"
              onClick={() => {
                if (currentTab === 4) updateLinks();
                setCurrentTab(4);
              }}
              className={`project-editor-tab ${currentTab === 4 ? "project-editor-tab-active" : ""}`}
            >
              Links
            </button>
          </div>
              
          <div id="project-editor-content">
            {projectData && modifiedProject ? ( currentTab === 0 ? (
              <GeneralTab
                dataManager={dataManager}
                projectData={modifiedProject}
                updatePendingProject={updatePendingProject}
                saveProject={saveProject}
                saveable={saveable}
                failCheck={failCheck}
              />
            ) : currentTab === 1 ? (
              <MediaTab
                dataManager={dataManager}
                projectData={modifiedProject}
                updatePendingProject={updatePendingProject}
                saveProject={saveProject}
                saveable={saveable}
                failCheck={failCheck}
              />
            ) : currentTab === 2 ? (
              <TagsTab
                dataManager={dataManager}
                projectData={modifiedProject}
                updatePendingProject={updatePendingProject}
                saveProject={saveProject}
                saveable={saveable}
                failCheck={failCheck}
              />
            ) : currentTab === 3 ? (
              <TeamTab
                dataManager={dataManager}
                updatePendingProject={updatePendingProject}
                saveProject={saveProject}
                projectData={modifiedProject}
                setErrorMember={setErrorAddMember}
                setErrorPosition={setErrorAddPosition} /*permissions={permissions}*/
                saveable={saveable}
                failCheck={failCheck}
              />
            ) : currentTab === 4 ? (
              <LinksTab
                dataManager={dataManager}
                projectData={modifiedProject}
                saveProject={saveProject}
                updatePendingProject={updatePendingProject}
                setErrorLinks={setErrorLinks}
                saveable={saveable}
                failCheck={failCheck}
              />
            ) : (
              <></>
            ) ) : (
              <></>
            )}
          </div>
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

