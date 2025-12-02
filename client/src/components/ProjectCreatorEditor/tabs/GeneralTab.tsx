// --- Imports ---
// import { useEffect, useState, useRef } from "react";
import { Select, SelectButton, SelectOptions } from "../../Select";
import {
  ProjectPurpose,
  ProjectStatus
} from "@looking-for-group/shared";
import { ProjectPurpose as ProjectPurposeEnums, ProjectStatus as ProjectStatusEnums } from "@looking-for-group/shared/enums";
import { PopupButton, PopupContent, Popup, PopupContext } from '../../Popup';
import LabelInputBox from "../../LabelInputBox";
import { projectDataManager } from "../../../api/data-managers/project-data-manager";
import { PendingProject } from "../../../../types/types";
import { useContext } from "react";

// --- Variables ---
let projectAfterGeneralChanges: PendingProject;

// // Delay function until user stops typing to prevent rapid text input bugs TODO: is this needed? not used
// const keyboardDebounce = <T extends (...args: unknown[]) => unknown>(
//   func: T,
//   delay: number
// ) => {
//   let timeout: NodeJS.Timeout;
//   return (...args: Parameters<T>) => {
//     clearTimeout(timeout);
//     timeout = setTimeout(() => func(args), delay);
//   };
// };

type GeneralTabProps = {
  dataManager: Awaited<ReturnType<typeof projectDataManager>>;
  projectData: PendingProject;
  saveProject?: () => Promise<void>;
  updatePendingProject?: (updatedPendingProject: PendingProject) => void;
  failCheck: boolean;
};

// --- Component ---
export const GeneralTab = ({
  dataManager,
  projectData,
  saveProject = async () => {},
  updatePendingProject = () => {},
  failCheck,
}: GeneralTabProps) => {

  projectAfterGeneralChanges = structuredClone(projectData);
  
  const projectId = projectData.projectId!;

  const { setOpen: closeOuterPopup } = useContext(PopupContext);

  // // Textbox input callback: useRef to avoid unintended reset bugs TODO: is this needed? not used
  // const debouncedUpdatePendingProject = useRef(
  //   keyboardDebounce<(updatedPendingProject: PendingProject) => void>(
  //     (updatedPendingProject: PendingProject) => {
  //       updatePendingProject(updatedPendingProject);
  //     },
  //     300
  //   )
  // ).current;

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
            initialVal={
              projectAfterGeneralChanges.status ?
                ProjectStatusEnums[projectAfterGeneralChanges.status] :
                ""
            }
            className="project-editor-input-item"
            type={"input"}
          />
          <SelectOptions
            callback={(e) => {
              const status = (
                e.target as React.ButtonHTMLAttributes<HTMLButtonElement>
              ).value as ProjectStatusEnums;

              if (status && Object.values(ProjectStatusEnums).includes(status as ProjectStatusEnums)) {
                projectAfterGeneralChanges = {
                  ...projectAfterGeneralChanges,
                  status: status as ProjectStatus,
                };
                updatePendingProject(projectAfterGeneralChanges);

                const key = Object.keys(ProjectStatusEnums).find(key => ProjectStatusEnums[key as keyof typeof ProjectStatusEnums] === status)

                dataManager.updateFields({
                  id: {
                    value: projectId,
                    type: "canon",
                  },
                  data: {
                    status: key as ProjectStatus,
                  },
                });
              }
            }}
            options={Object.values(ProjectStatusEnums).map((option) => {
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
            initialVal={
              projectAfterGeneralChanges.purpose ?
                ProjectPurposeEnums[projectAfterGeneralChanges.purpose] :
                ""
            }
            className="project-editor-input-item"
            type={"input"}
          />
          <SelectOptions
            callback={(e) => {
              const purpose = (
                e.target as React.ButtonHTMLAttributes<HTMLButtonElement>
              ).value as ProjectPurposeEnums;

              if (purpose && Object.values(ProjectPurposeEnums).includes(purpose as ProjectPurposeEnums)) {
                projectAfterGeneralChanges = {
                  ...projectAfterGeneralChanges,
                  purpose: purpose as ProjectPurpose,
                };
                updatePendingProject(projectAfterGeneralChanges);

                const key = Object.keys(ProjectPurposeEnums).find(key => ProjectPurposeEnums[key as keyof typeof ProjectPurposeEnums] === purpose)

                dataManager.updateFields({
                  id: {
                    value: projectId,
                    type: "canon",
                  },
                  data: {
                    purpose: key as ProjectPurpose,
                  },
                });
              }
            }}
            options={Object.values(ProjectPurposeEnums).map((option) => {
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
              <Popup>
                <PopupButton
                  buttonId="project-editor-save"
                  doNotClose={() => failCheck}
                >
                  Save Changes
                </PopupButton>
                  <PopupContent useClose={false}>
                    <div id="confirm-editor-save-text">Are you sure you want to save all changes?</div>
                  <div id="confirm-editor-save">
                 <PopupButton callback={saveProject} closeParent={closeOuterPopup} buttonId="project-editor-save">
                   Confirm
                 </PopupButton>
                 <PopupButton buttonId="team-edit-member-cancel-button" >
                   Cancel
                 </PopupButton>
                 </div>
                  </PopupContent>
              </Popup>
      </div>
    </div>
  );
};
