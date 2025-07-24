// --- Imports ---
import { useEffect, useState, useRef } from "react";
import { Dropdown, DropdownButton, DropdownContent } from "../../Dropdown";
import { ThemeIcon } from "../../ThemeIcon";
import { Select, SelectButton, SelectOptions } from "../../Select";
import { PopupButton } from '../../Popup';


// --- Interfaces ---
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
  jobs: { title_id: number; job_title: string; description: string; availability: string; location: string; duration: string; compensation: string; }[];
  members: { first_name: string, last_name: string, job_title: string, profile_image: string, user_id: number}[];
  project_id?: number;
  project_types: { id: number, project_type: string}[];
  purpose: string;
  socials: { id: number, url: string }[];
  status: string;
  tags: { id: number, position: number, tag: string, type: string}[];
  thumbnail: string;
  title: string;
  userId?: number;
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
  project_id: -1,
  project_types: [],
  purpose: '',
  socials: [],
  status: '',
  tags: [],
  thumbnail: '',
  title: '',
};

// Project purpose and status options
const purposeOptions = ['Personal', 'Portfolio Piece', 'Academic', 'Co-op'];
const statusOptions = ['Planning', 'Development', 'Post-Production', 'Complete'];

// Delay function until user stops typing to prevent rapid text input bugs
const keyboardDebounce = (func: any, delay: any) => {
  let timeout: any;
  return (...args: any) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

// --- Component ---
export const GeneralTab = ({ isNewProject = false, projectData = defaultProject, setProjectData, saveProject, failCheck }) => {

  // --- Hooks ---
  // tracking project modifications
  const [modifiedProject, setModifiedProject] = useState<ProjectData>(projectData);

  // Textbox input callback: useRef to avoid unintended reset bugs
  const debounce = useRef(keyboardDebounce((updatedProject) => {
    setProjectData(updatedProject);
  }, 300)).current;

  // Update data when data is changed
  useEffect(() => {
    setModifiedProject(projectData);
  }, [projectData]);

  // Update parent state when data is changed
  useEffect(() => {
    // delay with setTimeout() used to fix input glitch bug
    debounce(modifiedProject)
  }, [modifiedProject, setProjectData]);

  // --- Complete component ---
  return (
    <div id="project-editor-general">
      <div id="project-editor-title-input" className="project-editor-input-item">
        <label>Title*</label>
        <input
          type="text"
          className="title-input"
          value={modifiedProject.title}
          onChange={(e) => {
            setModifiedProject({ ...modifiedProject, title: e.target.value });
          }}
        />
      </div>

      <div id="project-editor-status-input" className="project-editor-input-item">
        <label>Status*</label>
        {/* <Dropdown> TODO: implement dropdown and styling
          <DropdownButton buttonId="status-btn">
            {modifiedProject.status || 'Select'}
            <ThemeIcon
              light={'assets/dropdown_light.png'}
              dark={'assets/dropdown_dark.png'}
              id="dropdown-arrow"
            />
          </DropdownButton>
          <DropdownContent>
            {statusOptions.map((o) => (
              <button
                onClick={() => {
                  setModifiedProject({ ...modifiedProject, status: o });
                }}
              >
                {o}
              </button>
            ))}
          </DropdownContent>
        </Dropdown> */}
        <Select>
          <SelectButton 
            placeholder='Select'
            initialVal={modifiedProject.status || ''}
            className='project-editor-input-item'
          />
          <SelectOptions 
            callback={(e) => {
              setModifiedProject({ ...modifiedProject, status: e.target.value });
            }}
            options={statusOptions.map((o) => {
              return {
                markup: <>{o}</>,
                value: o,
                disabled: false,
              };
            })}
          />
        </Select>
        {/* <select
          value={modifiedProject.status || 'Select'}
          onChange={(e) => {
            setModifiedProject({ ...modifiedProject, status: e.target.value });
          }}
        >
          <option disabled selected={isNewProject}>
            Select
          </option>
          {statusOptions.map((o) => (
            <option selected={isNewProject ? false : modifiedProject.status === o}>{o}</option>
          ))}
        </select> */}
      </div>

      <div id="project-editor-purpose-input" className="project-editor-input-item">
        <label>Purpose</label>
        {/* <select
          value={modifiedProject.purpose || 'Select'}
          onChange={(e) => {
            setModifiedProject({ ...modifiedProject, purpose: e.target.value });
          }}
        >
          <option disabled selected={isNewProject}>
            Select
          </option>
          {purposeOptions.map((o) => (
            <option selected={isNewProject ? false : modifiedProject.purpose === o}>{o}</option>
          ))}
        </select> */}
        <Select>
          <SelectButton 
            placeholder='Select'
            initialVal={modifiedProject.purpose || ''}
            className='project-editor-input-item'
          />
          <SelectOptions 
            callback={(e) => {
              setModifiedProject({ ...modifiedProject, purpose: e.target.value });
            }}
            options={purposeOptions.map((o) => {
              return {
                markup: <>{o}</>,
                value: o,
                disabled: false,
              };
            })}
          />
        </Select>
      </div>

      <div id="project-editor-audience-input" className="project-editor-input-item">
        <label>Target Audience</label>
        <div className="project-editor-extra-info">
          Define who this project is intended for--consider age group, interest, industry, or
          specific user needs.
        </div>
        <span className="character-count">
          {modifiedProject.audience ? modifiedProject.audience.length : '0'}/100
        </span>{' '}
        <textarea
          maxLength={100}
          value={modifiedProject.audience}
          onChange={(e) => {
            setModifiedProject({ ...modifiedProject, audience: e.target.value });
          }}
        />
      </div>

      <div id="project-editor-description-input" className="project-editor-input-item">
        <label>Short Description*</label>
        <div className="project-editor-extra-info">
          Share a brief summary of your project. This will be displayed in your project's
          discover card.
        </div>
        <span className="character-count">
          {modifiedProject.hook ? modifiedProject.hook.length : '0'}/300
        </span>{' '}
        <textarea
          maxLength={300}
          value={modifiedProject.hook}
          onChange={(e) => {
            setModifiedProject({ ...modifiedProject, hook: e.target.value });
          }}
        />
      </div>

      <div id="project-editor-long-description-input" className="project-editor-input-item">
        <label>About This Project*</label>
        <div className="project-editor-extra-info">
          Use this space to go into detail about your project! Feel free to share it's
          inspirations and goals, outline key features, and describe this impact you hope it
          brings to others.
        </div>
        <span className="character-count">
          {modifiedProject.description ? modifiedProject.description.length : '0'}/2000
        </span>{' '}
        <textarea
          maxLength={2000}
          value={modifiedProject.description}
          onChange={(e) => {
            setModifiedProject({ ...modifiedProject, description: e.target.value });
          }}
        />
      </div>
      
    <div id="general-save-info">
      <div id="invalid-input-error" className={"save-error-msg-general"}>
         <p>*Fill out all required info before saving!*</p>
      </div>
        <PopupButton buttonId="project-editor-save-general" callback={saveProject} doNotClose={() => !failCheck}>
          Save Changes
        </PopupButton>
    </div>
  </div>
  );
};