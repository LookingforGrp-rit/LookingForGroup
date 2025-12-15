import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as paths from '../constants/routes';
import { Dropdown, DropdownButton, DropdownContent } from './Dropdown';
import { LeaveDeleteContext } from '../contexts/LeaveDeleteContext';
import { Popup, PopupButton, PopupContent } from './Popup';
import { PagePopup } from './PagePopup';
import { getByID,  deleteProject } from '../api/projects';
import { ApiResponse, ProjectDetail } from '@looking-for-group/shared';
import { leaveProject } from '../api/users';
import { ThemeIcon } from './ThemeIcon';
import { ProjectStatus as ProjectStatusEnums } from '@looking-for-group/shared/enums';

//backend base url for getting images

/**
 * MyProjectsDisplayList renders a single project as a list item for the "My Projects" page.
 * 
 * Features:
 * - Displays project thumbnail, title, creation date, and current status.
 * - Allows project members and owners to access additional options via a dropdown menu:
 *   - Leave project (all members)
 *   - Delete project (project owner only)
 * - Confirmation popups are shown for leaving or deleting a project.
 * - Displays a result popup showing success or error messages from API requests.
 * - Automatically fetches the current project status when the component mounts.
 * Functionality:
 * - Clicking the thumbnail or title navigates to the project's page.
 * - Dropdown menu uses Popup components for confirmation dialogs.
 * - PagePopup shows success/error messages after API requests (leave/delete).
 * - Uses LeaveDeleteContext to access project ID, ownership status, and reload projects after actions.
 * - Formats creation date into DD/MM/YYYY format.
 * 
 * @param projectData - Detailed information about the project (from the backend API)
 * @returns {JSX.Element} The project list card element.
 */
const MyProjectsDisplayList = ({ projectData } : {projectData: ProjectDetail}) => {
  // Navigation hook
  const navigate = useNavigate();

  const { projId, isOwner, reloadProjects } = useContext(LeaveDeleteContext);

  // Project status fetched from API
  const [status, setStatus] = useState<string>();
  // Dropdown visibility toggle
  const [optionsShown, setOptionsShown] = useState(false);

  // State variable for displaying output of API request, whether success or failure
  const [showResult, setShowResult] = useState(false);
  const [requestType, setRequestType] = useState<'delete' | 'leave'>('delete');
  const [resultObj, setResultObj] = useState<ApiResponse>({ status: 400, data: null, error: 'Not initialized' });

  // Fetches project status and project thumbnail

  useEffect(() => {
  const fetchStatus = async () => {
    const response = await getByID(projectData.projectId);
    if(response.data) {
      setStatus(ProjectStatusEnums[response.data.status]);
    } else {
      setStatus('Error loading status');
    }
  };
    fetchStatus();
  })

  //this doesn't look used and idk what it's meant to be used for
  //it looks like it's supposed to be a toggle for when you press a button but idk which button that would be
  //i'll just leave it alone for now
  const toggleOptions = () => setOptionsShown(!optionsShown); 

  //Constructs url linking to relevant project page
  const projectURL = `${paths.routes.NEWPROJECT}?projectID=${projectData.projectId}`;

  // Handles leaving the project
  const handleLeaveProject = async () => {
    const response = await leaveProject(projId);
    setRequestType('leave');
    setResultObj(response);
    setShowResult(true);
  };

  // Handles deleting the project (owner only)
  const handleDeleteProject = async () => {
    const response = await deleteProject(projId);
    setRequestType('delete');
    setResultObj(response);
    setShowResult(true);
  };

  //Converts ISO date string to DD/MM/YYYY format
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'No data';
    const [date] = dateStr.split('T');
    const [year, month, day] = date.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="my-project-list-card">
      {/* Thumbnail and Title*/}
      <div className="list-card-section1">
        <img
          className="list-card-image"
          src={projectData.thumbnail?.image
            ? `${projectData.thumbnail?.image}`
            : `/assets/project_temp-DoyePTay.png`
          }
          alt={`${projectData.title} Thumbnail`}
          onClick={() => navigate(projectURL)}
        ></img>
        <div
          className="list-card-title"
          onClick={() => navigate(projectURL)}
        >{projectData.title}</div>
      </div>

      {/* Status */}
      <div className="list-card-status">{status}</div>

      {/* Data Created */}
      <div className="list-card-date">{formatDate(projectData.createdAt.toString())}</div>

      {/* Options */}
      <Dropdown>
        <DropdownButton buttonId="list-card-options-button">
          <ThemeIcon id={'menu'} width={25} height={5} className={'color-fill dropdown-menu'} ariaLabel={'More options'}/>
        </DropdownButton>
        <DropdownContent rightAlign={true}>
          <div className={`card-options-list ${optionsShown ? 'show' : ''}`}>
            <Popup>
              <PopupButton className='card-leave-button'>
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
                <div className='small-popup'>
                  <h3>Leave Project</h3>
                  <p className='confirm-msg'>
                    Are you sure you want to leave <span className="project-info-highlight">{projectData.title}</span>? You won't be able
                    to rejoin unless you're re-added by a project member.
                  </p>
                  <div className='confirm-deny-btns'>
                    <PopupButton
                      className='confirm-btn'
                      callback={handleLeaveProject}>
                        Leave
                    </PopupButton>
                    <PopupButton className='deny-btn'>Cancel</PopupButton>
                  </div>
                </div>
              </PopupContent>
            </Popup>
            {(isOwner) && (
              <Popup>
                <PopupButton className='card-delete-button'>
                  <ThemeIcon
                    id="trash"
                    width={21}
                    height={21}
                    ariaLabel="Delete project"
                  />
                  Delete Project
                </PopupButton>
                <PopupContent>
                  <div className='small-popup'>
                    <h3>Delete Project</h3>
                    <p className='confirm-msg'>
                      Are you sure you want to delete <span className="project-info-highlight">{projectData.title}</span>? This action cannot be undone.
                    </p>
                    <div className='confirm-deny-btns'>
                      <PopupButton
                        className='confirm-btn delete-button'
                        callback={handleDeleteProject}>
                          Delete
                      </PopupButton>
                      <PopupButton className='deny-btn'>Cancel</PopupButton>
                    </div>
                  </div>
                </PopupContent>
              </Popup>
            )}
          </div>
        </DropdownContent>
      </Dropdown>

      {/* Leave/Delete result popup */}
      <PagePopup
        width={'fit-content'}
        height={'fit-content'}
        popupId={'result'}
        zIndex={3}
        show={showResult}
        setShow={setShowResult}
        onClose={reloadProjects}
      >
        <div className='small-popup'>
          {resultObj.status === 200 ? (
            <p>
              <span className='success-msg'>Success:</span>
              &nbsp;
              {requestType === 'delete' ? 'The project has been deleted.' : 'You have left the project.'}
            </p>
          ) : (
            <p>
              <span className='error-msg'>Error:</span>
              &nbsp;
              {resultObj.error}
            </p>
          )}
        </div>
      </PagePopup>
    </div>
  );
};

export default MyProjectsDisplayList;
