// --- Imports ---
import { Select, SelectButton, SelectOptions } from "../../Select";
import { ProjectContext, ProjectStatus, ProjectWithFollowers } from "@looking-for-group/shared";
import { ProjectContext as ProjectContextEnums, ProjectStatus as ProjectStatusEnums } from "@looking-for-group/shared/enums";
import { PopupButton, PopupContent, Popup, PopupContext } from '../../Popup';
import LabelInputBox from "../../LabelInputBox";
import { DeleteProjectButton } from "../DeleteProjectButton";
import { projectDataManager } from "../../../api/data-managers/project-data-manager";
import { PendingProject } from "../../../../types/types";
import { useContext, useRef, useState } from "react";

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
  dataManager?: Awaited<ReturnType<typeof projectDataManager>>;
  projectData: PendingProject;
  unmodifiedProject: ProjectWithFollowers;
  saveProject?: () => Promise<void>;
  updatePendingProject?: (updatedPendingProject: PendingProject) => void;
  saveable : boolean;
  failCheck: boolean;
  updateFailCheck: boolean;
  message: string;
  isSaving : boolean;
};

/**
 * This file creates the page for editing information about the user’s project such as the project’s 
 * description and the desired audience.
 * @param dataManager data manager 
 * @param projectData current project data
 * @param saveProject save project changes
 * @param updatePendingProject set modified project
 * @param failCheck indicates if data validation has failed
 * @returns JSX for Project Creator/editor tab - builds the page for project creation/editing
 */

// --- Component ---
export const GeneralTab = ({
  dataManager,
  projectData,
  unmodifiedProject,
  saveProject = async () => {},
  updatePendingProject = () => {},
  saveable,
  failCheck,
  updateFailCheck,
  message,
  isSaving,
}: GeneralTabProps) => {

  projectAfterGeneralChanges = structuredClone(projectData);
  
  const projectId = projectData.projectId!;
  const saveButtonRef = useRef<HTMLButtonElement>(null);

  const { setOpen: closeOuterPopup } = useContext(PopupContext);

  const [confirm, setConfirm] = useState(false);

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
        label={"Title"}
        inputType={"single"}
        maxLength={50}
        id="project-editor-title-input"
        value={projectAfterGeneralChanges.title || ""}
        initialValue={unmodifiedProject.title || ""}
        required
        onChange={(e) => {
          const title = e.target.value;
          projectAfterGeneralChanges = { ...projectAfterGeneralChanges, title };
          updatePendingProject(projectAfterGeneralChanges);

          if (title == "") {
            return;
          }

          dataManager?.updateFields({
            id: {
              value: projectId,
              type: "canon",
            },
            data: { title },
          });
        }}
      />

      <LabelInputBox
        label={"Status"}
        inputType={"none"}
        forceUnsaved={unmodifiedProject.status !== projectAfterGeneralChanges.status}
        required
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

                dataManager?.updateFields({
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
        label={"Context"}
        inputType={"none"}
        forceUnsaved={unmodifiedProject.context !== projectAfterGeneralChanges.context}
        id="project-editor-context-input"
      >
        <Select>
          <SelectButton
            placeholder="Select"
            initialVal={
              projectAfterGeneralChanges.context ?
                ProjectContextEnums[projectAfterGeneralChanges.context] :
                ""
            }
            className="project-editor-input-item"
            type={"input"}
          />
          <SelectOptions
            callback={(e) => {
              const context = (
                e.target as React.ButtonHTMLAttributes<HTMLButtonElement>
              ).value as ProjectContextEnums;

              if (context && Object.values(ProjectContextEnums).includes(context as ProjectContextEnums)) {
                projectAfterGeneralChanges = {
                  ...projectAfterGeneralChanges,
                  context: context as ProjectContext,
                };
                updatePendingProject(projectAfterGeneralChanges);

                const key = Object.keys(ProjectContextEnums).find(key => ProjectContextEnums[key as keyof typeof ProjectContextEnums] === context)

                dataManager?.updateFields({
                  id: {
                    value: projectId,
                    type: "canon",
                  },
                  data: {
                    context: key as ProjectContext,
                  },
                });
              }
            }}
            options={Object.values(ProjectContextEnums).map((option) => {
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
        initialValue={unmodifiedProject.audience || ""}
        onChange={(e) => {
          const audience = e.target.value;
          projectAfterGeneralChanges = {
            ...projectAfterGeneralChanges,
            audience,
          };
          updatePendingProject(projectAfterGeneralChanges);

          dataManager?.updateFields({
            id: {
              value: projectId,
              type: "canon",
            },
            data: { audience },
          });
        }}
      />

      <LabelInputBox
        label={"Short Description"}
        labelInfo="Share a brief summary of your project. This will be displayed in your project's discover card."
        inputType={"multi"}
        id={"project-editor-description-input"}
        maxLength={300}
        value={projectAfterGeneralChanges.hook || ""}
        initialValue={unmodifiedProject.hook || ""}
        required
        onChange={(e) => {
          const hook = e.target.value;
          projectAfterGeneralChanges = { ...projectAfterGeneralChanges, hook };
          updatePendingProject(projectAfterGeneralChanges);

          if (hook == "") {
            return;
          }

          dataManager?.updateFields({
            id: {
              value: projectId,
              type: "canon",
            },
            data: { hook },
          });
        }}
      />

      <LabelInputBox
        label={" Project Overview"}
        labelInfo="Use this space to go into detail about your project! Feel free to share it's
          inspirations and goals, outline key features, and describe this impact you hope it
          brings to others."
        inputType={"multi"}
        id={"project-editor-long-description-input"}
        maxLength={2000}
        value={projectAfterGeneralChanges.description || ""}
        initialValue={unmodifiedProject.description || ""}
        required={true}
        onChange={(e) => {
          const description = e.target.value;
          projectAfterGeneralChanges = { ...projectAfterGeneralChanges, description };
          updatePendingProject(projectAfterGeneralChanges);

          if (description == "") {
            return;
          }

          dataManager?.updateFields({
            id: {
              value: projectId,
              type: "canon",
            },
            data: { description },
          });
        }}
      />
      <div id="general-save-info">
        <div className="editor-save-actions">
        <Popup>
          {saveable ? "" :
          <div id="invalid-input-error" className={"save-error-msg-general"}>
            <p>*{message}*</p>
          </div>}

          {isSaving ? 
            (
              // Currently Saving
              <div className='spinning-loader'></div>
            ) : (
              // Save is complete or hasn't been pressed
              <PopupButton
                buttonId="project-editor-save"
                callback={() => {
                  // Incomplete form: still clickable so the save validation runs,
                  // shows the error, and auto-scrolls to the first missing field.
                  if (!saveable) {
                    saveProject?.();
                    return;
                  }
                  else setConfirm(true);
                  console.log(`Current save ref: ${saveButtonRef.current}`);
                  saveButtonRef.current?.focus();
                }}
              >
                Save Changes
              </PopupButton>
            )
          }
        
          {confirm ?
            <PopupContent useClose={false} callback={() => setConfirm(false)}>
              <div id="confirm-editor-save-text">Are you sure you want to save all changes?</div>
              <div id="confirm-editor-save">
                <PopupButton callback={saveProject} closeParent={closeOuterPopup} buttonId="project-editor-save"
                    ref={saveButtonRef} >
                  Confirm
                </PopupButton>
                <PopupButton buttonId="team-edit-member-cancel-button">
                  Cancel
                </PopupButton>
              </div>
            </PopupContent> : ""
          }
        </Popup>
        
        {isSaving ?
          (
            // Just here for blank space and to prevent 
            // accidental deletion while a project is saving
            ""
          ) : (
            <DeleteProjectButton
              projectID={unmodifiedProject.projectId}
              projectTitle={unmodifiedProject.title}
            />
          )
        }
        </div>
      </div>

    </div>
  );
};
