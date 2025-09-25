// --- Imports ---
import { useEffect, useState } from "react";
import { Select, SelectButton, SelectOptions } from "../../Select";
import { PopupButton } from "../../Popup";
import { ProjectDetail, Social } from "@looking-for-group/shared";

// --- Variables ---
type LinksTabProps = {
  projectData?: ProjectDetail;
  setProjectData?: (data: ProjectDetail) => void;
  setErrorLinks?: (error: string) => void;
  saveProject?: () => void;
  failCheck: boolean;
}

// --- Component ---
export const LinksTab = ({
  projectData,
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
  const [modifiedProject, setModifiedProject] = useState<ProjectDetail>(projectData || { socials: [] } as ProjectDetail);
  // complete list of socials
  const [allSocials, setAllSocials] = useState<Social[]>([]);
  // sets error when adding a link to the project
  const [error, setError] = useState('');

  // Update data when data is changed
  useEffect(() => {
    setModifiedProject(projectData || {} as ProjectDetail);
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
        const response = await fetchSocials(); 

        if (response.data === undefined) {
          return;
        }
        setAllSocials(response.data);
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
                      // TODO: Implement some sort of security check for URLs.
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
              let tempSocials = modifiedProject.socials || [];

              const defaultSocial = allSocials.length > 0
                ? {
                  id: allSocials[0].websiteId,
                  website: allSocials[0].label,
                  url: '',
                } as Social
              : { id: 0, website: '', url: '' } as Social;

              tempSocials.push(defaultSocial);

              setModifiedProject({ ...modifiedProject, socials: tempSocials });
            }}>
            <i className="fa fa-plus" />
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