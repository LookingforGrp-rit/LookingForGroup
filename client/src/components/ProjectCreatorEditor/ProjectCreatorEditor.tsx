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
} from "../../api/projects";
// import { showPopup } from '../Sidebar';  // No longer exists?

import { projectDataManager } from "../../api/data-managers/project-data-manager";
import { PendingProject } from "../../../types/types";
import { ProjectWithFollowers, } from '@looking-for-group/shared';
import { useNavigate } from "react-router-dom";

interface Props {
  newProject: boolean;
  buttonCallback?: () => void;
  updateDisplayedProject?: Dispatch<SetStateAction<ProjectWithFollowers | undefined>>
  // permissions?: number;
}

let dataManager: Awaited<ReturnType<typeof projectDataManager>>;

/**
 * This component should allow for either editing existing projects or creating new projects entirely,
 * accessed via the ‘edit project’ button on project pages or the ‘create’ button on the sidebar,
 * respectively.
 *
 * @returns React component Popup
 */
export const ProjectCreatorEditor: FC<Props> = ({ newProject, buttonCallback = () => { }, updateDisplayedProject/*permissions*/ }) => {
  //Get project ID from search parameters
  const urlParams = new URLSearchParams(window.location.search);
  const projectID = urlParams.get("projectID");

  // --- Hooks ---
  // stores user data

  const navigate = useNavigate();

  // store project data
  const [projectData, setProjectData] = useState<ProjectWithFollowers>();

  // tracking temporary project changes before committing to a save
  const [modifiedProject, setModifiedProject] = useState<PendingProject>();

  // check whether or not the data in the popup is valid
  const [failCheck, setFailCheck] = useState(false);

  // for current tab: 0 - general, 1 - Media, 2 - tags, 3 - team, 4 - links
  const [currentTab, setCurrentTab] = useState(0);

  // Errors
  const [errorAddMember, setErrorAddMember] = useState("");
  const [errorAddPosition, setErrorAddPosition] = useState("");
  const [errorLinks, setErrorLinks] = useState("");

  //State variable for error message
  const [message, setMessage] = useState("");

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
  //TODO: delete the project created by clicking this button if the window is closed/the page is refreshed/they close without saving
  //better yet give them a prompt if they wanna close without saving or do any of those
    else if (newProject) {
  // Setup default project for creation
        try {
          const response = await createNewProject({ title: "My Project" });
          if (!response.error && response.data) {
            dataManager = await projectDataManager(response.data.projectId);

            console.log(dataManager)
            const data = dataManager.getSavedProject();

            
            setProjectData(data);
            setModifiedProject(data);
            navigate(`${paths.routes.NEWPROJECT}?projectID=${data?.projectId}`);
          }
        } catch (err) {
          console.error("Error creating new project:", err);
        }
    }
  }

  buttonCallback = createOrEdit;

  // Update social links for existing projects
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

  //Save project editor changes
  //TODO: give user a prompt before they save their project
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

    try {
        await dataManager.saveChanges();
        setProjectData(dataManager.getSavedProject());

      // EXISTING PROJECT
      if (!newProject && projectID) {
        // const projectNumID = Number(projectID);
        // const picsResp = await getPics(projectNumID);
        // const dbImages = picsResp.data || [];

        // const imagesToDelete = dbImages.filter(img => !modifiedProject.images.find(i => i.image === img.image));
        // await Promise.all(imagesToDelete.map(img => deletePic(projectNumID, img.image)));

        // await Promise.all(
        //   modifiedProject.images.map(img => {
        //     if (!dbImages.find(db => db.image === img.image)) return addPic(projectNumID, img.file, img.position);
        //     return Promise.resolve();
        //   })
        // );

        // await updatePicPositions(
        //   projectNumID,
        //   modifiedProject.images.map(i => ({ id: i.id!, position: i.position }))
        // );

        // if (modifiedProject.thumbnailFile && modifiedProject.thumbnail !== projectData.thumbnail) {
        //   await updateThumbnail(projectNumID, modifiedProject.thumbnailFile);
        // }

        // await updateProject(projectNumID, modifiedProject);
        // setProjectData(modifiedProject);

        if(updateDisplayedProject) updateDisplayedProject(dataManager.getSavedProject());
      }
      window.location.reload();
        console.log(dataManager)
    } catch (err) {
        console.log("hi...?")
      console.error(err);
    }
  };
 
  // Update links, avoid links tab glitch
  // const updateLinks = () => {
  //   const newSocials: { id: number, url: string}[] = [];
  //   const parentDiv = document.querySelector("#project-editor-link-list");

  //   parentDiv?.childNodes.forEach(element => {
  //     if (element === parentDiv.lastElementChild) {
  //       return;
  //     }

  //     const dropdown = (element as HTMLElement).querySelector('select');
  //     const input = (element as HTMLElement).querySelector('input');

  //     const id = Number(dropdown?.options[dropdown?.selectedIndex].dataset.id);
  //     const url = input?.value;

  //     if (!id && !url) {
  //       return;
  //     }

  //     if (isNaN(id) || id === -1) {
  //       setErrorLinks('Select a website in the dropdown');
  //       return;
  //     }
  //     if (!url) {
  //       setErrorLinks('Enter a URL');
  //       return;
  //     }

  //     newSocials.push({id: id, url: url});
  //     setErrorLinks('');
  //    })
  //    setModifiedProject({...modifiedProject, socials: newSocials})
  // }

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
      {
        // loggedIn ? (
        <PopupContent>
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
                  // setProjectData={setModifiedProject}
                  updatePendingProject={updatePendingProject}
                  saveProject={saveProject}
                  failCheck={failCheck}
                />
              ) : currentTab === 1 ? (
                <MediaTab
                  dataManager={dataManager}
                  projectData={modifiedProject}
                  // setProjectData={setModifiedProject}
                  updatePendingProject={updatePendingProject}
                  saveProject={saveProject}
                  failCheck={failCheck}
                />
              ) : currentTab === 2 ? (
                <TagsTab
                  dataManager={dataManager}
                  projectData={modifiedProject}
                  // setProjectData={setModifiedProject}
                  updatePendingProject={updatePendingProject}
                  saveProject={saveProject}
                  failCheck={failCheck}
                />
              ) : currentTab === 3 ? (
                <TeamTab
                  dataManager={dataManager}
                  updatePendingProject={updatePendingProject}
                  saveProject={saveProject}
                  projectData={modifiedProject}
                  setProjectData={setModifiedProject}
                  setErrorMember={setErrorAddMember}
                  setErrorPosition={setErrorAddPosition} /*permissions={permissions}*/
                  failCheck={failCheck}
                />
              ) : currentTab === 4 ? (
                <LinksTab
                  dataManager={dataManager}
                  isNewProject={newProject}
                  projectData={modifiedProject}
                  saveProject={saveProject}
                  updatePendingProject={updatePendingProject}
                  setErrorLinks={setErrorLinks}
                  failCheck={failCheck}
                />
              ) : (
                <></>
              ) ) : (
                <></>
              )}
            </div>
            {/* Responsiveness fix: General Tab has its own button/error text for layout change */}
            {currentTab !== 0 ? (
              <div id="invalid-input-error" className={"save-error-msg"}>
                <p>{message}</p>
              </div>
            ) : (
              <></>
            )}
          </div>
        </PopupContent>
        // ) : (
        // Placeholder to prevent mass error
        // <div>

        // </div>
        // )
      }
    </Popup>
  );
};

