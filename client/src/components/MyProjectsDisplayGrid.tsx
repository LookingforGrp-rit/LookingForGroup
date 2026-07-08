import { useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import * as paths from "../constants/routes";
import { Dropdown, DropdownButton, DropdownContent } from "./Dropdown";
import { Popup, PopupButton, PopupContent } from "./Popup";
import { LeaveDeleteContext } from "../contexts/LeaveDeleteContext";
import { PagePopup } from "./PagePopup";
import { deleteProject, getByID, requestProjectReview, updateProject } from "../api/projects";
import { ApiResponse, ProjectDetail, ProjectFollowers, Visibility } from "@looking-for-group/shared";
import { leaveProject } from "../api/users";
import { ThemeIcon } from "./ThemeIcon";
import placeholderThumbnail from "../images/project_temp.png";
import usePreloadedImage from "../functions/imageLoad";
import { Close, Check, QuestionMark } from '@mui/icons-material';
import { ProjectApprovalStatus as ApprovalStatus } from "@looking-for-group/shared/enums";
//import { updateProjectProfileVisibility, getCurrentUsername } from "../api/users";
import { userDataManager } from "../api/data-managers/user-data-manager";
import { projectDataManager } from "../api/data-managers/project-data-manager";

type ApprovalStatusKey = keyof typeof ApprovalStatus;
type MyProjectsDisplayGridProps = {
  projectData: ProjectDetail;
  approvalStatus: ApprovalStatusKey;
  dataManager: Awaited<ReturnType<typeof userDataManager>> | null;
};
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
 * @param approvalStatus - Project approval status (keyof ProjectApprovalStatus from "@looking-for-group/shared/enums")
 * @param dataManager Handles data changes to save changes later.
 * @returns The project card element.
 */
const MyProjectsDisplayGrid = ({ projectData, approvalStatus, dataManager}: MyProjectsDisplayGridProps) => {
  //Navigation hook
  const navigate = useNavigate();
  // Context providing project ID, ownership status, and reload function
  const { projId, isOwner, reloadProjects, removeProject } = useContext(LeaveDeleteContext);

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
  const [approvalSymbol, setApprovalSymbol] = useState<ReactNode>(null);
  // console.log(projectData.title + ' is approved: ' + projectData.approved);  
  
  // Project visibilty toggle
  const [isVisible, setIsVisible] = useState<Visibility>(projectData.globalVisibility);

  // Used to possibly save the changes made to the project's visibility
  const [projectManager, setProjectManager] = useState<Awaited<ReturnType<typeof projectDataManager>> | null>(null);
  useEffect(() => {
    const setUpManager = async () => {
      const manager = await projectDataManager(projId);
        setProjectManager(manager);
    }
    setUpManager();
  }, []);

    
  const changeGlobalVisibility = () => {

    console.log("Before: " + isVisible + ", " + projectData.globalVisibility);
    if(isVisible == "private")
      {
        setIsVisible("public");
        projectData.globalVisibility = "public";
      }
      else
      {
        setIsVisible("private");
        projectData.globalVisibility = "private";
      } 
      
      // Should update the project's visibility but for some reason isn't
      {
        //updateProject(projId, projectData);
        //projectManager?.saveChanges();
      }
      console.log("After: " + isVisible + ", " + projectData.globalVisibility);
  }

  /**
   * toggleOptions
   * - Toggles the visibility of the dropdown menu for project actions.
   * - Updates the optionsShown state.
   */
  //const toggleOptions = () => setOptionsShown(!optionsShown);

  //Constructs url linking to relevant project page
  const projectURL = `${paths.routes.PROJECT}?projectID=${projectData.projectId}`;

  useEffect(() => {
    setApprovalSymbol(
      approvalStatus === 'approved'
        ? <Check className="symbol" />
        : approvalStatus === 'under-review'
          ? <QuestionMark className="symbol" />
          : <Close className="symbol" />
    );
  }, [approvalStatus]);

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
    if (response.status === 200) setTimeout(() => removeProject(projId), 1500);
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
    if (response.status === 200) setTimeout(() => removeProject(projId), 1500);
  };

  return (
    <div className="my-project-grid-card">
      {/* Thumbnail */}
      <button className="grid-card-image-button" onClick={() => navigate(projectURL)}>
        <div className={approvalStatus}>
          {approvalSymbol}
          <div className="txt">
            {ApprovalStatus[approvalStatus] as string}
          </div>
        </div>
        <img
          className="grid-card-image"
          src={usePreloadedImage(
            projectData.thumbnail?.image ?? placeholderThumbnail,
            placeholderThumbnail
          )}
          alt={`${projectData.title}`}
          style={{opacity: isVisible == "public" ? "1" : "0.25"}}
        />
      </button>

      <div className="grid-card-details">
        {/* Title */}
        <a className="grid-card-title" href={projectURL}>
          {projectData.title}
        </a>

        {/* Options */}
        <Dropdown>
          <DropdownButton buttonId="grid-card-options-button">
            <ThemeIcon
              id={"menu"}
              width={30}
              height={30}
              className={"mono-fill dropdown-menu"}
              ariaLabel={"More options"}
            />
          </DropdownButton>
          <DropdownContent rightAlign={true}>
            <div className={`card-options-list ${optionsShown ? "show" : ""}`}>
              <button className="card-leave-button" onClick={() => navigate(projectURL)}>
                <ThemeIcon
                  id={"pencil"}
                  width={21}
                  height={21}
                  ariaLabel={"Edit project"}
                  className="mono-fill"
                />
                Edit Project
              </button>
              {approvalStatus === 'not-approved' ?
              <Popup>
                <PopupButton className='card-leave-button'>
                  <ThemeIcon
                    id={"request-review"}
                    width={21}
                    height={21}
                    ariaLabel={"request-Review"}
                    className="mono-fill"
                  />
                  Request Review
                </PopupButton>
                <PopupContent>
                  <div className="small-popup">
                  <div id="project-request-review">
                    <label id="project-request-label">
                      Would you like to submit your project for review?
                    </label>
                    <div id="project-request-info">
                      Submiting a request will make your project visible to moderators who will choose to either
                      accept and make your project visible to all, request changes for you to make, 
                      or reject it for various reasons. <br/>
                      <strong>(Moderators are not capable of directly altering or deleting your projects)</strong>
                    </div>
                    <div id="project-request-buttons">
                      <PopupButton buttonId="request-confirm-button"
                      callback={() => {
                        if (projectData) requestProjectReview(projectData.projectId);
                      }}
                      >
                        Request Review
                      </PopupButton>
                      <PopupButton buttonId="request-cancel-button">
                        Cancel
                      </PopupButton>
                    </div>
                  </div>
                   </div>
                </PopupContent>
              </Popup> : "" }
              {isVisible == "private" ? (
                <button className="card-leave-button" onClick={() => changeGlobalVisibility()}>
                    <ThemeIcon
                      id={"eye"}
                      width={21}
                      height={21}
                      ariaLabel={"Show Project (Public)"}
                      className="mono-fill"
                    />
                    Publitize
                </button>
              ) : (
                <button className="card-leave-button" onClick={() => changeGlobalVisibility()}>
                    <ThemeIcon
                      id={"eye-line"}
                      width={21}
                      height={21}
                      ariaLabel={"Hide Project (Private)"}
                      className="mono-fill"
                    />
                    Privatize
                </button>
              )}
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
                      <h3>Delete Project</h3>
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
