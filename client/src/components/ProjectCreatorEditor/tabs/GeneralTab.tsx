// --- Imports ---
import { useRef } from "react";
import { Select, SelectButton, SelectOptions } from "../../Select";
import { PopupButton } from "../../Popup";
import {
  ProjectPurpose,
  ProjectStatus,
} from "@looking-for-group/shared";
import LabelInputBox from "../../LabelInputBox";
import { projectDataManager } from "../../../api/data-managers/project-data-manager";
import { PendingProject } from "../../../../types/types";

// --- Variables ---
// Default project value
// const defaultProject: PendingProject = {
//   _id: "",
//   audience: "",
//   description: "",
//   hook: "",
//   images: [],
//   jobs: [],
//   members: [],
//   projectTypes: [],
//   purpose: "",
//   socials: [],
//   status: "",
//   tags: [],
//   thumbnail: "",
//   title: "",
// };

let projectAfterGeneralChanges: PendingProject;

// Project purpose and status options
const purposeOptions = ["Personal", "Portfolio Piece", "Academic", "Co-op"];
const statusOptions = [
  "Planning",
  "Development",
  "Post-Production",
  "Complete",
];

// Delay function until user stops typing to prevent rapid text input bugs
const keyboardDebounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), delay);
  };
};

type GeneralTabProps = {
  dataManager: Awaited<ReturnType<typeof projectDataManager>>;
  projectData: PendingProject;
  // setProjectData?: (data: ProjectDetail) => void;
  saveProject?: () => void;
  updatePendingProject?: (updatedPendingProject: PendingProject) => void;
  failCheck: boolean;
};

// --- Component ---
export const GeneralTab = ({
  dataManager,
  projectData,
  saveProject = () => {},
  updatePendingProject = () => {},
  failCheck,
}: GeneralTabProps) => {
  // --- Hooks ---
  // tracking project modifications
  // const [modifiedProject, setModifiedProject] = useState<PendingProject>(
  //   projectData
  // );
  projectAfterGeneralChanges = structuredClone(projectData);

  const projectId = projectData.projectId!;

  // Textbox input callback: useRef to avoid unintended reset bugs
  const debouncedUpdatePendingProject = useRef(
    keyboardDebounce<(updatedPendingProject: PendingProject) => void>(
      (updatedPendingProject: PendingProject) => {
        updatePendingProject(updatedPendingProject);
      },
      300
    )
  ).current;

  // // Update data when data is changed
  // useEffect(() => {
  //   setModifiedProject(projectData);
  // }, [projectData]);

  // Update parent state when data is changed
  // useEffect(() => {
  //   // delay with setTimeout() used to fix input glitch bug
  //   debounce(modifiedProject);
  // }, [debounce, modifiedProject, setProjectData]);

  // --- Complete component ---
  return (
    <div id="project-editor-general">
      <LabelInputBox
        label={"Title*"}
        inputType={"single"}
        id="project-editor-title-input"
        value={projectAfterGeneralChanges.title || ""}
        onChange={(e) => {
          const title = e.target.value;
          projectAfterGeneralChanges = { ...projectAfterGeneralChanges, title };
          updatePendingProject(projectAfterGeneralChanges);
          dataManager.updateFields({
            id: {
              value: projectId,
              type: "canon",
            },
            data: { title },
          });
        }}
      />

      <LabelInputBox
        label={"Status*"}
        inputType={"none"}
        id="project-editor-status-input"
      >
        <Select>
          <SelectButton
            placeholder="Select"
            initialVal={projectAfterGeneralChanges.status || ""}
            className="project-editor-input-item"
            type={"input"}
          />
          <SelectOptions
            callback={(e) => {
              const status = (
                e.target as React.ButtonHTMLAttributes<HTMLButtonElement>
              ).value?.toString();

              if (status && statusOptions.includes(status.toString())) {
                projectAfterGeneralChanges = {
                  ...projectAfterGeneralChanges,
                  status: status as ProjectStatus,
                };
                updatePendingProject(projectAfterGeneralChanges);

                dataManager.updateFields({
                  id: {
                    value: projectId,
                    type: "canon",
                  },
                  data: {
                    status: status as ProjectStatus,
                  },
                });
              }
            }}
            options={statusOptions.map((option) => {
              return {
                markup: <>{option}</>,
                value: option,
                disabled: false,
              };
            })}
          />
        </Select>
      </LabelInputBox>

      <LabelInputBox
        label={"Purpose"}
        inputType={"none"}
        id="project-editor-purpose-input"
      >
        <Select>
          <SelectButton
            placeholder="Select"
            initialVal={projectAfterGeneralChanges.purpose || ""}
            className="project-editor-input-item"
            type={"input"}
          />
          <SelectOptions
            callback={(e) => {
              const purpose = (
                e.target as React.ButtonHTMLAttributes<HTMLButtonElement>
              ).value?.toString();

              if (purpose && purposeOptions.includes(purpose.toString())) {
                projectAfterGeneralChanges = {
                  ...projectAfterGeneralChanges,
                  purpose: purpose as ProjectPurpose,
                };
                updatePendingProject(projectAfterGeneralChanges);

                dataManager.updateFields({
                  id: {
                    value: projectId,
                    type: "canon",
                  },
                  data: {
                    purpose: purpose as ProjectPurpose,
                  },
                });
              }
            }}
            options={purposeOptions.map((option) => {
              return {
                markup: <>{option}</>,
                value: option,
                disabled: false,
              };
            })}
          />
        </Select>
      </LabelInputBox>

      <LabelInputBox
        label={"Target Audience"}
        labelInfo="Define who this project is intended for--consider age group, interest, industry, or specific user needs."
        inputType={"multi"}
        id={"project-editor-audience-input"}
        maxLength={100}
        value={projectAfterGeneralChanges.audience || ""}
        onChange={(e) => {
          const audience = e.target.value;
          projectAfterGeneralChanges = {
            ...projectAfterGeneralChanges,
            audience,
          };
          updatePendingProject(projectAfterGeneralChanges);

          dataManager.updateFields({
            id: {
              value: projectId,
              type: "canon",
            },
            data: { audience },
          });
        }}
      />

      <LabelInputBox
        label={"Short Description*"}
        labelInfo="Share a brief summary of your project. This will be displayed in your project's discover card."
        inputType={"multi"}
        id={"project-editor-description-input"}
        maxLength={300}
        value={projectAfterGeneralChanges.hook || ""}
        onChange={(e) => {
          const hook = e.target.value;
          projectAfterGeneralChanges = { ...projectAfterGeneralChanges, hook };
          updatePendingProject(projectAfterGeneralChanges);

          dataManager.updateFields({
            id: {
              value: projectId,
              type: "canon",
            },
            data: { hook },
          });
        }}
      />

      <LabelInputBox
        label={"About This Project*"}
        labelInfo="Use this space to go into detail about your project! Feel free to share it's
          inspirations and goals, outline key features, and describe this impact you hope it
          brings to others."
        inputType={"multi"}
        id={"project-editor-long-description-input"}
        maxLength={2000}
        value={projectAfterGeneralChanges.description || ""}
        onChange={(e) => {
          const description = e.target.value;
          projectAfterGeneralChanges = {
            ...projectAfterGeneralChanges,
            description,
          };
          updatePendingProject(projectAfterGeneralChanges);

          dataManager.updateFields({
            id: {
              value: projectId,
              type: "canon",
            },
            data: { description },
          });
        }}
      />

      <div id="general-save-info">
        <div id="invalid-input-error" className={"save-error-msg-general"}>
          <p>*Fill out all required info before saving!*</p>
        </div>
        <PopupButton
          buttonId="project-editor-save"
          callback={saveProject}
          doNotClose={() => !failCheck}
        >
          Save Changes
        </PopupButton>
      </div>
    </div>
  );
};
