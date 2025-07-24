import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as paths from '../constants/routes';
import { Dropdown, DropdownButton, DropdownContent } from './Dropdown';
import { LeaveDeleteContext } from '../contexts/LeaveDeleteContext';
import { Popup, PopupButton, PopupContent } from './Popup';
import { PagePopup } from './PagePopup';
import { sendDelete } from '../functions/fetch';

//backend base url for getting images
const API_BASE = `http://localhost:8081`;

const MyProjectsDisplayList = ({ projectData }) => {
  // Navigation hook
  const navigate = useNavigate();

  const { projId, userId, isOwner, reloadProjects } = useContext(LeaveDeleteContext);

  const [status, setStatus] = useState();
  const [optionsShown, setOptionsShown] = useState(false);

  // State variable for displaying output of API request, whether success or failure
  const [showResult, setShowResult] = useState(false);
  const [requestType, setRequestType] = useState('delete');
  const [resultObj, setResultObj] = useState({ status: 400, error: 'Not initialized' });

  const getStatus = async () => {
    const url = `/api/projects/${projectData.project_id}`;
    try {
      const response = await fetch(url);

      const rawData = await response.json();
      setStatus(rawData.data[0].status === undefined ? 'No data' : rawData.data[0].status);
    } catch (error) {
      console.log(error);
    }
  };

  if (status === undefined) {
    getStatus();
  }

  const deleteProject = async () => {
    const url = `/api/projects/${projectData.project_id}`;
    try {
      // send a DELETE request to the API
      const response = await fetch(url, {
        method: 'DELETE',
      });

      // check if the delete request was successful
      if (response.ok) {
        console.log('Project deleted successfully');
      } else {
        console.log('Failed to delete project');
      }
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  let optionsClass = 'list-card-options-list';
  if (optionsShown) {
    optionsClass += ' show';
  }

  const toggleOptions = () => {
    if (optionsShown) {
      setOptionsShown(false);
    } else {
      setOptionsShown(true);
    }
  };

  const createDate = (theDate: string) => {
    const dataList = theDate.split('T');
    const dateParts = dataList[0].split('-');
    return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
  };

  //Constructs url linking to relevant project page
  const projectURL = `${paths.routes.NEWPROJECT}?projectID=${projectData.project_id}`;

  return (
    <div className="my-project-list-card">
      <div className="list-card-section1">
        {/* Thumbnail */}
        <img
          className="list-card-image"
          src={(projectData.thumbnail)
            ? `${API_BASE}/images/thumbnails/${projectData.thumbnail}`
            : `/assets/project_temp-DoyePTay.png`
          }
          alt={`${projectData.title} Thumbnail`}
          onClick={() => navigate(projectURL)}
        ></img>

        {/* Title */}
        <div
          className="list-card-title"
          onClick={() => navigate(projectURL)}
        >{projectData.title}</div>
      </div>

      {/* Status */}
      <div className="list-card-status">{status}</div>

      {/* Data Created */}
      <div className="list-card-date">
        {projectData.created_at === null ||
          projectData.created_at === undefined ||
          projectData.created_at === ''
          ? 'No data'
          : createDate(projectData.created_at)}
      </div>

      {/* Options */}
      <Dropdown>
        <DropdownButton buttonId="list-card-options-button">•••</DropdownButton>
        <DropdownContent rightAlign={true}>
          <div className="list-card-options-list">
            <Popup>
              <PopupButton className='card-leave-button'>
                <i
                  className='fa-solid fa-arrow-right-from-bracket'
                  style={{ fontStyle: 'normal', transform: 'rotate(180deg)' }}
                ></i>
                &nbsp; Leave Project
              </PopupButton>
              <PopupContent>
                <div className='small-popup'>
                  <h3>Leave Project</h3>
                  <p className='confirm-msg'>
                    Are you sure you want to leave this project? You won't be able
                    to rejoin unless you're re-added by a project member.
                  </p>
                  <div className='confirm-deny-btns'>
                    <PopupButton
                      className='confirm-btn'
                      callback={async () => {
                        // Attempt to remove user from project.
                        // Display PagePopup.tsx on success or failure
                        // And display error message inside said popup
                        const url = `/api/projects/${projId}/members/${userId}`;

                        sendDelete(url, (result) => {
                          setRequestType('leave');
                          setResultObj(result);
                          setShowResult(true);
                        })
                      }}
                    >Confirm</PopupButton>
                    <PopupButton className='deny-btn'>Cancel</PopupButton>
                  </div>
                </div>
              </PopupContent>
            </Popup>
            {(isOwner) ? (
              <Popup>
                <PopupButton className='card-delete-button'>
                  <i
                    className='fa-solid fa-trash-can'
                    style={{ fontStyle: 'normal', color: 'var(--error-delete-color)' }}
                  ></i>
                  &nbsp; Delete Project
                </PopupButton>
                <PopupContent>
                  <div className='small-popup'>
                    <h3>Leave Project</h3>
                    <p className='confirm-msg'>
                      Are you sure you want to delete this project? This action cannot be undone.
                    </p>
                    <div className='confirm-deny-btns'>
                      <PopupButton
                        className='confirm-btn'
                        callback={async () => {
                          // Attempt to remove user from project.
                          // Display PagePopup.tsx on success or failure
                          // And display error message inside said popup
                          const url = `/api/projects/${projId}`;

                          sendDelete(url, (result) => {
                            setRequestType('delete');
                            setResultObj(result);
                            setShowResult(true);
                          })
                        }}
                      >Confirm</PopupButton>
                      <PopupButton className='deny-btn'>Cancel</PopupButton>
                    </div>
                  </div>
                </PopupContent>
              </Popup>
            ) : (
              <></>
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
        onClose={() => reloadProjects()}
      >
        <div className='small-popup'>
          {(resultObj.status === 200) ? (
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
