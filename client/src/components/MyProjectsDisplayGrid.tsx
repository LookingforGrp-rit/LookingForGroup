import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as paths from '../constants/routes';
import { sendDelete } from '../functions/fetch';
import { Dropdown, DropdownButton, DropdownContent } from './Dropdown';
import { Popup, PopupButton, PopupContent } from './Popup';
import { LeaveDeleteContext } from '../contexts/LeaveDeleteContext';
import { PagePopup } from './PagePopup';

//backend base url for getting images
const API_BASE = `http://localhost:8081`;

const MyProjectsDisplayGrid = ({ projectData }) => {
  //Navigation hook
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

  let optionsClass = 'grid-card-options-list';
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

  //Constructs url linking to relevant project page
  const projectURL = `${paths.routes.NEWPROJECT}?projectID=${projectData.project_id}`;

  return (
    <div className="my-project-grid-card">
      {/* Thumbnail */}
      <img
        className="grid-card-image"
        src={(projectData.thumbnail)
          ? `${API_BASE}/images/thumbnails/${projectData.thumbnail}`
          : `/assets/project_temp-DoyePTay.png`
        }
        alt={`${projectData.title} Thumbnail`}
        onClick={() => navigate(projectURL)}
      ></img>

      {/* Title */}
      <div className="grid-card-title" onClick={() => navigate(projectURL)}>
        {projectData.title}
      </div>

      {/* Options */}
      <Dropdown>
        <DropdownButton buttonId="grid-card-options-button">•••</DropdownButton>
        <DropdownContent rightAlign={true}>
          <div className="grid-card-options-list">
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

export default MyProjectsDisplayGrid;
