import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as paths from "../constants/routes";
import { Dropdown, DropdownButton, DropdownContent } from "./Dropdown";
import { Popup, PopupButton, PopupContent } from "./Popup";
import { LeaveDeleteContext } from "../contexts/LeaveDeleteContext";
import { PagePopup } from "./PagePopup";
import { deleteProject } from "../api/projects";
import { ApiResponse, ProjectDetail } from "@looking-for-group/shared";
import { leaveProject } from "../api/users";
import { ThemeIcon } from "./ThemeIcon";
import placeholderThumbnail from "../images/project_temp.png";
import usePreloadedImage from "../functions/imageLoad";

//backend base url for getting images

/**
 * MyProjectsDisplayGrid renders a single project card in a grid layout for the "My Projects" page.
 * 
 * Features:
 * - Displays the project thumbnail and title.
 * - Allows project owners or members to access additional options via a dropdown menu:
 *   - Leave project (all members)
 *   - Delete project (project owner only)
 * - Confirmation popups are shown for leaving or deleting a project.
 * - Displays a result popup showing success or error messages from API requests.
 * Functionality:
 * - Clicking the thumbnail or title navigates to the project's page.
 * - Dropdown menu uses Popup components for confirmation dialogs.
 * - PagePopup shows success/error messages after API requests (leave/delete).
 * - Interacts with LeaveDeleteContext for project ID, ownership, and reloading projects after actions.
 *
 * @param projectData - Detailed information about the project (from the backend API)
 * @returns The project card element.
 */
const MyProjectsDisplayGrid = ({
  projectData,
}: {
  projectData: ProjectDetail;
}) => {
  //Navigation hook
  const navigate = useNavigate();
  // Context providing project ID, ownership status, and reload function
  const { projId, isOwner, reloadProjects } = useContext(LeaveDeleteContext);

  //const [status, setStatus] = useState<string>();
  const [optionsShown, _setOptionsShown] = useState(false);
  // State variable for displaying output of API request, whether success or failure
  const [showResult, setShowResult] = useState(false);
  const [requestType, setRequestType] = useState<"delete" | "leave">("delete");
  const [resultObj, setResultObj] = useState<ApiResponse>({
    status: 400,
    data: null,
    error: "Not initialized",
  });

  /**
   * toggleOptions
   * - Toggles the visibility of the dropdown menu for project actions.
   * - Updates the optionsShown state.
   */
  //const toggleOptions = () => setOptionsShown(!optionsShown);

  //Constructs url linking to relevant project page
  const projectURL = `${paths.routes.NEWPROJECT}?projectID=${projectData.projectId}`;

  /**
   * handleLeaveProject
   * - Sends an API request for the current user to leave the project.
   * - Updates state variables to show the result popup with the response.
   */
  const handleLeaveProject = async () => {
    const response = await leaveProject(projId);
    setRequestType("leave");
    setResultObj(response);
    setShowResult(true);
  };

  /**
   * handleDeleteProject
   * - Sends an API request to delete the project.
   * - Updates state variables to show the result popup with the response.
   * - Only available if the current user is the project owner.
   */
  const handleDeleteProject = async () => {
    const response = await deleteProject(projId);
    setRequestType("delete");
    setResultObj(response);
    setShowResult(true);
  };

  return (
    <div className="my-project-grid-card">
      {/* Thumbnail */}
      <img
        className="grid-card-image"
        src={usePreloadedImage(
          projectData.thumbnail?.image ?? placeholderThumbnail,
          placeholderThumbnail
        )}
        alt={`${projectData.title}`}
        onClick={() => navigate(projectURL)}
      ></img>

      <div className="grid-card-details">
        {/* Title */}
        <div className="grid-card-title" onClick={() => navigate(projectURL)}>
          {projectData.title}
        </div>

        {/* Options */}
        <Dropdown>
          <DropdownButton buttonId="grid-card-options-button">
            <ThemeIcon
              id={"menu"}
              width={15}
              height={3}
              className={"mono-fill dropdown-menu"}
              ariaLabel={"More options"}
            />
          </DropdownButton>
          <DropdownContent rightAlign={true}>
            <div className={`card-options-list ${optionsShown ? "show" : ""}`}>
              <Popup>
                <PopupButton className="card-leave-button">
                  <ThemeIcon
                    id={"logout"}
                    width={21}
                    height={21}
                    ariaLabel={"Leave project"}
                    className="mono-fill"
                  />
                  Leave Project
                </PopupButton>
                <PopupContent>
                  <div className="small-popup">
                    <h3>Leave Project</h3>
                    <p className="confirm-msg">
                      Are you sure you want to leave{" "}
                      <span className="project-info-highlight">
                        {projectData.title}
                      </span>
                      ? You won't be able to rejoin unless you're re-added by a
                      project member.
                    </p>
                    <div className="confirm-deny-btns">
                      <PopupButton
                        className="confirm-btn"
                        callback={handleLeaveProject}
                      >
                        Leave
                      </PopupButton>
                      <PopupButton className="deny-btn">Cancel</PopupButton>
                    </div>
                  </div>
                </PopupContent>
              </Popup>
              {isOwner && (
                <Popup>
                  <PopupButton className="card-delete-button">
                    <ThemeIcon
                      id="trash"
                      width={21}
                      height={21}
                      ariaLabel="Delete project"
                    />
                    Delete Project
                  </PopupButton>
                  <PopupContent>
                    <div className="small-popup">
                      <h3>Leave Project</h3>
                      <p className="confirm-msg">
                        Are you sure you want to delete{" "}
                        <span className="project-info-highlight">
                          {projectData.title}
                        </span>
                        ? This action cannot be undone.
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
              )}
            </div>
          </DropdownContent>
        </Dropdown>
      </div>

      {/* Leave/Delete result popup */}
      <PagePopup
        width={"fit-content"}
        height={"fit-content"}
        popupId={"result"}
        zIndex={3}
        show={showResult}
        setShow={setShowResult}
        onClose={reloadProjects}
      >
        <div className="small-popup">
          {resultObj.status === 200 ? (
            <p>
              <span className="success-msg">Success:</span>
              &nbsp;
              {requestType === "delete"
                ? "The project has been deleted."
                : "You have left the project."}
            </p>
          ) : (
            <p>
              <span className="error-msg">Error:</span>
              &nbsp;
              {resultObj.error}
            </p>
          )}
        </div>
      </PagePopup>
    </div>
  );
};

export default MyProjectsDisplayGrid;
