// --- Imports ---
import { JSX, useCallback, useEffect, useMemo, useState } from "react";
import { Popup, PopupButton, PopupContent } from "../../Popup";
import profileImage from '../../../images/blue_frog.png';
import { SearchBar } from "../../SearchBar";
import { Dropdown, DropdownButton, DropdownContent } from "../../Dropdown";
import { ThemeIcon } from "../../ThemeIcon";
import { Select, SelectButton, SelectOptions } from "../../Select";
import { current } from "@reduxjs/toolkit";

//backend base url for getting images
const API_BASE = `http://localhost:8081`;

// --- Interfaces ---
interface Image {
  id: number;
  image: string;
  position: number;
}

interface ProjectData {
  audience: string;
  description: string;
  hook: string;
  images: Image[];
  jobs: { title_id: number; job_title: string; description: string; availability: string; location: string; duration: string; compensation: string; }[];
  members: { first_name: string, last_name: string, job_title: string, profile_image: string, user_id: number, permissions: number }[];
  project_id?: number;
  project_types: { id: number, project_type: string }[];
  purpose: string;
  socials: { id: number, url: string }[];
  status: string;
  tags: { id: number, position: number, tag: string, type: string }[];
  thumbnail: string;
  title: string;
  user_id?: number;
}

interface SearchableUser {
  username: string;
  first_name: string;
  last_name: string;
}

// only includes properties relevant to this component
interface User {
  user_id: number;
  username: string;
  first_name: string;
  last_name: string;
  profile_image: string;
  permissions: number;
}

// --- Variables ---
// Default project value
const defaultProject: ProjectData = {
  audience: '',
  description: '',
  hook: '',
  images: [],
  jobs: [],
  members: [],
  project_id: -1,
  project_types: [],
  purpose: '',
  socials: [],
  status: '',
  tags: [],
  thumbnail: '',
  title: '',
};

const emptyMember = {
  first_name: '',
  last_name: '',
  job_title: '',
  profile_image: '',
  user_id: -1,
  permissions: -1,
};

const emptyJob = {
  title_id: 0,
  job_title: '',
  description: '',
  availability: '',
  location: '',
  duration: '',
  compensation: '',
};

// Job detail options (according to documentation enums)
const availabilityOptions = ['Full-time', 'Part-time', 'Flexible'];
const durationOptions = ['Short-term', 'Long-term'];
const locationOptions = ['On-site', 'Remote', 'Hybrid'];
const compensationOptions = ['Unpaid', 'Paid'];
const permissionOptions = ['Project Member', 'Project Manager', 'Project Owner'];

// --- Component ---
export const TeamTab = ({ isNewProject = false, projectData = defaultProject, setProjectData, setErrorMember, setErrorPosition, permissions }) => {

  // --- Hooks ---
  // tracking project modifications
  const [modifiedProject, setModifiedProject] = useState<ProjectData>(projectData);

  // for complete list of...
  const [allJobs, setAllJobs] = useState<{ title_id: number, label: string }[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchableUsers, setSearchableUsers] = useState<{ data: SearchableUser[] }>({ data: [] });

  // HTML contents
  // const [teamTabContent, setTeamTabContent] = useState(<></>);
  // const [positionWindowContent, setPositionWindowContent] = useState(<></>);

  // tracking which team tab is currently being viewed: 0 - current team, 1 - open positions
  const [currentTeamTab, setCurrentTeamTab] = useState(0);

  // tracking which role is being viewed out of all open positions: value is project title_id (or job_title title_id)
  const [currentRole, setCurrentRole] = useState(0);

  // tracking edits for...
  const [currentMember, setCurrentMember] = useState(emptyMember);
  const [currentJob, setCurrentJob] = useState(emptyJob);

  // store new member data to save later
  const [newMember, setNewMember] = useState(emptyMember);

  // tracking whether position view is in edit mode or not
  const [editMode, setEditMode] = useState(false);

  // tracking if the user is making a new position (after pressing Add Position button)
  const [newPosition, setNewPosition] = useState(false);

  // determine if a popup should close after press (PopupButton)
  const [closePopup, setClosePopup] = useState(false);

  // store search results
  const [searchResults, setSearchResults] = useState<{ data: User[] }>({ data: [] });

  // errors/successful messages
  const [errorAddMember, setErrorAddMember] = useState('');
  const [errorAddPosition, setErrorAddPosition] = useState('');
  const [successAddMember, setSuccessAddMember] = useState(false);

  // tracking search input & dropdown selections
  const [searchQuery, setSearchQuery] = useState('');
  const [searchBarKey, setSearchBarKey] = useState(0);
  const [selectKey, setSelectKey] = useState(0);

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
      const url = `/api/datasets/job-titles`;

      try {
        const response = await fetch(url);

        const jobTitles = await response.json();
        const jobTitleData = jobTitles.data;

        if (jobTitleData === undefined) {
          return;
        }
        setAllJobs(jobTitleData);
      } catch (error) {
        console.error(error.message);
      }
    };
    if (allJobs.length === 0) {
      getJobsList();
    }
  }, [allJobs]);

  // Get user list if allUsers is empty
  useEffect(() => {
    const getUsersList = async () => {
      const url = `/api/users`;

      try {
        const response = await fetch(url);

        const users = await response.json();

        setAllUsers(users.data);

        // list of users to search. users searchable by first name, last name, or username
        const searchableUsers = await Promise.all(users.data.map(async (user: User) => {
          // get username
          const usernameResponse = await fetch(`/api/users/${user.user_id}`);
          const usernameJson = await usernameResponse.json();

          // get make searchable user
          const filteredUser = {
            "username": usernameJson.data[0].username,
            "first_name": user.first_name,
            "last_name": user.last_name,
          };
          return filteredUser;
        }));

        if (searchableUsers === undefined) {
          return;
        }
        setSearchableUsers({ data: searchableUsers });
      } catch (error) {
        console.error(error.message);
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
    return modifiedProject.jobs.find((job: { title_id: number }) => job.title_id === id);
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
    const isMember = modifiedProject.members.find((m) => m.user_id === member.user_id);
    if (isMember) {
      return errorWarning(`${member.first_name} ${member.last_name} is already on the team`);
    }

    // get name
    if (!newMember.first_name || !newMember.last_name) {
      return errorWarning("Can\'t find user");
    }

    // get job title
    if (!newMember.job_title) {
      // try to get job title from role selection
      const role = document.querySelector<HTMLSelectElement>('#project-team-add-member-role-select');
      if (role && role.value !== 'Select') {
        newMember.job_title = role.value;
      }
      else {
      setSuccessAddMember(false);
      setErrorAddMember('Select a role');
      setSelectKey(prev => prev + 1);
      return false;
      }
    }

    // Match this user with all users to get profile image
    const matchedUser = allUsers.find((u) => u.user_id === member.user_id);
    member.profile_image = matchedUser ? matchedUser.profile_image : '';

    // check if member has name
    if (!member.first_name || !member.last_name) {
      setSuccessAddMember(false);
      setErrorAddMember('Member needs a first and last name');
      return false;
    } else {
      // prompt user of successfully added member
      setSuccessAddMember(true);
      setErrorAddMember(`${member.first_name} ${member.last_name} added to team!`);

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
  const handleSearch = useCallback((results: User[][]) => {
    // Check if too many results
    if (!allUsers || results[0].length === allUsers.length) {
      // Check if results are the same, do nothing
      if (searchResults.data.length === 0) return;
      setSearchResults({ data: [] });
    }
    // Check if results are the same, do nothing
    if (JSON.stringify(searchResults.data) === JSON.stringify(results[0])) return;
    // Set results
    setSearchResults({ data: results[0] });
  }, [allUsers, searchResults.data]);

  // Handle clicking on a member in the search dropdown
  const handleUserSelect = useCallback(async (user: User) => {
    // reset error
    setErrorAddMember('');

    // set text input
    setSearchQuery(`${user.first_name} ${user.last_name} (${user.username})`);

    // get user id of this user to compare
    let userId = -1;
    const getUserId = async () => {
      try {
        const response = await fetch(`/api/users/search-username/${user.username}`);
        const userJson = await response.json();
        userId = userJson.data[0].user_id;
      } catch (error) {
        console.error(error.message);
      }
    }
    await Promise.all([getUserId()]);

    // get matching user data from user id
    const matchedUser = allUsers.find((u) => u.user_id === userId);
    if (!matchedUser) {
      setErrorAddMember('User not found');
      return;
    }

    const mem = {
      first_name: matchedUser.first_name,
      last_name: matchedUser.last_name,
      profile_image: matchedUser.profile_image,
      job_title: '', // Placeholder value
      user_id: matchedUser.user_id,
    }

    // set new member
    setNewMember(mem);

    // clear search results
    setSearchResults({ data: [] });
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
    const updatedJobs = modifiedProject.jobs.filter((j) => j.title_id !== currentRole);

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
      currentJob.title_id === 0 ||
      currentJob.job_title === '' ||
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
      (j) => j.title_id === currentJob.title_id && j !== currentJob
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
        j.title_id === currentJob.title_id ? { ...j, ...currentJob } : j
      );
      setModifiedProject({ ...modifiedProject, jobs: updatedJobs });
    }
    setErrorAddPosition('');
    setNewPosition(false);
    // setPositionWindowContent(positionViewWindow);
    setEditMode(false);

    // set current position to saved position
    setCurrentRole(currentJob.title_id);
  }, [currentJob, modifiedProject, newPosition]);



  // --- Content variables ---
  // Open position display
  const positionViewWindow = (
    <>
      <button
        className="edit-project-member-button"
        onClick={() => {
          setCurrentJob(getProjectJob(currentRole) || emptyJob);
          setEditMode(true);
        }}
      >
        <ThemeIcon
          light={'/assets/white/pencil.png'}
          dark={'/assets/black/pencil.png'}
          alt={"edit"}
          addClass={"edit-project-member-icon"}
        />
      </button>
      <div className="positions-popup-info-title">{getProjectJob(currentRole)?.job_title}</div>
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
              //   navigate(`${paths.routes.PROFILE}?userID=${projectLead.user_id}`)
              // }
              id="position-contact-link"
            >
              <img src="/assets/creditProfiles/JF.png" alt="" />
              Lily Carter
            </span> */}
            {modifiedProject.members.map((m) => {
                if (m.user_id === modifiedProject.user_id) {
                  return (
                      <span key={m.user_id} id="position-contact-link">
                        <img 
                          className='project-member-image'
                          src={(m.profile_image) ? `${API_BASE}/images/profiles/${m.profile_image}` : profileImage}
                          alt="profile"
                          // default profile picture if user image doesn't load
                        onError={(e) => {
                          const profileImg = e.target as HTMLImageElement;
                          profileImg.src = profileImage;
                        }}
                        />
                        {m.first_name} {m.last_name}
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
              {getProjectJob(currentRole)?.job_title}
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
  (m) => m.user_id === modifiedProject.user_id
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
                title_id: selectedTitle.title_id,
                job_title: selectedTitle.label,
              });
          }}
        >
          <option disabled selected={newPosition}>
            Select
          </option>
          {allJobs.map((job: { title_id: number; label: string }) => (
            <option
              key={job.title_id}
              selected={newPosition ? false : job.title_id === currentRole}
              onClick={() => {
                const updatedJobs = modifiedProject.jobs.map((j) =>
                  j.title_id === job.title_id ? { ...j, job_title: job.label } : j
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
            initialVal={(newPosition) ? '' : (allJobs.length > 0 && currentRole) ? allJobs.find((j) => j.title_id === currentRole)!.label : ''}
          />
          <SelectOptions 
            callback={(e) => {
              const selectedTitle = allJobs.find((j) => j.label === e.target.value);

              if (selectedTitle) {
                setCurrentJob({
                  ...currentJob,
                  title_id: selectedTitle.title_id,
                  job_title: selectedTitle.label,
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
              initialVal={selectedMember ? `${selectedMember.first_name} ${selectedMember.last_name}` : ''}
            />
            <SelectOptions
              className="edit-position-contact"
              callback={(e) => {
                const selectedId = parseInt(e.target.value);
                setModifiedProject(prev => ({ ...prev, user_id: selectedId }));
              }}       
              options={modifiedProject.members.map((m) => ({
                markup: (
                  <>
                    <img className='project-member-image' 
                      src={m.profile_image ? `${API_BASE}/images/profiles/${m.profile_image}` : profileImage}
                      alt="profile"
                      // default profile picture if user image doesn't load
                      onError={(e) => {
                        const profileImg = e.target as HTMLImageElement;
                        profileImg.src = profileImage;
                      }}
                    />
                    <div className="project-editor-project-member-info">
                      <div className="project-editor-project-member-name">
                        {m.first_name} {m.last_name}
                      </div>
                    </div>
                  </>
                ),
                value: m.user_id.toString(),
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
          <div key={m.user_id} className="project-editor-project-member">
            <img
              className="project-member-image"
              src={(m.profile_image) ? `${API_BASE}/images/profiles/${m.profile_image}` : profileImage}
              alt="profile image"
              // default profile picture if user image doesn't load
              onError={(e) => {
                const profileImg = e.target as HTMLImageElement;
                profileImg.src = profileImage;
              }}
            />
            <div className="project-editor-project-member-info">
              <div className="project-editor-project-member-name">
                {/* {m.first_name} {m.last_name} */}
                {m.first_name && m.last_name 
                ? `${m.first_name} ${m.last_name}` 
                : m.user_id === 0  
                ? 'You'
                : ''
                }
              </div>
              <div className="project-editor-project-member-role project-editor-extra-info">
                {m.job_title}
              </div>
            </div>
            {/* ALWAYS SHOW EDIT BUTTON */}
            { /*((m.permissions < permissions) || (modifiedProject.user_id === m.user_id)) ? (*/
              <Popup>
                <PopupButton className="edit-project-member-button">
                  {/* <img
                  className="edit-project-member-icon"
                  src="/images/icons/pencil.png"
                  alt=""
                /> */}
                  <ThemeIcon
                    light={'/assets/white/pencil.png'}
                    dark={'/assets/black/pencil.png'}
                    alt={"edit"}
                    addClass={"edit-project-member-icon"}
                  />
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
                      src={`${API_BASE}/images/profiles/${m.profile_image}`}
                      alt="profile image"
                      // default profile picture if user image doesn't load
                      onError={(e) => {
                        const profileImg = e.target as HTMLImageElement;
                        profileImg.src = profileImage;
                      }}
                    />
                    <div className="project-editor-project-member-name">
                      {m.first_name && m.last_name 
                      ? `${m.first_name} ${m.last_name}` 
                      : m.user_id === 0  
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
                        initialVal={m.job_title}
                        className=''
                      />
                      <SelectOptions
                        callback={(e) => {
                          activeMember.job_title = e.target.value;
                        }}
                        options={allJobs.map((job: { title_id: number; label: string }) => {
                          return {
                            markup: <>{job.label}</>,
                            value: job.label,
                            disabled: false,
                          };
                        })}
                      />
                    </Select>
                  </div>
                  <div id="project-team-add-member-permissions">
                    <label>Permissions</label>
                    <Select>
                      <SelectButton
                        placeholder=''
                        initialVal={permissionOptions[m.permissions]}
                        className=''
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
                  </div>
                  {/* Action buttons */}
                  <div className="project-editor-button-pair">
                    <PopupButton
                      buttonId="team-edit-member-save-button"
                      callback={() => {
                        // update members
                        const members = modifiedProject.members.map((m) =>
                          m.user_id === activeMember.user_id ? activeMember : m
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
                            {m.first_name} {m.last_name}
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
          <ThemeIcon
            light={'/assets/white/profile.png'}
            dark={'/assets/black/profile.png'}
            id={'project-team-add-member-image'}
            alt={'add member'}
          />
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
                          key={user.user_id ?? index}
                          className={
                            `user-search-item 
                            ${(index === 0) ? 'top' : ''}
                            ${(index === searchResults.data.length - 1) ? 'bottom' : ''}`
                          }
                          callback={() => handleUserSelect(user)}
                        >
                          <p className='user-search-name'>{user.first_name} {user.last_name}</p>
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
                  setNewMember({ ...newMember, job_title: e.target.value });
                }}
                options={allJobs.map((job: { title_id: number; label: string }) => {
                  return {
                    markup: <>{job.label}</>,
                    value: job.label,
                    disabled: false,
                  };
                })}
              />
            </Select>
            <div id="project-team-add-member-permissions">
              <label>Permissions</label>
              <Select key={selectKey}>
                <SelectButton
                  placeholder='Select'
                  initialVal=''
                  className=''
                />
                <SelectOptions
                  callback={(e) => {
                    setNewMember({ ...newMember, permissions: parseInt(e.target.value) })
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
            </div>
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
  ), [allJobs, closePopup, currentMember, currentRole, errorAddMember, handleNewMember, handleSearch, handleUserSelect, modifiedProject, searchResults.data, searchableUsers]);
  const openPositionsContent: JSX.Element = useMemo(() => (
    <div id="project-team-open-positions-popup">
      <div className="positions-popup-list">
        <div id="team-positions-popup-list-header">Open Positions</div>
        <div id="team-positions-popup-list-buttons">
          {modifiedProject.jobs?.map((job: { job_title: string; title_id: number }) => (
            <div key={job.title_id} className="team-positions-button">
              <img src="/images/icons/drag.png" alt="positions" />
              <button
                className="positions-popup-list-item"
                id=""
                data-id={job.title_id}
                onClick={() => (!editMode ? setCurrentRole(job.title_id) : {})}
              >
                {job.job_title}
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
              <img src={'/images/icons/cancel.png'} alt="add" />
              <span className="project-editor-extra-info">Add position</span>
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
//     <div className="positions-popup-info-title">{getProjectJob(currentRole).job_title}</div>
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
//             //   navigate(`${paths.routes.PROFILE}?userID=${projectLead.user_id}`)
//             // }
//             id="position-contact-link"
//           >
//             <img src="/assets/creditProfiles/JF.png" alt="" />
//             {/* {projectLead.first_name} {projectLead.last_name} */}
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
//             {getProjectJob(currentRole).job_title}
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
//               title_id: selectedTitle.title_id,
//               job_title: selectedTitle.label,
//             });
//         }}
//       >
//         <option disabled selected={newPosition}>
//           Select
//         </option>
//         {allJobs.map((job: { title_id: number; label: string }) => (
//           <option
//             key={job.title_id}
//             selected={newPosition ? false : job.title_id === currentRole}
//             onClick={() => {
//               const updatedJobs = modifiedProject.jobs.map((j) =>
//                 j.title_id === job.title_id ? { ...j, job_title: job.label } : j
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