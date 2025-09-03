// --- Imports ---
import { useEffect, useState } from "react";
import { Select, SelectButton, SelectOptions } from "../../Select";
import { PopupButton } from "../../Popup";


// --- Interfaces ---
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
  jobs: { titleId: number; jobTitle: string; description: string; availability: string; location: string; duration: string; compensation: string; }[];
  members: { firstName: string, lastName: string, jobTitle: string, profileImage: string, userId: number }[];
  projectId?: number;
  projectTypes: { id: number, projectType: string }[];
  purpose: string;
  socials: { id: number, url: string }[];
  status: string;
  tags: { id: number, position: number, tag: string, type: string }[];
  thumbnail: string;
  title: string;
  userId?: number;
}

interface Social {
  websiteId: number;
  label: string;
}

// --- Variables ---
// Default project value
const defaultProject: ProjectData = {
  audience: '',
  description: '',
  hook: '',
  images: [],
  jobs: [],
  members: [],
  projectId: -1,
  projectTypes: [],
  purpose: '',
  socials: [],
  status: '',
  tags: [],
  thumbnail: '',
  title: '',
};

type LinksTabProps = {
  projectData?: ProjectData;
  setProjectData?: (data: ProjectData) => void;
  setErrorLinks?: (error: string) => void;
  saveProject?: () => void;
  failCheck: boolean;
}

// --- Component ---
export const LinksTab = ({
  projectData = defaultProject,
  setProjectData = () => {},
  setErrorLinks = () => {},
  saveProject = () => {},
  failCheck
}: LinksTabProps) => {

  // Icon failure to load by default fix
  const iconCheck = document.getElementsByClassName("project-link-select");
  for (const i of iconCheck) {
    const val = i.getElementsByClassName("value")[0];
    if (!val.querySelector("i")) {
      // Handling sites with uniquely named icons
      if (val.innerText === "Other") { // Other
        val.innerHTML = '<i class="fa-solid fa-link"></i>' + val.innerHTML;
      }
      else if (val.innerText === "X") { // Twitter
        val.innerHTML = '<i class="fa-brands fa-x-twitter"></i>' + val.innerHTML;
      }
      else if (val.innerText === "Itch") { // Itch
        val.innerHTML = '<i class="fa-brands fa-itch-io"></i>' + val.innerHTML;
      }
      else { // All ordinarily named site icons
        val.innerHTML = `<i class="fa-brands fa-${val.innerText.toLowerCase()}"></i>` + val.innerHTML;
      }
    }
  }

  // --- Hooks --- 
  // tracking project modifications
  const [modifiedProject, setModifiedProject] = useState<ProjectData>(projectData);
  // complete list of socials
  const [allSocials, setAllSocials] = useState<Social[]>([]);
  // sets error when adding a link to the project
  const [error, setError] = useState('');

  // Update data when data is changed
  useEffect(() => {
    setModifiedProject(projectData);
  }, [projectData]);

  // Update parent state with new project data
  useEffect(() => {
    setProjectData(modifiedProject);
  }, [modifiedProject, setProjectData]);

  // Update parent state with error message
  useEffect(() => {
    setErrorLinks(error);
  }, [error, setErrorLinks]);

  // Get socials if allSocials is empty
  useEffect(() => {
    const getSocials = async () => {
      const url = `/api/datasets/socials`;

      try {
        const response = await fetch(url);

        const socials = await response.json();
        const socialsData = socials.data;

        if (socialsData === undefined) {
          return;
        }
        setAllSocials(socialsData);

      } catch (error) {
        console.error((error as Error).message);
      }
    };
    if (allSocials.length === 0) {
      getSocials();
    }
  }, [allSocials]);

  // --- Methods ---
  // Add a link entry
  // TO-DO: Replace this function with something using State variables
  const addLinkInput = () => {
    // find parent div
    const linkListDiv = document.querySelector("#project-editor-link-list");
    if (linkListDiv) {
      // parent div
      const linkItemDiv = document.createElement('div');
      linkItemDiv.className = 'project-editor-link-item';

      // dropdown
      const dropdown = document.createElement('select');
      // default option
      const defaultOption = document.createElement('option');
      defaultOption.disabled = true;
      defaultOption.selected = true;
      defaultOption.text = 'Select';
      dropdown.appendChild(defaultOption);
      // add list of options
      for (const s of allSocials) {
        const option = document.createElement('option');
        option.value = s.label;
        option.text = s.label;
        option.dataset.id = s.websiteId.toString();
        dropdown.appendChild(option);
      }

      // input wrapper
      const linkInputWrapper = document.createElement('div');
      linkInputWrapper.className = 'project-link-input-wrapper';

      // URL input
      const input = document.createElement('input');
      input.type = 'url';
      input.placeholder = 'URL';

      // remove link button
      const button = document.createElement('button');
      button.className = 'remove-link-button';
      button.innerHTML = '<i class="fa-solid fa-minus"></i>';
      button.onclick = (e) => {
        const wrapper = e.currentTarget.closest('.project-editor-link-item');
        if (wrapper) {
          wrapper.remove();
        }
      };

      // build element
      linkInputWrapper.appendChild(input);
      linkInputWrapper.appendChild(button);
      linkItemDiv.appendChild(dropdown);
      linkItemDiv.appendChild(linkInputWrapper);
      linkListDiv.insertBefore(linkItemDiv, linkListDiv.lastElementChild);
    }
  };

  // --- Complete component ---
  return (
    <div id="project-editor-links">
      <label>Social Links</label>
      <div className="project-editor-extra-info">
        Provide the links to pages you wish to include on your page.
      </div>
      <div className='error'>{error}</div>

      <div id="project-editor-link-list">
        {
          modifiedProject.socials ? modifiedProject.socials.map((social, index) => {
            return (
              <div className="project-editor-link-item" key={`social.id-${index}`}>
                <div className='project-link-select-wrapper'>
                  <Select>
                    {/* FIXME: does not default to "Select" value */}
                    <SelectButton
                      placeholder='Select'
                      initialVal={social.website}
                      className='project-link-select'
                    />
                    <SelectOptions
                      callback={(e) => {
                        if (allSocials) {
                          // FIXME: implement website name (id?) in project socials type
                          // Create a copy of the current social, and change it
                          const tempSocials = modifiedProject.socials;
                          tempSocials[index].website = e.target.value;

                          // Find the correct id and assign it
                          for (let i = 0; i < allSocials.length; i++) {
                            if (e.target.value === allSocials[i].label) {
                              tempSocials[index].id = allSocials[i].websiteId;
                              break;
                            }
                          }

                          setModifiedProject({ ...modifiedProject, socials: tempSocials });
                        }
                      }}
                      options={allSocials ? allSocials.map(website => {
                        return {
                          markup: <>
                            {website.label === 'Other' ? (
                              <i className='fa-solid fa-link'></i>
                            ) : (
                              // Itch and Twitter have uniquely named FA icons that cannot be handled the same as the others
                              <i className={`fa-brands ${(website.label === 'Itch' ? 'fa-itch-io' : (website.label === 'X') ? 'fa-x-twitter' : `fa-${website.label.toLowerCase()}`)}`}></i>
                            )}
                            {website.label}
                          </>,
                          value: website.label,
                          disabled: false,
                        };
                      }) : []}
                    />
                  </Select>
                </div>
                <div className='project-link-input-wrapper'>
                  {/* FIXME: handle onChange to allow for editing input */}
                  <input
                    type="text"
                    placeholder="URL"
                    value={social.url}
                    onChange={(e) => {
                      // TO-DO: Implement some sort of security check for URLs.
                      // Could be as simple as checking the URL matches the social media
                      // But since 'Other' is an option, might be good to just find some
                      // external list of suspicious sites and make sure it's not one of those.
                      const tempSocials = modifiedProject.socials;
                      tempSocials[index].url = e.target.value;
                      setModifiedProject({ ...modifiedProject, socials: tempSocials });
                      console.log(tempSocials);
                    }}
                  />
                  <button
                    className='remove-link-button'
                    onClick={ () => {
                      // Remove element from modified socials array
                      console.log(index);
                      const tempSocials = [
                        ...modifiedProject.socials.slice(0, index),
                        ...modifiedProject.socials.slice(index + 1)
                      ];
                      setModifiedProject({ ...modifiedProject, socials: tempSocials });
                      console.log(tempSocials);
                    }}
                    title="Remove link"
                  >
                    <i className="fa-solid fa-minus"></i>
                  </button>
                </div>
              </div>
            );
          }) : ''
        }
        <div id="add-link-container">
          <button id="profile-editor-add-link"
            onClick={() => {
              //addLinkInput();
              let tempSocials = modifiedProject.socials;

              // Create the socials array if it doesn't exist already
              if (!tempSocials) {
                tempSocials = [];
              }

              //FIXME: implement website name (id?) in project socials type
              tempSocials.push({
                id: 1,
                website: 'Instagram',
                url: '',
              });

              setModifiedProject({ ...modifiedProject, socials: tempSocials });
            }}>
            {/* Figma wants + to be its own vector. Styles here assume it is a <p> */}
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="10" viewBox="0 0 11 10" fill="none">
              <path d="M6.28571 0.714286C6.28571 0.524845 6.20293 0.343164 6.05558 0.20921C5.90823 0.075255 5.70838 0 5.5 0C5.29162 0 5.09177 0.075255 4.94442 0.20921C4.79707 0.343164 4.71429 0.524845 4.71429 0.714286V4.28571H0.785714C0.57733 4.28571 0.377481 4.36097 0.230131 4.49492C0.0827805 4.62888 0 4.81056 0 5C0 5.18944 0.0827805 5.37112 0.230131 5.50508C0.377481 5.63903 0.57733 5.71429 0.785714 5.71429H4.71429V9.28571C4.71429 9.47515 4.79707 9.65684 4.94442 9.79079C5.09177 9.92475 5.29162 10 5.5 10C5.70838 10 5.90823 9.92475 6.05558 9.79079C6.20293 9.65684 6.28571 9.47515 6.28571 9.28571V5.71429H10.2143C10.4227 5.71429 10.6225 5.63903 10.7699 5.50508C10.9172 5.37112 11 5.18944 11 5C11 4.81056 10.9172 4.62888 10.7699 4.49492C10.6225 4.36097 10.4227 4.28571 10.2143 4.28571H6.28571V0.714286Z" fill="var(--neutral-gray)"/>
            </svg>
            <p>Add social profile</p>
          </button>
        </div>
      </div>
      <div id="link-save-info">
        <PopupButton buttonId="project-editor-save" callback={saveProject} doNotClose={() => !failCheck}>
          Save Changes
        </PopupButton>
      </div>
    </div>
  );
};