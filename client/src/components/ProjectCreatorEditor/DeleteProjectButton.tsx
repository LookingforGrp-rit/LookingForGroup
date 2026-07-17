import { useNavigate } from "react-router-dom";
import { Popup, PopupButton, PopupContent } from "../Popup";
import { deleteProject } from "../../api/projects";
import * as paths from "../../constants/routes";

type DeleteProjectButtonProps = {
  // Id of the project to delete. When absent (a not-yet-saved new project),
  // the button renders nothing.
  projectID?: number;
  // Project title, shown in the confirmation message.
  projectTitle?: string;
};

/**
 * Red "Delete Project" button shown next to "Save Changes" in the project
 * editor. Opens a confirmation popup before deleting, then returns the user to
 * the My Projects page.
 *
 * Renders nothing for a brand-new project that hasn't been saved yet (no id).
 */
export const DeleteProjectButton = ({ projectID, projectTitle }: DeleteProjectButtonProps) => {
  const navigate = useNavigate();

  // Nothing to delete for an unsaved new project.
  if (!projectID) return null;

  const handleDeleteProject = async () => {
    const res = await deleteProject(projectID);
    if (res.status === 200) {
      navigate(paths.routes.MYPROJECTS);
    } else {
      console.error("Error deleting project:", res.error);
    }
  };

  return (
    <Popup>
      <PopupButton buttonId="project-editor-delete">Delete Project</PopupButton>
      <PopupContent useClose={false}>
        <div className="small-popup">
          <h3>Delete Project</h3>
          <p className="confirm-msg">
            Are you sure you want to delete{" "}
            <span className="project-info-highlight">{projectTitle}</span>? This
            action cannot be undone.
          </p>
          <div className="confirm-deny-btns">
            <PopupButton
              className="confirm-btn delete-button"
              callback={handleDeleteProject}
            >
              Delete
            </PopupButton>
            <PopupButton className="deny-btn">Cancel</PopupButton>
          </div>
        </div>
      </PopupContent>
    </Popup>
  );
};
