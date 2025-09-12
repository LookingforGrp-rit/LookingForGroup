//Styles
import '../Styles/discoverMeet.css';
import '../Styles/general.css';
import '../Styles/imageUploader.css'
import '../Styles/notification.css';
import '../Styles/projects.css';
import '../Styles/pages.css';

import { useEffect, useState, FC } from 'react';
import { Popup, PopupButton, PopupContent } from '../Popup';
import { GeneralTab } from './tabs/GeneralTab';
import { MediaTab } from './tabs/MediaTab';
import { LinksTab } from './tabs/LinksTab';
import { TeamTab } from './tabs/TeamTab';
import { TagsTab } from './tabs/TagsTab';
import { ThemeIcon } from '../ThemeIcon';
import { loggedIn } from '../Header';
import { createNewProject, getByID, updateProject, getPics, addPic, updatePicPositions, deletePic, updateThumbnail } from '../../api/projects';
import { getUsersById } from '../../api/users';
// import { showPopup } from '../Sidebar';  // No longer exists?

//backend base url for getting images
const API_BASE = `http://localhost:8081`;

interface Image {
  id: number;
  image: string;
  position: number;
}

interface ProjectData {
  audience: string;
  description: string;
  hook: string;
  images: Image[];
  jobs: { titleId: number; jobTitle: string; description: string; availability: string; location: string; duration: string; compensation: string; }[];
  members: { firstName: string, lastName: string, jobTitle: string, profileImage: string, userId: number }[];
  projectId?: number;
  projectTypes: { id: number, projectType: string }[];
  purpose: string;
  socials: { id: number, url: string }[];
  status: string;
  tags: { id: number, position: number, tag: string, type: string }[];
  thumbnail: string;
  thumbnailFile?: File;
  title: string;
  userId?: number;
}

interface User {
  firstName: string,
  lastName: string,
  username: string,
  primaryEmail: string,
  userId: number
}

interface Props {
  newProject: boolean;
  buttonCallback?: () => void;
  user?: User;
  permissions?: number;
}

// default value for project data
const emptyProject: ProjectData = {
  audience: '',
  description: '',
  hook: '',
  images: [],
  jobs: [],
  members: [],
  projectTypes: [],
  purpose: '',
  socials: [],
  status: '',
  tags: [],
  thumbnail: '',
  title: '',
};

/**
 * This component should allow for either editing existing projects or creating new projects entirely,
 * accessed via the ‘edit project’ button on project pages or the ‘create’ button on the sidebar,
 * respectively.
 * 
 * @returns React component Popup
 */
export const ProjectCreatorEditor: FC<Props> = ({ newProject, buttonCallback = () => { }, user, permissions }) => {
  //Get project ID from search parameters
  const urlParams = new URLSearchParams(window.location.search);
  const projectID = urlParams.get('projectID');

  // --- Hooks ---
  // store project data
  const [projectData, setProjectData] = useState(emptyProject);

  // tracking temporary project changes before committing to a save
  const [modifiedProject, setModifiedProject] = useState(emptyProject);

  // check whether or not the data in the popup is valid
  const [failCheck, setFailCheck] = useState(false);

  // for current tab: 0 - general, 1 - Media, 2 - tags, 3 - team, 4 - links
  const [currentTab, setCurrentTab] = useState(0);

  // Errors
  const [errorAddMember, setErrorAddMember] = useState('');
  const [errorAddPosition, setErrorAddPosition] = useState('');
  const [errorLinks, setErrorLinks] = useState('');

  //State variable for error message
  const [message, setMessage] = useState('')

  // Load existing project
  useEffect(() => {
    if (!newProject && projectID) {
      const loadProject = async () => {
        try {
          const response = await getByID(Number(projectID));
          if (!response.data) return;
          const data = response.data;
          data.userId = user?.userId;
          setProjectData(data);
          setModifiedProject(data);
        } catch (err) {
          console.error("Error loading existing project:", err);
        }
      };
      loadProject();
    }
  }, [newProject, projectID, user]);

  // Setup default project for creation
  useEffect(() => {
    setErrorLinks('');
    if (newProject && user) {
      const initProject = async() => {
        const project: ProjectData = { ...emptyProject, userId: user.userId };
        try {
          const response = await getUsersById(user.userId.toString());
          // Add creator as Project Lead
          const member = {
            firstName: user?.firstName || '',
            lastName: user?.lastName || '',
            jobTitle: 'Project Lead',
            profileImage: response.data?.profileImage || '',
            userId: user?.userId || 0
          };
          projectData.members = [member];
        } catch (error) {
          console.error(error);
        }
        setModifiedProject(project);
      };
      initProject();
    }
  }, [newProject, user]);

  //Save project editor changes
  const saveProject = async () => {
    // default to no errors
    setFailCheck(false);

    // save if on link tab
    if (currentTab === 4) updateLinks();

    //Error Handling
    if (errorAddMember !== '' ||
      errorAddPosition !== '' ||
      errorLinks !== '') {
      setFailCheck(true);
      return;
    }
    //pops up error text if required fields in general haven't been filled out
    if (!modifiedProject.title || !modifiedProject.description || !modifiedProject.status || !modifiedProject.hook) {
      const errorText = document.getElementById('invalid-input-error');
      setMessage('*Fill out all required info under General before saving!*');

      if (errorText) {
        errorText.style.display = 'block'
      }
      return;
    }

    //pops up error text if no tags have been chosen
    if (modifiedProject.tags.length == 0 || modifiedProject.projectTypes.length == 0) {
      const errorText = document.getElementById('invalid-input-error');
      setMessage('*Choose a project type and tag under Tags before saving!*');

      if (errorText) {
        errorText.style.display = 'block'
      }
      return;
    }

    try {
      // NEW PROJECT
      if (newProject && user) {
        const resp = await createNewProject(
          user.userId,
          modifiedProject.title,
          modifiedProject.hook,
          modifiedProject.description,
          modifiedProject.purpose,
          modifiedProject.status,
          modifiedProject.audience,
          modifiedProject.projectTypes,
          modifiedProject.tags,
          modifiedProject.jobs,
          modifiedProject.members,
          modifiedProject.socials
        );
        const newProjectID = resp.data?.projectId;
        if (!newProjectID) return;

        // Upload images
        await Promise.all(
          modifiedProject.images.map(image => addPic(newProjectID, image.file, image.position))
        );

        if (modifiedProject.thumbnailFile) {
          await updateThumbnail(newProjectID, modifiedProject.thumbnailFile);
        }

        setProjectData(modifiedProject);
      }

      // EXISTING PROJECT
      if (!newProject && projectID) {
        const projectNumID = Number(projectID);
        const picsResp = await getPics(projectNumID);
        const dbImages = picsResp.data || [];

        const imagesToDelete = dbImages.filter(img => !modifiedProject.images.find(i => i.image === img.image));
        await Promise.all(imagesToDelete.map(img => deletePic(projectNumID, img.image)));

        await Promise.all(
          modifiedProject.images.map(img => {
            if (!dbImages.find(db => db.image === img.image)) return addPic(projectNumID, img.file, img.position);
            return Promise.resolve();
          })
        );

        await updatePicPositions(
          projectNumID,
          modifiedProject.images.map(i => ({ id: i.id!, position: i.position }))
        );

        if (modifiedProject.thumbnailFile && modifiedProject.thumbnail !== projectData.thumbnail) {
          await updateThumbnail(projectNumID, modifiedProject.thumbnailFile);
        }

        await updateProject(projectNumID, modifiedProject);
        setProjectData(modifiedProject);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Popup>
      {
        newProject ? (
          <PopupButton callback={buttonCallback} buttonId='project-info-create' > <ThemeIcon id={'create'} width={25} height={25} className={'color-fill'} ariaLabel={'create'}/> <p>Create</p> </PopupButton>
        ) : (
          <PopupButton callback={buttonCallback} buttonId="project-info-edit">Edit Project</PopupButton>
        )
      }
      {
        loggedIn ? (
          <PopupContent>
            <div id="project-creator-editor">
              <div id="project-editor-tabs">
                <button id="general-tab"
                  onClick={() => {
                    if (currentTab === 4) updateLinks();
                    setCurrentTab(0);
                  }}
                  className={`project-editor-tab ${currentTab === 0 ? 'project-editor-tab-active' : ''}`}
                >
                  General
                </button>
                <button id="media-tab"
                  onClick={() => {
                    if (currentTab === 4) updateLinks();
                    setCurrentTab(1);
                  }}
                  className={`project-editor-tab ${currentTab === 1 ? 'project-editor-tab-active' : ''}`}
                >
                  Media
                </button>
                <button id="tags-tab"
                  onClick={() => {
                    if (currentTab === 4) updateLinks();
                    setCurrentTab(2);
                  }}
                  className={`project-editor-tab ${currentTab === 2 ? 'project-editor-tab-active' : ''}`}
                >
                  Tags
                </button>
                <button id='team-tab'
                  onClick={() => {
                    if (currentTab === 4) updateLinks();
                    setCurrentTab(3);
                  }}
                  className={`project-editor-tab ${currentTab === 3 ? 'project-editor-tab-active' : ''}`}
                >
                  Team
                </button>
                <button id='links-tab'
                  onClick={() => {
                    if (currentTab === 4) updateLinks();
                    setCurrentTab(4);
                  }}
                  className={`project-editor-tab ${currentTab === 4 ? 'project-editor-tab-active' : ''}`}
                >
                  Links
                </button>
              </div>

              <div id="project-editor-content">
                {
                  currentTab === 0 ? <GeneralTab projectData={modifiedProject} setProjectData={setModifiedProject} saveProject={saveProject} failCheck={failCheck} /> :
                    currentTab === 1 ? <MediaTab projectData={modifiedProject} setProjectData={setModifiedProject} saveProject={saveProject} failCheck={failCheck} /> :
                      currentTab === 2 ? <TagsTab projectData={modifiedProject} setProjectData={setModifiedProject} saveProject={saveProject} failCheck={failCheck} /> :
                        currentTab === 3 ? <TeamTab isNewProject={newProject} projectData={modifiedProject} setProjectData={setModifiedProject} setErrorMember={setErrorAddMember} setErrorPosition={setErrorAddPosition} permissions={permissions} /> :
                          currentTab === 4 ? <LinksTab isNewProject={newProject} projectData={modifiedProject} setProjectData={setModifiedProject} setErrorLinks={setErrorLinks} /> :
                            <></>
                }
              </div>
              {/* Responsiveness fix: General Tab has its own button/error text for layout change */}
              {currentTab !== 0 ? <div id="invalid-input-error" className={"save-error-msg"}>
                <p>{message}</p>
              </div> : <></>}
            </div>
          </PopupContent>
        ) : (
          // Placeholder to prevent mass error
          <div>

          </div>
        )
      }
    </Popup>
  );
};
