// --- Imports ---
import { JSX, useCallback, useEffect, useMemo, useState } from "react";
import { Popup, PopupButton, PopupContent } from "../../Popup";
import profileImage from '../../../images/blue_frog.png';
import { SearchBar } from "../../SearchBar";
import { Dropdown, DropdownButton, DropdownContent } from "../../Dropdown";
import { ThemeIcon } from "../../ThemeIcon";
import { Select, SelectButton, SelectOptions } from "../../Select";
import { current } from "@reduxjs/toolkit";
import { getJobTitles, getUsers, getUsersById, getUserByUsername } from "../../../api/users";
import { 
  ProjectDetail,
  ProjectJob,
  User,
  UserPreview,
  ProjectMember,
  JobAvailability,
  JobDuration,
  JobLocation,
  JobCompensation,
  Role
} from "@looking-for-group/shared";

//backend base url for getting images


// --- Variables ---
// Default project value
const emptyMember: ProjectMember = {
  user: {
    userId: -1,
    firstName: '',
    lastName: '',
    username: '',
    profileImage: null,
    apiUrl: ''
  },
  role: { roleId: 0, label: '' },
  memberSince: new Date(),
  apiUrl: ''
};

const emptyJob: ProjectJob = {
  jobId: 0,
  role: {roleId: 0, label: '' },
  availability: 'Flexible',
  duration: 'ShortTerm',
  location: 'Remote',
  compensation: 'Unpaid',
  description: '',
  createdAt: new Date(),
  updatedAt: new Date(),
  apiUrl: ''
};

// Job detail options (according to documentation enums)
const availabilityOptions = ['FullTime', 'PartTime', 'Flexible'];
const durationOptions = ['ShortTerm', 'LongTerm'];
const locationOptions = ['OnSite', 'Remote', 'Hybrid'];
const compensationOptions = ['Unpaid', 'Paid'];
// const permissionOptions = ['Project Member', 'Project Manager', 'Project Owner'];

type TeamTabProps = {
  projectData: ProjectDetail;
  setProjectData: (data: ProjectDetail) => void;
  setErrorMember: (error: string) => void;
  setErrorPosition: (error: string) => void;
  // permissions: number;
  saveProject: () => void;
  failCheck: boolean;
};

// --- Component ---
export const TeamTab = ({ projectData, setProjectData, setErrorMember, setErrorPosition, /*permissions,*/ saveProject, failCheck }: TeamTabProps) => {

  // --- Hooks ---
  // tracking project modifications
  const [modifiedProject, setModifiedProject] = useState<ProjectDetail>(projectData);

  // for complete list of...
  const [allJobs, setAllJobs] = useState<{ titleId: number, label: string }[]>([]);
  const [allUsers, setAllUsers] = useState<UserPreview[]>([]);
  const [searchableUsers, setSearchableUsers] = useState<UserPreview[]>([]);

  // HTML contents
  // const [teamTabContent, setTeamTabContent] = useState(<></>);
  // const [positionWindowContent, setPositionWindowContent] = useState(<></>);

  // tracking which team tab is currently being viewed: 0 - current team, 1 - open positions
  const [currentTeamTab, setCurrentTeamTab] = useState(0);

  // tracking which role is being viewed out of all open positions: value is project titleId (or jobTitle titleId)
  const [currentRole, setCurrentRole] = useState(0);

  // tracking edits for...
  const [currentMember, setCurrentMember] = useState<ProjectMember>(emptyMember);
  const [currentJob, setCurrentJob] = useState<ProjectJob>(emptyJob);

  // store new member data to save later
  const [newMember, setNewMember] = useState<ProjectMember>(emptyMember);

  // tracking whether position view is in edit mode or not
  const [editMode, setEditMode] = useState(false);

  // tracking if the user is making a new position (after pressing Add Position button)
  const [newPosition, setNewPosition] = useState(false);

  // determine if a popup should close after press (PopupButton)
  const [closePopup, setClosePopup] = useState(false);

  // store search results
  const [searchResults, setSearchResults] = useState<UserPreview[]>([]);

  // errors/successful messages
  const [errorAddMember, setErrorAddMember] = useState('');
  const [errorAddPosition, setErrorAddPosition] = useState('');
  const [successAddMember, setSuccessAddMember] = useState(false);

  // tracking search input & dropdown selections
  const [searchQuery, setSearchQuery] = useState('');
  const [searchBarKey, setSearchBarKey] = useState(0);
  const [selectKey, setSelectKey] = useState(0);
  const [permissionSelectKey, setPermissionSelectKey] = useState(0);

  // Initial load
  // useEffect(() => {
  //   setPositionWindowContent(positionViewWindow);
  // }, []);

  // Update data when data is changed
  useEffect(() => {
    setModifiedProject(projectData);
  }, [projectData]);

  // Update parent state when data is changed
  useEffect(() => {
    setProjectData(modifiedProject);
  }, [modifiedProject, setProjectData]);

  // Update parent state with error message
  useEffect(() => {
    setErrorMember(errorAddMember);
  }, [errorAddMember, setErrorMember]);
  useEffect(() => {
    setErrorPosition(errorAddPosition);
  }, [errorAddPosition, setErrorPosition]);

  // Get job list if allJobs is empty
  useEffect(() => {
    const getJobsList = async () => {
        const response = await getJobTitles();
        if (response.data) {
          setAllJobs(response.data);
        }
    };
    if (allJobs.length === 0) {
      getJobsList();
    }
  }, [allJobs]);

  // Get user list if allUsers is empty
  useEffect(() => {
    const getUsersList = async () => {
      try {
        const response = await getUsers();

        setAllUsers(response.data!);

        // list of users to search. users searchable by first name, last name, or username
        const searchableUsers = await Promise.all(response.data.map(async (user: User) => {
          // get make searchable user
          const filteredUser = {
            "username": user.username,
            "firstName": user.firstName,
            "lastName": user.lastName,
          };
          return filteredUser;
        }));

        if (searchableUsers === undefined) {
          return;
        }
        setSearchableUsers(searchableUsers);
      } catch (error) {
        console.error(error);
      }
    };
    if (!allUsers || allUsers.length === 0) {
      getUsersList();
    }
  }, [allUsers]);

  // Assign active buttons in Open Positions
  const isTeamTabOpen = currentTeamTab === 1;
  useEffect(() => {
    // add id of selected button
    const assigningButton = document.querySelector(`button[data-id="${currentRole}"]`);
    if (assigningButton) {
      // remove id of old button
      const oldButton = document.querySelector('#team-positions-active-button');
      if (oldButton) {
        oldButton.id = '';
      }
      assigningButton.id = 'team-positions-active-button';
      return;
    }

    // neither button present, assign default
    const buttonDiv = document.querySelector('.team-positions-button');

    if (buttonDiv && buttonDiv.querySelector('button')) {
      const defaultButton = buttonDiv.querySelector('button');
      defaultButton!.id = 'team-positions-active-button'; // explicit because check is passed in the if statement
      setCurrentRole(Number(defaultButton!.dataset.id));
    }
  }, [currentRole, isTeamTabOpen]);



  // --- Data retrieval ---
  // Get project job info
  const getProjectJob = useCallback((id: number) => {
    return modifiedProject.jobs.find((job: { titleId: number }) => job.titleId === id);
  }, [modifiedProject.jobs]);



  // --- Member handlers ---
  // Error checks for adding a new member
  const handleNewMember = useCallback(() => {
    setClosePopup(false);

    const member = newMember;

    // reset searchbar and dropdowns
    const resetFields = () => {
    setSearchQuery('');
    setSelectKey(prev => prev + 1);
  };
    
    // notify user of error, reset fields
    const errorWarning = (message: string) => {
    setSuccessAddMember(false);
    setErrorAddMember(message);
    resetFields();
    return false;
  };

    // check if member is already in project
    const isMember = modifiedProject.members.find((m) => m.user.userId === newMember.user.userId);
    if (isMember) {
      return errorWarning(`${newMember.user.firstName} ${newMember.user.lastName} is already on the team`);
    }

    // get name
    if (!newMember.firstName || !newMember.lastName) {
      return errorWarning("Can't find user");
    }

    // get job title
    if (!newMember.jobTitle) {
      // try to get job title from role selection
      const role = document.querySelector<HTMLSelectElement>('#project-team-add-member-role-select');
      if (role && role.value !== 'Select') {
        newMember.jobTitle = role.value;
      }
      else {
      setSuccessAddMember(false);
      setErrorAddMember('Select a role');
      setSelectKey(prev => prev + 1);
      return false;
      }
    }

    // Match this user with all users to get profile image
    const matchedUser = allUsers.find((u) => u.userId === member.userId);
    member.profileImage = matchedUser ? matchedUser.profileImage : '';

    // check if member has name
    if (!member.firstName || !member.lastName) {
      setSuccessAddMember(false);
      setErrorAddMember('Member needs a first and last name');
      return false;
    } else {
      // prompt user of successfully added member
      setSuccessAddMember(true);
      setErrorAddMember(`${member.firstName} ${member.lastName} added to team!`);

      // reset prompt to clear
      setTimeout(() => {
        setErrorAddMember('');
        setSuccessAddMember(false);
      }, 2000)

      // close popup
      setClosePopup(true);
      // add member
      modifiedProject.members.push(member);
      resetFields();
      return true;
    }
  }, [allUsers, modifiedProject.members, newMember]);

  // Handle search results
  const handleSearch = useCallback((results: UserPreview[][]) => {
    setSearchResults(results[0] || []);
  }, []);

  // Handle clicking on a member in the search dropdown
  const handleUserSelect = useCallback(async (user: UserPreview) => {
    // reset error
    setErrorAddMember('');

    // set text input
    setSearchQuery(`${user.firstName} ${user.lastName} (${user.username})`);

    // get matching user data from user id
    const matchedUser = allUsers.find((u) => u.userId === user.userId);
    if (!matchedUser) {
      setErrorAddMember('User not found');
      return;
    }

    const mem = {
      firstName: matchedUser.firstName,
      lastName: matchedUser.lastName,
      profileImage: matchedUser.profileImage,
      jobTitle: '', // Placeholder value
      userId: matchedUser.userId,
    }

    // set new member
    setNewMember(mem);

    // clear search results
    setSearchResults([]);
  }, [allUsers]);

  // Resets Add Member name field, role/permission dropdowns
  const handlePopupReset = () => {
    setSearchQuery('');
    setSearchBarKey(prev => prev + 1);
    setSelectKey(prev => prev + 1);
    setClosePopup(false);
  }

  // --- Position handlers ---
  // update position edit window for creating a new position
  const addPositionCallback = useCallback(() => {
    // going back to previous state (cancel button)
    if (newPosition || editMode) {
      // no longer new position
      setNewPosition(false);
      // clear temp job
      setCurrentJob(emptyJob);
      // return to selected role
      const positions = document.querySelectorAll('.positions-popup-list-item');
      for (const p of positions) {
        const dataId = p.getAttribute('data-id');
        if (dataId && parseInt(dataId) === currentRole) {
          // found matching id, set element as active
          p.id = 'team-positions-active-button';
          break;
        }
      }
      // change to position view window
      // setPositionWindowContent(positionViewWindow);
      setEditMode(false);
    }
    // opening add position
    else {
      // empty input fields
      setNewPosition(true);
      // clear selected role
      setCurrentJob(emptyJob);
      const activePosition = document.querySelector('#team-positions-active-button');
      if (activePosition) activePosition.id = '';
      // change to position edit window
      // setPositionWindowContent(positionEditWindow);
      setEditMode(true);
    }
    setErrorAddPosition('');
  }, [currentRole, editMode, newPosition]);

  // Remove position listing
  const deletePosition = useCallback(() => {
    // filter out position
    const updatedJobs = modifiedProject.jobs.filter((j) => j.titleId !== currentRole);

    // update jobs
    setModifiedProject({ ...modifiedProject, jobs: updatedJobs });

    // reset current position
    const buttonDiv = document.querySelector('.team-positions-button');
    if (buttonDiv && buttonDiv.querySelector('button')) {
      const defaultButton = buttonDiv.querySelector('button');
      defaultButton!.id = 'team-positions-active-button'; // explicit because check is passed in the if statement
      setCurrentRole(Number(defaultButton!.dataset.id));
    }
  }, [currentRole, modifiedProject]);

  //Save current inputs in position editing window
  const savePosition = useCallback(() => {
    // check if all values present
    if (
      currentJob.jobId ||
      currentJob.role.label === '' ||
      currentJob.description === '' ||
      currentJob.availability === '' ||
      currentJob.location === '' ||
      currentJob.duration === '' ||
      currentJob.compensation === ''
    ) {
      // set error
      setErrorAddPosition('All fields are required');
      return;
    }

    // check if same position is present
    const existingJob = modifiedProject.jobs.find(
      (j) => j.jobId === currentJob.jobId && j !== currentJob
    );
    if (existingJob) {
      setErrorAddPosition('Job already exists');
      return;
    }

    // if new position, add to job list
    if (newPosition) {
      setModifiedProject({ ...modifiedProject, jobs: [...modifiedProject.jobs, currentJob] });
    } else {
      // find matching position
      const updatedJobs = modifiedProject.jobs.map((j) =>
        j.jobId === currentJob.jobId ? { ...j, ...currentJob } : j
      );
      setModifiedProject({ ...modifiedProject, jobs: updatedJobs });
    }
    setErrorAddPosition('');
    setNewPosition(false);
    // setPositionWindowContent(positionViewWindow);
    setEditMode(false);

    // set current position to saved position
    setCurrentRole(currentJob.jobId);
  }, [currentJob, modifiedProject, newPosition]);



  // --- Content variables ---
  // Open position display
  const positionViewWindow = (
    <>
      <button
        className="edit-project-member-button"
        onClick={() => {
          setCurrentJob(getProjectJob(currentRole)!);
          setEditMode(true);
        }}
      >
        <ThemeIcon id={'pencil'} width={11} height={12} className={'gradient-color-fill edit-project-member-icon'} ariaLabel={'edit'}/>
      </button>
      <div className="positions-popup-info-title">{getProjectJob(currentRole)?.role.label}</div>
      <div className="positions-popup-info-description">
        <div id="position-description-content">{getProjectJob(currentRole)?.description}</div>
      </div>
      <div id="open-position-details">
        <div id="open-position-details-left">
          <div id="position-availability">
            <span className="position-detail-indicator">Availability: </span>
            {getProjectJob(currentRole)?.availability}
          </div>
          <div id="position-location">
            <span className="position-detail-indicator">Location: </span>
            {getProjectJob(currentRole)?.location}
          </div>
          <div id="open-position-contact">
            <span className="position-detail-indicator">Contact: </span>
            {/* <span
              // onClick={() =>
              //   navigate(`${paths.routes.PROFILE}?userID=${projectLead.userId}`)
              // }
              id="position-contact-link"
            >
              <img src="/assets/creditProfiles/JF.png" alt="" />
              Lily Carter
            </span> */}
            {modifiedProject.members.map((m) => {
              const memberUser = m.user;
                if (memberUser.userId === modifiedProject.owner.userId) {
                  return (
                      <span key={memberUser.userId} id="position-contact-link">
                        <img 
                          className='project-member-image'
                          src={`images/profiles/${memberUser.profileImage}`}
                          alt="profile"
                          // default profile picture if user image doesn't load
                          // Cannot use usePreloadedImage function because this is in a callback
                          onLoad={() => {
                            const profileImg = document.getElementById(`profile-image-${memberUser.userId}`) as HTMLImageElement;
                            profileImg.src = `images/profiles/${memberUser.profileImage}`;
                          }}
                          onError={(e) => {
                            const profileImg = e.target as HTMLImageElement;
                            profileImg.src = profileImage;
                          }}
                        />
                        {memberUser.firstName} {memberUser.lastName}
                      </span>
                  );
                }

                return null;
              })}
          </div>
        </div>
        <div id="open-position-details-right">
          <div id="position-duration">
            <span className="position-detail-indicator">Duration: </span>
            {getProjectJob(currentRole)?.duration}
          </div>
          <div id="position-compensation">
            <span className="position-detail-indicator">Compensation: </span>
            {getProjectJob(currentRole)?.compensation}
          </div>
        </div>
      </div>
      <Popup>
        <PopupButton className="delete-position-button button-reset">
          <img src="/images/icons/delete-red.svg" alt="trash can" />
        </PopupButton>
        <PopupContent useClose={false}>
          <div id="project-team-delete-member-title">Delete Position</div>
          <div id="project-team-delete-member-text" className="project-editor-extra-info">
            Are you sure you want to delete{' '}
            <span className="project-info-highlight">
              {getProjectJob(currentRole)?.jobTitle}
            </span>{' '}
            from the project? This action cannot be undone.
          </div>
          <div className="project-editor-button-pair">
            {/* TODO: make delete button work */}
            <PopupButton className="delete-button" callback={() => deletePosition()}>
              Delete
            </PopupButton>
            <PopupButton buttonId="team-delete-member-cancel-button">Cancel</PopupButton>
          </div>
        </PopupContent>
      </Popup>
    </>
  );

  // Find selected members 
  const selectedMember = modifiedProject.members.find(
  (m) => m.user === modifiedProject.owner
);

  // Edit open position or creating new position
  const positionEditWindow = (
    <>
      <div id="edit-position-role">
        <label>Role*</label>
        {/* <select
          key={currentRole}
          onChange={(e) => {
            const selectedTitle = allJobs.find((j) => j.label === e.target.value);
            if (selectedTitle)
              setCurrentJob({
                ...currentJob,
                titleId: selectedTitle.titleId,
                jobTitle: selectedTitle.label,
              });
          }}
        >
          <option disabled selected={newPosition}>
            Select
          </option>
          {allJobs.map((job: { titleId: number; label: string }) => (
            <option
              key={job.titleId}
              selected={newPosition ? false : job.titleId === currentRole}
              onClick={() => {
                const updatedJobs = modifiedProject.jobs.map((j) =>
                  j.titleId === job.titleId ? { ...j, jobTitle: job.label } : j
                );
                setModifiedProject({ ...modifiedProject, jobs: updatedJobs });
              }}
            >
              {job.label}
            </option>
          ))}
        </select> */}
        <Select>
          <SelectButton 
            placeholder={(newPosition) ? 'Select' : ''}
            initialVal={(newPosition) ? '' : (allJobs.length > 0 && currentRole) ? allJobs.find((j) => j.titleId === currentRole)!.label : ''}
          />
          <SelectOptions 
            callback={(e) => {
              const selectedTitle = allJobs.find((j) => j.label === e.target.value);

              if (selectedTitle) {
                setCurrentJob({
                  ...currentJob,
                  titleId: selectedTitle.titleId,
                  jobTitle: selectedTitle.label,
                });
              }
            }}
            options={allJobs.map((job) => {
              return {
                markup: <>{job.label}</>,
                value: job.label,
                disabled: false,
              };
            })}
          />
        </Select>
        <div id="edit-position-buttons">
          <div id="edit-position-button-pair">
            <button onClick={savePosition} id="position-edit-save">
              Save
            </button>
            <button
              onClick={() => {
                addPositionCallback();
              }}
              id="position-edit-cancel"
              className="button-reset"
            >
              Cancel
            </button>
          </div>
          <div className="error">{errorAddPosition}</div>
        </div>
      </div>

      <div id="edit-position-description">
        <label>Role Description*</label>
        <textarea
          value={currentJob.description ?? ''}
          onChange={(e) => setCurrentJob({ ...currentJob, description: e.target.value })}
        >
          {newPosition ? '' : getProjectJob(currentRole)?.description}
        </textarea>
      </div>

      <div id="edit-position-details">
        <div id="edit-position-details-left">
          <label className="edit-position-availability">Availability</label>
          {/* <select
            className="edit-position-availability"
            onChange={(e) => setCurrentJob({ ...currentJob, availability: e.target.value })}
          >
            <option disabled selected={newPosition}>
              Select
            </option>
            {availabilityOptions.map((o) => (
              <option
                key={o}
                selected={getProjectJob(currentRole)?.availability === o}
              >
                {o}
              </option>
            ))}
          </select> */}
          <Select>
            <SelectButton 
              placeholder='Select'
              
              initialVal={(newPosition) ? '' : (currentRole) ? getProjectJob(currentRole)?.availability : ''}
            />
            <SelectOptions 
              callback={(e) => setCurrentJob({ ...currentJob, availability: e.target.value })}
              options={availabilityOptions.map((o) => {
                return {
                  markup: <>{o}</>,
                  value: o,
                  disabled: false,
                };
              })}
            />
          </Select>
          <label className="edit-position-location">Location</label>
          {/* <select
            className="edit-position-location"
            onChange={(e) => setCurrentJob({ ...currentJob, location: e.target.value })}
          >
            <option disabled selected={newPosition}>
              Select
            </option>
            {locationOptions.map((o) => (
              <option
                selected={getProjectJob(currentRole)?.location === o}
              >
                {o}
              </option>
            ))}
          </select> */}
          <Select>
            <SelectButton 
              placeholder='Select'
              initialVal={(newPosition) ? '' : (currentRole) ? getProjectJob(currentRole)?.location : ''}
            />
            <SelectOptions 
              callback={(e) => setCurrentJob({ ...currentJob, location: e.target.value })}
              options={locationOptions.map((o) => {
                return {
                  markup: <>{o}</>,
                  value: o,
                  disabled: false,
                };
              })}
            />
          </Select>
          <label className="edit-position-contact">Main Contact</label>
          {/* <select className="edit-position-contact"></select> */}
          <Select>
            <SelectButton 
              className="edit-position-contact"
              placeholder="Select"
              initialVal={selectedMember ? `${selectedMember.firstName} ${selectedMember.lastName}` : ''}
            />
            <SelectOptions
              className="edit-position-contact"
              callback={(e) => {
                const selectedId = parseInt(e.target.value);
                setModifiedProject(prev => ({ ...prev, userId: selectedId }));
              }}       
              options={modifiedProject.members.map((m) => ({
                markup: (
                  <>
                    <img className='project-member-image' 
                      src={`images/profiles/${m.profileImage}`}
                      alt="profile"
                      title={'Profile picture'}
                      // Cannot use usePreloadedImage function because this is in a callback
                      onLoad={(e) => {
                        const profileImg = e.target as HTMLImageElement;
                        profileImg.src = `images/profiles/${profileImg}`;
                      }}
                      onError={(e) => {
                        const profileImg = e.target as HTMLImageElement;
                        profileImg.src = profileImage;
                      }}
                    />
                    <div className="project-editor-project-member-info">
                      <div className="project-editor-project-member-name">
                        {m.firstName} {m.lastName}
                      </div>
                    </div>
                  </>
                ),
                value: m.userId.toString(),
                disabled: false,
              }))}
            />
          </Select>
        </div>
        <div id="edit-position-details-right">
          <label className="edit-position-duration">Duration</label>
          {/* <select
            className="edit-position-duration"
            onChange={(e) => setCurrentJob({ ...currentJob, duration: e.target.value })}
          >
            <option disabled selected={newPosition}>
              Select
            </option>
            {durationOptions.map((o) => (
              <option
                selected={getProjectJob(currentRole)?.duration === o}
              >
                {o}
              </option>
            ))}
          </select> */}
          <Select>
            <SelectButton 
              placeholder='Select'
              initialVal={(newPosition) ? '' : (currentRole) ? getProjectJob(currentRole)?.duration : ''}
            />
            <SelectOptions 
              callback={(e) => setCurrentJob({ ...currentJob, duration: e.target.value })}
              options={durationOptions.map((o) => {
                return {
                  markup: <>{o}</>,
                  value: o,
                  disabled: false,
                };
              })}
            />
          </Select>
          <label className="edit-position-compensation">Compensation</label>
          {/* <select
            className="edit-position-compensation"
            onChange={(e) => setCurrentJob({ ...currentJob, compensation: e.target.value })}
          >
            <option disabled selected={newPosition}>
              Select
            </option>
            {compensationOptions.map((o) => (
              <option
                selected={newPosition ? false : getProjectJob(currentRole)?.compensation === o}
              >
                {o}
              </option>
            ))}
          </select> */}
          <Select>
            <SelectButton 
              placeholder='Select'
              initialVal={(newPosition) ? '' : (currentRole) ? getProjectJob(currentRole)?.compensation : ''}
            />
            <SelectOptions 
              callback={(e) => setCurrentJob({ ...currentJob, compensation: e.target.value })}
              options={compensationOptions.map((o) => {
                return {
                  markup: <>{o}</>,
                  value: o,
                  disabled: false,
                };
              })}
            />
          </Select>
        </div>
      </div>
    </>
  );

  // Check if team tab is in edit mode
  const positionWindow = editMode === true ? positionEditWindow : positionViewWindow;

  // teamTabContent is one of these
  const currentTeamContent: JSX.Element = useMemo(() => (
    <div id="project-editor-project-members">
      {/* List out project members */}
      {modifiedProject.members.map((m) => {
        const activeMember = m;

        return (
          <div key={m.user.userId} className="project-editor-project-member">
            <img
              className="project-member-image"
              src={`images/profiles/${m.user.profileImage}`}
              alt="profile image"
              title={'Profile picture'}
                // Cannot use usePreloadedImage function because this is in a callback
                onLoad={(e) => {
                  const profileImg = e.target as HTMLImageElement;
                  profileImg.src = `images/profiles/${profileImg}`;
                }}
                onError={(e) => {
                  const profileImg = e.target as HTMLImageElement;
                  profileImg.src = profileImage;
                }}
            />
            <div className="project-editor-project-member-info">
              <div className="project-editor-project-member-name">
                {/* {m.firstName} {m.lastName} */}
                {m.user.firstName && m.user.lastName
                ? `${m.user.firstName} ${m.user.lastName}` 
                : m.user.userId === 0  
                ? 'You'
                : ''
                }
              </div>
              <div className="project-editor-project-member-role project-editor-extra-info">
                {m.role.label}
              </div>
            </div>
            {/* ALWAYS SHOW EDIT BUTTON */}
            { /*((m.permissions < permissions) || (modifiedProject.userId === m.userId)) ? (*/
              <Popup>
                <PopupButton className="edit-project-member-button">
                  <ThemeIcon id={'pencil'} width={11} height={12} className={'gradient-color-fill edit-project-member-icon'} ariaLabel={'edit'}/>
                </PopupButton>
                {/* Edit member button */}
                <PopupContent useClose={false}>
                  <div id="project-team-edit-member-title">Edit Member</div>
                  <div
                    id="project-team-edit-member-card"
                    className="project-editor-project-member"
                  >
                    <img
                      className="project-member-image"
                      src={`images/profiles/${m.user.profileImage}`}
                      alt="profile image"
                      // default profile picture if user image doesn't load
                      onError={(e) => {
                        const profileImg = e.target as HTMLImageElement;
                        profileImg.src = profileImage;
                      }}
                    />
                    <div className="project-editor-project-member-name">
                      {m.user.firstName && m.user.lastName
                      ? `${m.user.firstName} ${m.user.lastName}` 
                      : m.user.userId === 0  
                      ? 'You'
                      : ''
                }
                    </div>
                  </div>
                  <div id="project-team-add-member-role">
                    <label>Role</label>
                    <Select>
                      <SelectButton
                        placeholder=''
                        initialVal={m.role.label}
                        className=''
                        type='dropdown'
                      />
                      <SelectOptions
                        callback={(e) => {
                          activeMember.role.label = (e.target as HTMLSelectElement).value;
                        }}
                        options={allJobs.map((job: { titleId: number; label: string }) => {
                          return {
                            markup: <>{job.label}</>,
                            value: job.label,
                            disabled: false,
                          };
                        })}
                      />
                    </Select>
                  </div>
                  {/* <div id="project-team-add-member-permissions">
                    <label>Permissions</label>
                    <Select>
                      <SelectButton
                        placeholder=''
                        initialVal={permissionOptions[m.permissions]}
                        className=''
                        type='dropdown'
                      />
                      <SelectOptions
                        callback={(e) => {
                          activeMember.permissions = parseInt(e.target.value);
                        }}
                        options={permissionOptions.map((perm, index) => {
                          return {
                            markup: <>{perm}</>,
                            value: `${index}`,
                            disabled: (permissions < index),
                          };
                        })}
                      />
                    </Select>
                  </div> */}
                  {/* Action buttons */}
                  <div className="project-editor-button-pair">
                    <PopupButton
                      buttonId="team-edit-member-save-button"
                      callback={() => {
                        // update members
                        const members = modifiedProject.members.map((m) =>
                          m.userId === activeMember.userId ? activeMember : m
                        );

                        setModifiedProject({ ...modifiedProject, members });
                      }}
                    >
                      Save
                    </PopupButton>
                    <Popup>
                      <PopupButton className="delete-button">Delete</PopupButton>
                      <PopupContent>
                        <div id="project-team-delete-member-title">Delete Member</div>
                        <div
                          id="project-team-delete-member-text"
                          className="project-editor-extra-info"
                        >
                          Are you sure you want to delete{' '}
                          <span className="project-info-highlight">
                            {m.firstName} {m.lastName}
                          </span>{' '}
                          from the project? This action cannot be undone.
                        </div>
                        <div className="project-editor-button-pair">
                          <button className="delete-button">Delete</button>
                          <PopupButton
                            buttonId="team-delete-member-cancel-button"
                            className="button-reset"
                          >
                            Cancel
                          </PopupButton>
                        </div>
                      </PopupContent>
                    </Popup>
                  </div>
                  <PopupButton
                    buttonId="team-edit-member-cancel-button"
                    className="button-reset"
                  >
                    Cancel
                  </PopupButton>
                </PopupContent>
              </Popup>
           /* ) : (
              <></>
            )*/}
          </div>
        );
      })}
      {/* Add member button */}
      <Popup>
        <PopupButton buttonId="project-editor-add-member">
          {/* <img id="project-team-add-member-image" src={profileImage} alt="" /> */}
          <ThemeIcon id="add-person" width={74} height={74} className="header-color-fill" ariaLabel="add member" />
          <div id="project-team-add-member-text">Add Member</div>
        </PopupButton>
        <PopupContent useClose={true}>
          <div id="project-team-add-member-title">Add Member</div>
          <div className={successAddMember ? "success" : "error"} id="error-add-member">
            {errorAddMember}
          </div>
          <div id="project-team-add-member-info">
            <label id="project-team-add-member-name">Name</label>
            <div id='user-search-container'>
              <Dropdown>
                <DropdownButton buttonId='user-search-dropdown-button'>
                  <SearchBar key={searchBarKey} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} dataSets={[searchableUsers]} onSearch={(results) => handleSearch(results)}></SearchBar>
                </DropdownButton>
                <DropdownContent>
                  <div id='user-search-results'>
                    {
                      searchResults.data.map((user, index) => (
                        <DropdownButton
                          key={user.userId ?? index}
                          className={
                            `user-search-item 
                            ${(index === 0) ? 'top' : ''}
                            ${(index === searchResults.data.length - 1) ? 'bottom' : ''}`
                          }
                          callback={() => handleUserSelect(user)}
                        >
                          <p className='user-search-name'>{user.firstName} {user.lastName}</p>
                          <p className='user-search-username'>{user.username}</p>
                        </DropdownButton>
                      ))
                    }
                  </div>
                </DropdownContent>
              </Dropdown>
            </div>
            <label id="project-team-add-member-role">Role</label>
            <Select key={selectKey}>
              <SelectButton
                placeholder='Select'
                initialVal=''
                className=''
              />
              <SelectOptions
                callback={(e) => {
                  setNewMember({ ...newMember, jobTitle: e.target.value });
                }}
                options={allJobs.map((job: { titleId: number; label: string }) => {
                  return {
                    markup: <>{job.label}</>,
                    value: job.label,
                    disabled: false,
                  };
                })}
              />
            </Select>
          </div>
          {/* Action buttons */}
          <div className="project-editor-button-pair">
            <PopupButton
              buttonId="team-add-member-add-button"
              callback={() => {
                const memberAdded = handleNewMember();
                return memberAdded;
              }}
             doNotClose={(prev) => !prev}
            >
              Add
            </PopupButton>
            <PopupButton buttonId="team-add-member-cancel-button"
             callback={() => {
              setNewMember(emptyMember);
              setErrorAddMember('');
              handlePopupReset();
            }} 
            className="button-reset">
              Cancel
            </PopupButton>
          </div>
        </PopupContent>
      </Popup>
    </div>
  ), [allJobs, errorAddMember, handleNewMember, handleSearch, handleUserSelect, modifiedProject, newMember, /*permissions,*/ searchBarKey, searchQuery, searchResults.data, searchableUsers, selectKey, successAddMember]);
  const openPositionsContent: JSX.Element = useMemo(() => (
    <div id="project-team-open-positions-popup">
      <div className="positions-popup-list">
        <div id="team-positions-popup-list-header">Open Positions</div>
        <div id="team-positions-popup-list-buttons">
          {modifiedProject.jobs?.map((job: { jobTitle: string; titleId: number }) => (
            <div key={job.titleId} className="team-positions-button">
              <img src="/images/icons/drag.png" alt="positions" />
              <button
                className="positions-popup-list-item"
                id=""
                data-id={job.titleId}
                onClick={() => (!editMode ? setCurrentRole(job.titleId) : {})}
              >
                {job.jobTitle}
              </button>
            </div>
          ))}
          <div className="add-item-button">
            <button
              onClick={() => {
                if (!editMode) {
                  setNewPosition(true);
                  addPositionCallback();
                }
              }}
            >
              <i className="fa fa-plus" />
              <p className="project-editor-extra-info">Add position</p>
            </button>
          </div>
        </div>
      </div>
      <div className="positions-popup-info" id={editMode ? 'positions-popup-list-edit' : ''}>
        {/* {positionWindowContent} */}
        {positionWindow}
      </div>
    </div>
  ), [addPositionCallback, editMode, modifiedProject.jobs, positionWindow]);

  // Set content depending on what tab is selected
  const teamTabContent =
    currentTeamTab === 0 ? currentTeamContent :
      currentTeamTab === 1 ? openPositionsContent :
        <></>;



  // --- Complete component ---
  return (
    <div id="project-editor-team">
      <div id="project-editor-team-tabs">
        <button
          onClick={() => { setCurrentTeamTab(0); /*setTeamTabContent(currentTeamContent);*/ }}
          className={`button-reset project-editor-team-tab ${currentTeamTab === 0 ? 'team-tab-active' : ''}`}
        >
          Current Team
        </button>
        <button
          onClick={() => { setCurrentTeamTab(1); /*setTeamTabContent(openPositionsContent);*/ }}
          className={`button-reset project-editor-team-tab ${currentTeamTab === 1 ? 'team-tab-active' : ''}`}
        >
          Open Positions
        </button>
      </div>

      <div id="project-editor-team-content">{teamTabContent}</div>

      <div id="team-save-info">
        <PopupButton buttonId="project-editor-save" callback={saveProject} doNotClose={() => !failCheck}>
          Save Changes
        </PopupButton>
      </div>
    </div>
  ); 
};

// Because of hooks depending on each other, this is not implemented.
// Relevant references are commented out above.
// positionWindowContent is one of these

// Open position display
// const positionViewWindow = useMemo(() => (
//   <>
//     <button
//       className="edit-project-member-button"
//       onClick={() => {
//         setCurrentJob(getProjectJob(currentRole));
//         setPositionWindowContent(positionEditWindow);
//         setEditMode(true);
//       }}
//     >
//       <img className="edit-project-member-icon" src="/images/icons/pencil.png" alt="" />
//     </button>
//     <div className="positions-popup-info-title">{getProjectJob(currentRole).jobTitle}</div>
//     <div className="positions-popup-info-description">
//       <div id="position-description-content">{getProjectJob(currentRole).description}</div>
//     </div>
//     <div id="open-position-details">
//       <div id="open-position-details-left">
//         <div id="position-availability">
//           <span className="position-detail-indicator">Availability: </span>
//           {getProjectJob(currentRole).availability}
//         </div>
//         <div id="position-location">
//           <span className="position-detail-indicator">Location: </span>
//           {getProjectJob(currentRole).location}
//         </div>
//         <div id="open-position-contact">
//           <span className="position-detail-indicator">Contact: </span>
//           <span
//             // onClick={() =>
//             //   navigate(`${paths.routes.PROFILE}?userID=${projectLead.userId}`)
//             // }
//             id="position-contact-link"
//           >
//             <img src="/assets/creditProfiles/JF.png" alt="" />
//             {/* {projectLead.firstName} {projectLead.lastName} */}
//             Lily Carter
//           </span>
//         </div>
//       </div>
//       <div id="open-position-details-right">
//         <div id="position-duration">
//           <span className="position-detail-indicator">Duration: </span>
//           {getProjectJob(currentRole).duration}
//         </div>
//         <div id="position-compensation">
//           <span className="position-detail-indicator">Compensation: </span>
//           {getProjectJob(currentRole).compensation}
//         </div>
//       </div>
//     </div>
//     <Popup>
//       <PopupButton className="delete-position-button button-reset">
//         <img src="/images/icons/delete.svg" alt="trash can" />
//       </PopupButton>
//       <PopupContent useClose={false}>
//         <div id="project-team-delete-member-title">Delete Position</div>
//         <div id="project-team-delete-member-text" className="project-editor-extra-info">
//           Are you sure you want to delete{' '}
//           <span className="project-info-highlight">
//             {getProjectJob(currentRole).jobTitle}
//           </span>{' '}
//           from the project? This action cannot be undone.
//         </div>
//         <div className="project-editor-button-pair">
//           {/* TODO: make delete button work */}
//           <PopupButton className="delete-button" callback={() => deletePosition()}>
//             Delete
//           </PopupButton>
//           <PopupButton buttonId="team-delete-member-cancel-button">Cancel</PopupButton>
//         </div>
//       </PopupContent>
//     </Popup>
//   </>
// ), [currentRole, deletePosition, getProjectJob, positionEditWindow]);
// const positionEditWindow = useMemo(() => (
//   <>
//     <div id="edit-position-role">
//       {/* TODO: add place for error message (setErrorAddPosition) */}
//       <label>Role*</label>
//       <select
//         key={currentRole}
//         onChange={(e) => {
//           const selectedTitle = allJobs.find((j) => j.label === e.target.value);
//           if (selectedTitle)
//             setCurrentJob({
//               ...currentJob,
//               titleId: selectedTitle.titleId,
//               jobTitle: selectedTitle.label,
//             });
//         }}
//       >
//         <option disabled selected={newPosition}>
//           Select
//         </option>
//         {allJobs.map((job: { titleId: number; label: string }) => (
//           <option
//             key={job.titleId}
//             selected={newPosition ? false : job.titleId === currentRole}
//             onClick={() => {
//               const updatedJobs = modifiedProject.jobs.map((j) =>
//                 j.titleId === job.titleId ? { ...j, jobTitle: job.label } : j
//               );
//               setModifiedProject({ ...modifiedProject, jobs: updatedJobs });
//             }}
//           >
//             {job.label}
//           </option>
//         ))}
//       </select>
//       <div id="edit-position-buttons">
//         <div id="edit-position-button-pair">
//           <button onClick={savePosition} id="position-edit-save">
//             Save
//           </button>
//           <button
//             onClick={() => {
//               addPositionCallback();
//             }}
//             id="position-edit-cancel"
//             className="button-reset"
//           >
//             Cancel
//           </button>
//         </div>
//         <div className="error">{errorAddPosition}</div>
//       </div>
//     </div>

//     <div id="edit-position-description">
//       <label>Role Description*</label>
//       <textarea
//         onChange={(e) => setCurrentJob({ ...currentJob, description: e.target.value })}
//       >
//         {newPosition ? '' : getProjectJob(currentRole).description}
//       </textarea>
//     </div>

//     <div id="edit-position-details">
//       <div id="edit-position-details-left">
//         <label className="edit-position-availability">Availability</label>
//         <select
//           className="edit-position-availability"
//           onChange={(e) => setCurrentJob({ ...currentJob, availability: e.target.value })}
//         >
//           <option disabled selected={newPosition}>
//             Select
//           </option>
//           {availabilityOptions.map((o) => (
//             <option
//               key={o}
//               selected={newPosition ? false : getProjectJob(currentRole).availability === o}
//             >
//               {o}
//             </option>
//           ))}
//         </select>
//         <label className="edit-position-location">Location</label>
//         <select
//           className="edit-position-location"
//           onChange={(e) => setCurrentJob({ ...currentJob, location: e.target.value })}
//         >
//           <option disabled selected={newPosition}>
//             Select
//           </option>
//           {locationOptions.map((o) => (
//             <option
//               selected={newPosition ? false : getProjectJob(currentRole).location === o}
//             >
//               {o}
//             </option>
//           ))}
//         </select>
//         <label className="edit-position-contact">Main Contact</label>
//         <select className="edit-position-contact">{/* Put project lead here */}</select>
//       </div>
//       <div id="edit-position-details-right">
//         <label className="edit-position-duration">Duration</label>
//         <select
//           className="edit-position-duration"
//           onChange={(e) => setCurrentJob({ ...currentJob, duration: e.target.value })}
//         >
//           <option disabled selected={newPosition}>
//             Select
//           </option>
//           {durationOptions.map((o) => (
//             <option
//               selected={newPosition ? false : getProjectJob(currentRole).duration === o}
//             >
//               {o}
//             </option>
//           ))}
//         </select>
//         <label className="edit-position-compensation">Compensation</label>
//         <select
//           className="edit-position-compensation"
//           onChange={(e) => setCurrentJob({ ...currentJob, compensation: e.target.value })}
//         >
//           <option disabled selected={newPosition}>
//             Select
//           </option>
//           {compensationOptions.map((o) => (
//             <option
//               selected={newPosition ? false : getProjectJob(currentRole).compensation === o}
//             >
//               {o}
//             </option>
//           ))}
//         </select>
//       </div>
//     </div>
//   </>
// ), [addPositionCallback, allJobs, currentJob, currentRole, errorAddPosition, getProjectJob, modifiedProject, newPosition, savePosition]);