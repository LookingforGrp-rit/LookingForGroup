// --- Imports ---
import { useEffect, useState, useRef } from "react";
import { Select, SelectButton, SelectOptions } from "../../Select";
import { PopupButton } from '../../Popup';
import LabelInputBox from "../../LabelInputBox";
import { ProjectDetail } from "@looking-for-group/shared";
import { ProjectPurpose, ProjectStatus } from "@looking-for-group/shared/enums";

// Delay function until user stops typing to prevent rapid text input bugs
const keyboardDebounce = (func: (arg: ProjectDetail) => void, delay: number) => {
  let timeout: NodeJS.Timeout;
  return (arg: ProjectDetail) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(arg), delay);
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
  projectData,
  setProjectData = () => {},
  saveProject = () => {},
  failCheck
}: GeneralTabProps) => {

  // --- Hooks ---
  // Tracking project modifications. Forced because projectData is always defined here
  const [modifiedProject, setModifiedProject] = useState<ProjectDetail>(projectData!);

  // Textbox input callback: useRef to avoid unintended reset bugs
  const debounce = useRef(keyboardDebounce((updatedProject: ProjectDetail) => {
    setProjectData(updatedProject);
  }, 300)).current;

  // Update data when data is changed
  useEffect(() => {
    if (!projectData) return;
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
        value={modifiedProject.title || ''}
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
              setModifiedProject({ ...modifiedProject, status: (e.target as HTMLSelectElement).value as ProjectStatus});
            }}
            options={Object.values(ProjectStatus).map((o) => {
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
              setModifiedProject({ ...modifiedProject, purpose: (e.target as HTMLSelectElement).value as ProjectPurpose });
            }}
            options={Object.values(ProjectPurpose).map((p) => {
              return {
                markup: <>{p}</>,
                value: p,
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
        value={modifiedProject.audience || ''}
        onChange={(e) => {
          setModifiedProject({ ...modifiedProject, audience: e.target.value });
        }}
      />

      <LabelInputBox
        label={'Short Description*'}
        labelInfo="Share a brief summary of your project. This will be displayed in your project's discover card."
        inputType={'multi'}
        id={'project-editor-description-input'}
        maxLength={300}
        value={modifiedProject.hook || ''}
        onChange={(e) => {
          setModifiedProject({ ...modifiedProject, hook: e.target.value });
        }}
      />

      <LabelInputBox
        label={'About This Project*'}
        labelInfo="Use this space to go into detail about your project! Feel free to share it's
          inspirations and goals, outline key features, and describe this impact you hope it
          brings to others."
        inputType={'multi'}
        id={'project-editor-long-description-input'}
        maxLength={2000}
        value={modifiedProject.description || ''}
        onChange={(e) => {
          setModifiedProject({ ...modifiedProject, description: e.target.value });
        }}
      />
    
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