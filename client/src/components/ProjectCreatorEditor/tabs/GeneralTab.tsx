// --- Imports ---
import { useEffect, useState, useRef } from "react";
import { ThemeIcon } from "../../ThemeIcon";
import { Select, SelectButton, SelectOptions } from "../../Select";
import { PopupButton } from '../../Popup';
import { ProjectDetail } from '@looking-for-group/shared';
import LabelInputBox from "../../LabelInputBox";

// --- Variables ---
// Default project value
const defaultProject: ProjectDetail & { userId?: number } = {
  _id: '',
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

type GeneralTabProps = {
  projectData?: ProjectDetail;
  setProjectData?: (data: ProjectDetail) => void;
  saveProject?: () => void;
  failCheck: boolean;
}

// --- Component ---
export const GeneralTab = ({
  projectData = defaultProject,
  setProjectData = () => {},
  saveProject = () => {},
  failCheck
}: GeneralTabProps) => {

  // --- Hooks ---
  // tracking project modifications
  const [modifiedProject, setModifiedProject] = useState<ProjectDetail>(projectData || defaultProject);

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
  }, [debounce, modifiedProject, setProjectData]);

  // --- Complete component ---
  return (
    <div id="project-editor-general">
      <LabelInputBox
        label={'Title*'}
        inputType={'single'}
        id="project-editor-title-input"
        onChange={(e) => {
          setModifiedProject({ ...modifiedProject, title: e.target.value });
        }}
      />

      <LabelInputBox
        label={'Status*'}
        inputType={'none'}
        id="project-editor-status-input"
      >
        <Select>
          <SelectButton 
            placeholder='Select'
            initialVal={modifiedProject.status || ''}
            className='project-editor-input-item'
            type={"input"}
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
      </LabelInputBox>

      <LabelInputBox
        label={'Purpose'}
        inputType={'none'}
        id="project-editor-purpose-input"
      >
        <Select>
          <SelectButton 
            placeholder='Select'
            initialVal={modifiedProject.purpose || ''}
            className='project-editor-input-item'
            type={"input"}
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
      </LabelInputBox>

      <LabelInputBox
        label={'Target Audience'}
        labelInfo='Define who this project is intended for--consider age group, interest, industry, or specific user needs.'
        inputType={'multi'}
        id={'project-editor-audience-input'}
        maxLength={100}
        onChange={(e) => {
          setModifiedProject({ ...modifiedProject, audience: e.target.value });
        }}
      />

      <div id="project-editor-description-input" className="project-editor-input-item">
        <label htmlFor="short-description">Short Description*</label>
        <div className="project-editor-extra-info">
          Share a brief summary of your project. This will be displayed in your project's
          discover card.
        </div>
        <span className="character-count">
          {modifiedProject.hook ? modifiedProject.hook.length : '0'}/300
        </span>{' '}
        <textarea
          id="short-description"
          maxLength={300}
          value={modifiedProject.hook}
          onChange={(e) => {
            setModifiedProject({ ...modifiedProject, hook: e.target.value });
          }}
        />
      </div>

      {/* <LabelInputBox
        label={'Short Description*'}
        labelInfo="Share a brief summary of your project. This will be displayed in your project's discover card."
        inputType={'multi'}
        id={'project-editor-description-input'}
        maxLength={300}
        onChange={(e) => {
          setModifiedProject({ ...modifiedProject, hook: e.target.value });
        }}
      /> */}

      <div id="project-editor-long-description-input" className="project-editor-input-item">
        <label htmlFor="long-description">About This Project*</label>
        <div className="project-editor-extra-info">
          Use this space to go into detail about your project! Feel free to share it's
          inspirations and goals, outline key features, and describe this impact you hope it
          brings to others.
        </div>
        <span className="character-count">
          {modifiedProject.description ? modifiedProject.description.length : '0'}/2000
        </span>{' '}
        <textarea
          id="long-description"
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
        <PopupButton buttonId="project-editor-save" callback={saveProject} doNotClose={() => !failCheck}>
          Save Changes
        </PopupButton>
      </div>
    </div>
  );
};