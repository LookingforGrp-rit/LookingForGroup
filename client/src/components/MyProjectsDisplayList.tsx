import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as paths from '../constants/routes';
import { Dropdown, DropdownButton, DropdownContent } from './Dropdown';
import { LeaveDeleteContext } from '../contexts/LeaveDeleteContext';
import { Popup, PopupButton, PopupContent } from './Popup';
import { PagePopup } from './PagePopup';
import { getByID,  deleteProject, getThumbnail } from '../api/projects';
import { ApiResponse, ProjectDetail } from '@looking-for-group/shared';
import { leaveProject } from '../api/users';

//backend base url for getting images


const MyProjectsDisplayList = ({ projectData } : {projectData: ProjectDetail}) => {
  // Navigation hook
  const navigate = useNavigate();

  const { projId, isOwner, reloadProjects } = useContext(LeaveDeleteContext);

  const [status, setStatus] = useState<string>();
  const [optionsShown, setOptionsShown] = useState(false);

  // State variable for displaying output of API request, whether success or failure
  const [showResult, setShowResult] = useState(false);
  const [requestType, setRequestType] = useState<'delete' | 'leave'>('delete');
  const [resultObj, setResultObj] = useState<ApiResponse>({ status: 400, data: null, error: 'Not initialized' });
  const [thumbnail, setThumbnail] = useState<string>('');

  // Fetches project status and project thumbnail

  useEffect(() => {
  const fetchStatus = async () => {
    const response = await getByID(projectData.projectId);
    if(response.data) {
      setStatus(response.data.status);
    } else {
      setStatus('Error loading status');
    }
  };
    const fetchThumbnail = async () => {
      const response = await getThumbnail(projectData.projectId);
      if (response.data) setThumbnail(response.data.image)
    };
    fetchStatus();
    fetchThumbnail();
  })

  //this doesn't look used and idk what it's meant to be used for
  //it looks like it's supposed to be a toggle for when you press a button but idk which button that would be
  //i'll just leave it alone for now
  const toggleOptions = () => setOptionsShown(!optionsShown); 

  //Constructs url linking to relevant project page
  const projectURL = `${paths.routes.NEWPROJECT}?projectID=${projectData.projectId}`;

  const handleLeaveProject = async () => {
    const response = await leaveProject(projId);
    setRequestType('leave');
    setResultObj(response);
    setShowResult(true);
  };

  const handleDeleteProject = async () => {
    const response = await deleteProject(projId);
    setRequestType('delete');
    setResultObj(response);
    setShowResult(true);
  };

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
          src={thumbnail
            ? `images/thumbnails/${thumbnail}`
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
        <DropdownButton buttonId="list-card-options-button">•••</DropdownButton>
        <DropdownContent rightAlign={true}>
          <div className={`list-card-options-list show`}>
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
                    <PopupButton className='confirm-btn' callback={handleLeaveProject}>
                      Confirm
                    </PopupButton>
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
                    <h3>Delete Project</h3>
                    <p className='confirm-msg'>
                      Are you sure you want to delete this project? This action cannot be undone.
                    </p>
                    <div className='confirm-deny-btns'>
                      <PopupButton className='confirm-btn' callback={handleDeleteProject}>
                        Confirm
                      </PopupButton>
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
