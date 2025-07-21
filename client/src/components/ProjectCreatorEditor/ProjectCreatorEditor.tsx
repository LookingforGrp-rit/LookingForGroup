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
import { showPopup } from '../Sidebar';
import { loggedIn } from '../Header';

//backend base url for getting images
const API_BASE = `http://localhost:8081`;

interface Image {
  id: number;
  image: string;
  position: number;
  file: File
}

interface ProjectData {
  audience: string;
  description: string;
  hook: string;
  images: Image[];
  jobs: { title_id: number; job_title: string; description: string; availability: string; location: string; duration: string; compensation: string; }[];
  members: { first_name: string, last_name: string, job_title: string, profile_image: string, user_id: number }[];
  project_id?: number;
  project_types: { id: number, project_type: string }[];
  purpose: string;
  socials: { id: number, url: string }[];
  status: string;
  tags: { id: number, position: number, tag: string, type: string }[];
  thumbnail: string;
  title: string;
  userId?: number;
}

interface User {
  first_name: string,
  last_name: string,
  username: string,
  primary_email: string,
  user_id: number
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
  project_types: [],
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

  // Get project data on projectID change
  useEffect(() => {
    if (!newProject && projectID) {
      const getProjectData = async () => {
        const url = `/api/projects/${projectID}`;
        try {
          const response = await fetch(url);

          const projectResponse = await response.json();
          const projectData = projectResponse.data[0];

          if (projectData === undefined) {
            return;
          }

          projectData.userId = user?.user_id;

          // save project data
          setProjectData(projectData);
          setModifiedProject(projectData);
        } catch (error) {
          console.error(error);
        }
      };
      getProjectData();
    }
  }, [newProject, projectID, user]);

  // Handle events for tab switch
  useEffect(() => {
    // reset link error
    setErrorLinks('');
    if (newProject) {
      const makeDefaultProjectData = async () => {
        // adjust default and set as project data
        const projectData = emptyProject;
        projectData.userId = user?.user_id;

        // Get user profile image
        try {
          const response = await fetch(`/api/users/${user?.user_id}`);
          const userResponse = await response.json();
          const data = userResponse.data[0];

          // Add creator as Project Lead
          const member = {
            first_name: user?.first_name || '',
            last_name: user?.last_name || '',
            job_title: 'Project Lead',
            title_id: 73,
            profile_image: data?.profile_image || '',
            user_id: user?.user_id || 0
          };

          projectData.members = [member];

          // Save to temp project
          setModifiedProject(projectData);

        } catch (error) {
          console.error(error);
        }
      }
      makeDefaultProjectData();
    }
  }, [currentTab, newProject, user]);

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
    if (modifiedProject.tags.length == 0 || modifiedProject.project_types.length == 0) {
      const errorText = document.getElementById('invalid-input-error');
      setMessage('*Choose a project type and tag under Tags before saving!*');

      if (errorText) {
        errorText.style.display = 'block'
      }
      return;
    }

    // --- Creator ---
    if (newProject) {
      try {
        // Record information from inputs
      }
      catch (error) {
        console.error(error);
        return false;
      }
    }

    // --- Editor ---
    if (!newProject) {
      try {
        // Update images
        let dbImages: Image[] = [];
        // Get images on database
        const picturesResponse = await fetch(`/api/projects/${projectID}/pictures`);
        const imagesResponse = await picturesResponse.json();
        const imageData = imagesResponse.data;

        // add images to reference later
        dbImages = imageData;

        // Compare new images to database to find images to delete
        const imagesToDelete: Image[] = dbImages.filter(
          image => !modifiedProject.images.find(newImage => newImage.image === image.image)
        );

        // Delete images
        await Promise.all(
          imagesToDelete.map(async (image) => {
            // remove image from database
            await fetch(`/api/projects/${projectID}/pictures`, {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ image: image.image })
            });
          })
        );

        // Add new images to database
        // Wrap upload in promise
        const uploadImages = modifiedProject.images.map(async (image) => {
          if (!dbImages.find((dbImage) => dbImage.image === image.image)) {
            // file must be new: recreate file
            const fileResponse = await fetch(image.image);
            const fileBlob = await fileResponse.blob();
            const file = new File([fileBlob], image.image, { type: fileBlob.type });

            // create form data to send
            const formData = new FormData();
            formData.append('image', file);
            formData.append('position', image.position.toString());

            // add image to database
            await fetch(`/api/projects/${projectID}/pictures`, {
              method: 'POST',
              body: formData
            });
          }
        });

        // Wait for all images to upload
        await Promise.all(uploadImages);

        // Reestablish image positions
        await fetch(`/api/projects/${projectID}/pictures`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ images: modifiedProject.images })
        });

        // Compare thumbnail
        if (modifiedProject.thumbnail !== projectData.thumbnail) {
          // get thumbnail
          const thumbnailResponse = await fetch(`${API_BASE}/images/projects/${modifiedProject.thumbnail}`);

          // create file
          const thumbnailBlob = await thumbnailResponse.blob();
          const thumbnailFile = new File([thumbnailBlob], modifiedProject.thumbnail, { type: "image/png" }); // type is valid if its added to modifiedProject

          const formData = new FormData();
          formData.append('image', thumbnailFile);

          // update thumbnail
          await fetch(`/api/projects/${projectID}/thumbnail`, {
            method: 'PUT',
            body: formData
          });
        }

        // Send PUT request for general project info
        await fetch(`/api/projects/${projectID}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(modifiedProject),
        });

        setProjectData(modifiedProject);

      } catch (error) {
        console.error(error);
        return false;
      }
    }
    // Creator
    else {
      try {
        // Send POST request for general project info
        await fetch(`/api/projects`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(modifiedProject),
        });

        setProjectData(modifiedProject);

        // Add images, if any
        modifiedProject.images.map(async (image) => {
          // file must be new: recreate file
          const fileResponse = await fetch(image.image);
          const fileBlob = await fileResponse.blob();
          const file = new File([fileBlob], image.image, { type: fileBlob.type });

          // create form data to send
          const formData = new FormData();
          formData.append('image', file);
          formData.append('position', image.position.toString());

          // add image to database
          await fetch(`/api/projects/${projectID}/pictures`, {
            method: 'POST',
            body: formData
          });
        });

        // Update thumbnail if a thumbnail is set
        if (modifiedProject.thumbnail !== '') {
          // get thumbnail
          const thumbnailResponse = await fetch(`${API_BASE}/images/projects/${modifiedProject.thumbnail}`);

          // create file
          const thumbnailBlob = await thumbnailResponse.blob();
          const thumbnailFile = new File([thumbnailBlob], modifiedProject.thumbnail, { type: "image/png" }); // type is valid if its added to modifiedProject

          const formData = new FormData();
          formData.append('image', thumbnailFile);

          // update thumbnail
          await fetch(`/api/projects/${projectID}/thumbnail`, {
            method: 'PUT',
            body: formData
          });
        }

      } catch (error) {
        console.error(error);
        return false;
      }
    }
  };

  // Save links to modifiedProject
  const updateLinks = () => {
    // temp social links
    const newSocials: { id: number, url: string }[] = [];

    // get parent element
    const parentDiv = document.querySelector('#project-editor-link-list');

    // iterate through children
    parentDiv?.childNodes.forEach(element => {
      // skip element if its the last (add button)
      if (element === parentDiv.lastElementChild) {
        return;
      }

      // get dropdown and input
      const dropdown = (element as HTMLElement).querySelector('select');
      const input = (element as HTMLElement).querySelector('input');

      // get values
      const id = Number(dropdown?.options[dropdown?.selectedIndex].dataset.id);
      const url = input?.value;

      // if no values at all, ignore and remove
      if (!id && !url) {
        return;
      }
      // check for valid id
      if (isNaN(id) || id === -1) {
        setErrorLinks('Select a website in the dropdown');
        return;
      }
      if (!url) {
        setErrorLinks('Enter a URL');
        return;
      }

      // add to list
      newSocials.push({ id: id, url: url });

      // remove error
      setErrorLinks('');
    });

    // update socials
    setModifiedProject({ ...modifiedProject, socials: newSocials });
  };

  return (
    <Popup>
      {
        newProject ? (
          <PopupButton callback={buttonCallback} buttonId='project-info-create' > <ThemeIcon light={'/assets/create_light.png'} dark={'/assets/create_dark.png'} /> Create </PopupButton>
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
                  currentTab === 0 ? <GeneralTab isNewProject={newProject} projectData={modifiedProject} setProjectData={setModifiedProject} /> :
                    currentTab === 1 ? <MediaTab isNewProject={newProject} projectData={modifiedProject} setProjectData={setModifiedProject} /> :
                      currentTab === 2 ? <TagsTab isNewProject={newProject} projectData={modifiedProject} setProjectData={setModifiedProject} /> :
                        currentTab === 3 ? <TeamTab isNewProject={newProject} projectData={modifiedProject} setProjectData={setModifiedProject} setErrorMember={setErrorAddMember} setErrorPosition={setErrorAddPosition} permissions={permissions} /> :
                          currentTab === 4 ? <LinksTab isNewProject={newProject} projectData={modifiedProject} setProjectData={setModifiedProject} setErrorLinks={setErrorLinks} /> :
                            <></>
                }
              </div>

              <div id="invalid-input-error" className="save-error-msg">
                <p>{message}</p>
              </div>
              <PopupButton buttonId="project-editor-save" callback={saveProject} doNotClose={() => !failCheck}>
                Save Changes
              </PopupButton>
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
