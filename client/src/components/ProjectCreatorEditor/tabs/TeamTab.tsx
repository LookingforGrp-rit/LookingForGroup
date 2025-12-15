// --- Imports ---
import { JSX, useCallback, useEffect, useMemo, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Popup, PopupButton, PopupContent, PopupContext } from "../../Popup";
import profileImage from "../../../images/blue_frog.png";
import { SearchBar } from "../../SearchBar";
import { Dropdown, DropdownButton, DropdownContent } from "../../Dropdown";
import { ThemeIcon } from "../../ThemeIcon";
import { Select, SelectButton, SelectOptions } from "../../Select";
import {
  getJobTitles,
  getUsers,
  getUsersById
} from "../../../api/users";
import {
  ProjectJob,
  UserPreview,
  ProjectMember,
  JobAvailability,
  JobDuration,
  JobLocation,
  JobCompensation,
  Role,
} from "@looking-for-group/shared";
import {
  JobAvailability as JobAvailabilityEnums,
  JobDuration as JobDurationEnums,
  JobLocation as JobLocationEnums,
  JobCompensation as JobCompensationEnums,
} from "@looking-for-group/shared/enums";
import {
  Pending,
  PendingProject,
  PendingProjectMember,
} from "@looking-for-group/client";
import { projectDataManager } from "../../../api/data-managers/project-data-manager";
import { current } from "../../../../../node_modules/@reduxjs/toolkit/dist/index";
import * as paths from '../../../constants/routes'

// --- Variables ---
// Default project value
//wait why are the placeholders still here

// Empty member object template used when adding new members.
const emptyMember: PendingProjectMember = {
  user: null,
  role: null,
  localId: null,
};

type UserSearchableFields = Pick<
  UserPreview,
  "firstName" | "lastName" | "username"
>;

// Empty job position template used when creating new positions.
const emptyJob: Pending<ProjectJob> = {
  availability: null,
  compensation: null,
  contact: null,
  description: "",
  duration: null,
  localId: null,
  location: null,
  role: null,
};

let localIdIncrement = 0;

type TeamTabProps = {
  dataManager: Awaited<ReturnType<typeof projectDataManager>>;
  projectData: PendingProject;
  //setProjectData: (data: ProjectDetail) => void; because of the data manager we no longer directly update the projectData from here
  setErrorMember: (error: string) => void;
  setErrorPosition: (error: string) => void;
  // permissions: number;
  saveProject: () => void;
  updatePendingProject: (updatedPendingProject: PendingProject) => void;
  failCheck: boolean;
};


/**
 * The TeamTab component manages two primary views: the current team members and open positions for a project. 
 * It provides interfaces for adding, editing, and removing team members, as well as creating and managing job positions. 
 * The component includes robust search functionality for finding users to add to the team and detailed permission controls.
 * @param dataManager data manager
 * @param projectData current project data
 * @param setErrorMember error message for member validation
 * @param setErrorPostiion error message for position addition
 * @param saveProject save project changes
 * @param updatePendingProject set modified project
 * @param failCheck indicates if data validation has failed
 * @returns JSX Element - Main component that manages team members and open positions for a project
 */
export const TeamTab = ({
  dataManager,
  projectData,
  setErrorMember,
  setErrorPosition,
  /*permissions,*/
  saveProject,
  updatePendingProject,
  failCheck,
}: TeamTabProps) => {
  // --- Hooks ---
  // State for storing all available roles from the API.
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  // State for storing all available users from the API.
  const [allUsers, setAllUsers] = useState<UserPreview[]>([]);
  // State for tracking users that can be searched.
  const [searchableUsers, setSearchableUsers] = useState<
    UserSearchableFields[]
  >([]);

  // tracking team changes
  const projectAfterTeamChanges: PendingProject = structuredClone(projectData);

  // HTML contents (needed if using commented out block at end of file)
  // const [teamTabContent, setTeamTabContent] = useState(<></>);
  // const [positionWindowContent, setPositionWindowContent] = useState(<></>);

  // State tracking which team tab is active: 0 - current team, 1 - open positions
  const [currentTeamTab, setCurrentTeamTab] = useState(0);

  // State for the team member currently being edited.
  const [currentMember, setCurrentMember] = useState<
    ProjectMember | PendingProjectMember
  >();
  // State tracking which job position is currently selected.
  const [currentJob, setCurrentJob] = useState<
    ProjectJob | Pending<ProjectJob>
  >();

  // State indicating whether position editing is active
  const [editMode, setEditMode] = useState(false);

  // State indicating whether a new position is being created.
  const [isCreatingNewPosition, setIsCreatingNewPosition] = useState(false);

  // State controlling whether a popup should close
  const [closePopup, setClosePopup] = useState(false);

  // State for storing user search results
  const [searchResults, setSearchResults] = useState<Partial<UserPreview>[]>(
    []
  );

  // State for error/successful messages
  const [errorAddMember, setErrorAddMember] = useState("");
  const [errorAddPosition, setErrorAddPosition] = useState("");
  const [successAddMember, setSuccessAddMember] = useState(false);

  // tracking search input & dropdown selections
  const [searchQuery, setSearchQuery] = useState("");
  const [searchBarKey, setSearchBarKey] = useState(0);
  const [selectKey, setSelectKey] = useState(0);
  // const [permissionSelectKey, setPermissionSelectKey] = useState(0);

  // selected contact name after saving local position
  const [contactName, setContactName] = useState("");


  // check if a value is null or undefined
  const isNullOrUndefined = (value: unknown | null | undefined) => {
    return value === null || value === undefined;
  };

  const navigate = useNavigate();

  const { setOpen: closeOuterPopup } = useContext(PopupContext);
  const { setOpen } = useContext(PopupContext);

  // Update parent state with error message
  useEffect(() => {
    setErrorMember(errorAddMember);
  }, [errorAddMember, setErrorMember]);
  useEffect(() => {
    setErrorPosition(errorAddPosition);
  }, [errorAddPosition, setErrorPosition]);

  // Get job list if allRoles is empty
  useEffect(() => {
    const getRolesList = async () => {
      const response = await getJobTitles();
      if (response.data) {
        setAllRoles(response.data);

        const memberRole = response.data.find(
          (role) => role.label === "Member"
        );
        if (memberRole) emptyJob.role = memberRole;
        // if (!currentJob) setCurrentJob({ ...emptyJob });
      }
    };
    if (allRoles.length === 0) {
      getRolesList();
    }
  }, [allRoles]);

  // Get user list if allUsers is empty
  useEffect(() => {
    const getUsersList = async () => {
      try {
        const response = await getUsers();

        if (response.data) setAllUsers(response.data);

        // list of users to search. users searchable by first name, last name, or username
        const searchableUsers = response.data?.map((user: UserPreview) => {
          // get make searchable user
          const filteredUser = {
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
          };
          return filteredUser;
        }) as UserSearchableFields[];

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
    // show first job in view by default
    if (!currentJob) return setCurrentJob(projectAfterTeamChanges.jobs[0]);

    const currentJobId =
      "localId" in currentJob ? currentJob.localId : currentJob.jobId;
    const currentJobIdType = "localId" in currentJob ? "local" : "canon";

    // update active button
    const activeJobButton = document.querySelector(
      `button[data-id="${currentJobId}"][data-id-type="${currentJobIdType}"]`
    );
    if (activeJobButton) {
      // unselect old button
      const lastActiveJobButton = document.querySelector(
        "#team-positions-active-button"
      );
      if (lastActiveJobButton) {
        lastActiveJobButton.id = "";
      }
      activeJobButton.id = "team-positions-active-button";
      return;
    }

    // no button for current job
    if (isCreatingNewPosition) {
      // unselect old button
      const lastActiveJobButton = document.querySelector(
        "#team-positions-active-button"
      );
      if (lastActiveJobButton) {
        lastActiveJobButton.id = "";
      }
      return;
    }
  }, [currentJob, isCreatingNewPosition, isTeamTabOpen, projectAfterTeamChanges.jobs]);

  // Load correct contact name in open positions
  useEffect(() => {
    const loadName = async () => {
    if (!currentJob?.contact?.userId) return;

    const user = await getUsersById(currentJob.contact.userId);
    setContactName(`${user.data?.firstName} ${user.data?.lastName}`);
  };

  loadName();
}, [currentJob?.contact?.userId]);

  // --- Data retrieval ---
  /**
   * Helper function that retrieves a job position by its ID from the modified project.
   * jobId and roleId mismatch: checks for matching role since we are keeping role labels unique (used to be jobId)
   * @param id - ID from modified project
   * @returns job object or undefined
   */
  const getProjectJob = useCallback((id: number) => {
    return projectAfterTeamChanges.jobs.find((j) =>
      j.role?.roleId === id
    )},
    [projectAfterTeamChanges.jobs]
  );

  // --- Member handlers ---
  /**
   * Validates and adds a new member to the project team after performing error checks.
   * @returns void 
   */
  const handleNewMember = useCallback(() => {
    setClosePopup(false);

    if (!currentMember) {
      setSuccessAddMember(false);
      setErrorAddMember("Missing new member!");
      return false;
    }

    // reset searchbar and dropdowns
    const resetFields = () => {
      setSearchQuery("");
      setSelectKey((previous) => previous + 1);
    };

    // notify user of error, reset fields
    const errorWarning = (message: string) => {
      setSuccessAddMember(false);
      setErrorAddMember(message);
      resetFields();
      return false;
    };

    // check if member is already in project
    // backend has something for this but it requires the object to be created
    // which at this point why wouldn't we just be creating this here
    // if it's invalid read the error we give you and give em that
    // const isMember = modifiedProject.members.find(
    //   ({ user }) => user.userId === member.user.userId
    // );
    // if (isMember) {
    //   return errorWarning(
    //     `${newMember.user.firstName} ${newMember.user.lastName} is already on the team`
    //   );
    // }

    // get user
    if (currentMember.user === null) {
      return errorWarning("Missing user!");
    }

    // get name
    if (!currentMember.user.firstName || !currentMember.user.lastName) {
      return errorWarning("Can't find user");
    }

    // get role
    if (!currentMember.role) {
      // try to get role from role selection
      const roleSelectElement = document.querySelector<HTMLSelectElement>(
        "#project-team-add-member-role-select"
      );
      if (roleSelectElement && roleSelectElement.value !== "Select") {
        const roleObject = allRoles.find(
          (role) => role.label === roleSelectElement.value
        );
        if (roleObject) {
          currentMember.role = {
            ...roleObject,
          };
        }
      } else {
        setSuccessAddMember(false);
        setErrorAddMember("Select a role"); // TODO default to Member role instead
        setSelectKey((previous) => previous + 1);
        return false;
      }
    }

    // Match this user with all users to get profile image
    const matchedUser = allUsers.find(
      (user) => user.userId === currentMember.user?.userId
    );
    if (currentMember.user)
      currentMember.user.profileImage = matchedUser
        ? matchedUser.profileImage
        : "";

    // check if member has name
    if (!currentMember.user?.firstName || !currentMember.user?.lastName) {
      setSuccessAddMember(false);
      setErrorAddMember("Member needs a first and last name");
      return false;
    } else {
      // prompt user of successfully added member
      setSuccessAddMember(true);
      setErrorAddMember(
        `${currentMember.user.firstName} ${currentMember.user.lastName} added to team!`
      );

      // reset prompt to clear visual effect of error text
      setTimeout(() => {
        setErrorAddMember("");
        setSuccessAddMember(false);
      }, 2000);

      // close popup
      setClosePopup(true);
      // add member

      if("localId" in currentMember) (currentMember as PendingProjectMember).localId = ++localIdIncrement;

      dataManager.createMember({
        id: {
          value: (currentMember as PendingProjectMember).localId ?? ++localIdIncrement,
          type: "local",
        },
        data: {
          userId: currentMember.user.userId,
          roleId: currentMember.role?.roleId,
        },
      });

      const localProjectMember: PendingProjectMember = {
        user: currentMember.user,
        role: currentMember.role,
        localId: (currentMember as PendingProjectMember).localId ?? ++localIdIncrement,
      };

      projectAfterTeamChanges.members = [...projectAfterTeamChanges.members, localProjectMember]
      updatePendingProject(projectAfterTeamChanges)

      setCurrentMember(emptyMember);
      resetFields();
      return true;
    }
  }, [allRoles, allUsers, currentMember, projectAfterTeamChanges, dataManager, updatePendingProject]);

  /**
   * Processes search results for users and updates the searchResults state.
   * @param results User results
   * @returns void
   */
  // FIXME does this need to be a 2D array?
  const handleSearch = useCallback(
    (results: Partial<UserPreview>[][]) => {
      // Update search results only if a change has been made
      if (JSON.stringify(searchResults) !== JSON.stringify(results[0])) {
        setSearchResults(results[0]);
      }
    },
    [searchResults]
  );

  /**
   * Handles the selection of a user from search results and prepares them for addition to the team.
   * @param selectedUser selected user 
   * @returns Promise<void>
   */
  const handleUserSelect = useCallback(
    async (selectedUser: UserPreview) => {
      // reset error
      setErrorAddMember("");

      // check if user exists on the projects
      if (
        projectAfterTeamChanges.members.find(
          (m) => m.user?.username === selectedUser.username
        )
      ) {
        setErrorAddMember("User is already on the team");
        return;
      }

      // set text input
      setSearchQuery(
        `${selectedUser.firstName} ${selectedUser.lastName} (${selectedUser.username})`
      );

      // get matching user data from username (only unique prop in search results)
      const matchedUser = allUsers.find(
        (user) => user.username === selectedUser.username
      );

      if (!matchedUser) {
        setErrorAddMember("User not found");
        return;
      }

      // set user for member
      setCurrentMember({
        ...emptyMember,
        ...currentMember,
        user: {
          ...matchedUser,
        },
      });

      // clear search results
      setSearchResults([]);
    },
    [allUsers, currentMember, projectAfterTeamChanges.members]
  );

  // Resets Add Member name field, role/permission dropdowns
  const handlePopupReset = () => {
    setSearchQuery("");
    setSearchBarKey((previous) => previous + 1);
    setSelectKey((previous) => previous + 1);
    setClosePopup(false);
  };

  // --- Position handlers ---
  /**
   * Toggles between adding a new position and canceling the operation.
   * @returns void
   */
  const addPositionCallback = useCallback(() => {
    // going back to previous state (cancel button)
    if (isCreatingNewPosition || editMode) {
      // we are no longer creating a new position
      setIsCreatingNewPosition(false);
      // reset the pending job
      setCurrentJob(undefined);
      // return to selected role

      // const positions = document.querySelectorAll(".positions-popup-list-item");
      // for (const p of positions) {
      //   const dataId = p.getAttribute("data-id");
      //   if (dataId && parseInt(dataId) === currentlyViewedJobId) {
      //     // found matching id, set element as active
      //     p.id = "team-positions-active-button";
      //     break;
      //   }
      // }
      // change to position view window
      // setPositionWindowContent(positionViewWindow);
      setEditMode(false);
    }
    // opening add position
    else {
      // empty input fields
      setIsCreatingNewPosition(true);
      // clear selected role
      setCurrentJob({ ...emptyJob });
      const activePosition = document.querySelector(
        "#team-positions-active-button"
      );
      if (activePosition) activePosition.id = "";
      // change to position edit window
      // setPositionWindowContent(positionEditWindow);
      setEditMode(true);
    }
    setErrorAddPosition("");
  }, [editMode, isCreatingNewPosition]);

  /**
   * Removes the currently selected position from the project.
   * @returns void
   */
  const deletePosition = useCallback(() => {
    if (
      currentJob &&
      ((currentJob as ProjectJob).jobId ||
        (currentJob as Pending<ProjectJob>).localId)
    ) {
      if ("jobId" in currentJob) {
        dataManager.deleteJob({
          id: {
            type: "canon",
            value: currentJob.jobId,
          },
          data: null,
        });
      } else {
        dataManager.deleteJob({
          id: {
            type: "local",
            value: currentJob.localId!,
          },
          data: null,
        });
      }

      const updatedProject = {
        ...projectAfterTeamChanges,
        jobs: projectAfterTeamChanges.jobs.filter((job) =>
          ("jobId" in currentJob && "jobId" in job && job.jobId !== currentJob.jobId) ||
          ("localId" in currentJob && "localId" in job && job.jobId !== currentJob.localId)
        )
      };

      updatePendingProject(updatedProject);
    }

    // filter out position
    // const updatedJobs = projectAfterTeamChanges.jobs.filter(
    //   ({ role: { roleId } }) => roleId !== currentlyViewedJobId
    // );

    // update jobs
    // setModifiedProject({ ...modifiedProject, jobs: updatedJobs });

    // reset current position
    // const buttonDiv = document.querySelector(".team-positions-button");
    // if (buttonDiv && buttonDiv.querySelector("button")) {
    //   const defaultButton = buttonDiv.querySelector("button");
    //   defaultButton!.id = "team-positions-active-button"; // explicit because check is passed in the if statement
    //   setCurrentlyViewedJobId(Number(defaultButton!.dataset.id));
    // }

    setCurrentJob(undefined);
  }, [currentJob, dataManager, projectAfterTeamChanges, updatePendingProject]);

  /**
   * Validates and saves position data, updating the project's job listings.
   * @returns void
   */
  //what is this and when is it called
  const savePosition = useCallback(() => {
    console.log(isCreatingNewPosition);
    (currentJob as Pending<ProjectJob>).localId = ++localIdIncrement;

    if (!currentJob) {
      setErrorAddPosition("No job to save!");
      return;
    }

    // job hasn't been created yet, this is a new job
    if (isCreatingNewPosition) {
      if (
        isNullOrUndefined(currentJob.role?.roleId) ||
        isNullOrUndefined(currentJob.availability) ||
        isNullOrUndefined(currentJob.location) ||
        isNullOrUndefined(currentJob.duration) ||
        isNullOrUndefined(currentJob.compensation) ||
        isNullOrUndefined(currentJob.contact?.userId)
      ) {
        // set error
        setErrorAddPosition("All fields are required");
        return;
      }


      dataManager.createJob({
        id: {
          value: (currentJob as Pending<ProjectJob>).localId ?? ++localIdIncrement,
          type: "local",
        },
        data: {
          availability: currentJob.availability,
          compensation: currentJob.compensation,
          contactUserId: currentJob.contact.userId,
          duration: currentJob.duration,
          location: currentJob.location,
          roleId: currentJob.role.roleId,
          description: currentJob.description ?? undefined,
        },
      });

      projectAfterTeamChanges.jobs = [
        ...projectAfterTeamChanges.jobs,
        currentJob as Pending<ProjectJob>
      ]
      
      updatePendingProject(projectAfterTeamChanges);

      setEditMode(false);
      setIsCreatingNewPosition(false);
      setCurrentJob(currentJob);
      console.log(projectAfterTeamChanges.jobs) //it's there! why isn't it updating?

      return;
    }

    dataManager.updateJob({
      id: {
        value: (currentJob as ProjectJob).jobId,
        type: "canon",
      },
      data: {
        availability: currentJob.availability ?? undefined,
        compensation: currentJob.compensation ?? undefined,
        contactUserId: currentJob.contact?.userId ?? undefined,
        description: currentJob.description ?? undefined,
        duration: currentJob.duration ?? undefined,
        location: currentJob.location ?? undefined,
        roleId: currentJob.role?.roleId ?? undefined,
      },
    });

    projectAfterTeamChanges.jobs = [
        ...projectAfterTeamChanges.jobs.filter(
          (job) =>
            (job as ProjectJob).jobId !== (currentJob as ProjectJob).jobId
        ),
        currentJob as ProjectJob,
      ]
    

    setErrorAddPosition("");
    setEditMode(false);

    updatePendingProject(projectAfterTeamChanges);
  }, [
    currentJob,
    dataManager,
    isCreatingNewPosition,
    projectAfterTeamChanges,
    updatePendingProject,
  ]);

  // --- Content variables ---
  // JSX content for viewing position details.
  const positionViewWindow = (
    projectAfterTeamChanges.jobs.length === 0 ? 
    // No positions to view
    <>
      <div className="positions-popup-info-title">
        No open positions
      </div>
    </> :
    // Positions to view
    <>
      <button
        className="edit-project-member-button"
        onClick={() => {
          setCurrentJob(getProjectJob(currentJob?.role?.roleId as number));
          setEditMode(true);
        }}
      >
        <ThemeIcon
          id={"pencil"}
          width={11}
          height={12}
          className={"gradient-color-fill edit-project-member-icon"}
          ariaLabel={"edit"}
        />
      </button>
      <div className="positions-popup-info-title">
        {currentJob?.role?.label ?? "Member"}
      </div>
      <div className="positions-popup-info-description">
        <div id="position-description-content">
          {currentJob?.description ?? ""}
        </div>
      </div>
      <div id="open-position-details">
        <div id="open-position-details-left">
          <div id="position-availability">
            <span className="position-detail-indicator">Availability: </span>
            {(currentJob && currentJob?.availability) && JobAvailabilityEnums[currentJob.availability]}
          </div>
          <div id="position-location">
            <span className="position-detail-indicator">Location: </span>
            {(currentJob && currentJob?.location) && JobLocationEnums[currentJob.location]}
          </div>
          <div id="open-position-contact">
            <span className="position-detail-indicator">Contact: </span>
            {/* FIXME: Contact is owner until change contact is implemented */}
            <div
              id="position-contact-link"
              onClick={() => {
                // Link to profile, close popup
                navigate(`${paths.routes.PROFILE}?userID=${currentJob?.contact?.userId}`);
                setOpen(false);
              }} 
            >
              <img
                className="project-member-image"
                src={
                  projectAfterTeamChanges.owner?.profileImage ?? profileImage
                }
                alt="profile picture"
                onError={(e) => {
                  // default profile picture if user image doesn't load
                  // Cannot use usePreloadedImage function because this is in a callback
                  const profileImg = e.target as HTMLImageElement;
                  profileImg.src = profileImage;
                }}
              />
              <span>{contactName}</span>
            </div>
          </div>
        </div>
        <div id="open-position-details-right">
          <div id="position-duration">
            <span className="position-detail-indicator">Duration: </span>
            {(currentJob && currentJob?.duration) && JobDurationEnums[currentJob.duration]}
          </div>
          <div id="position-compensation">
            <span className="position-detail-indicator">Compensation: </span>
            {(currentJob && currentJob?.compensation) && JobCompensationEnums[currentJob.compensation]}
          </div>
        </div>
      </div>
      <Popup>
        <PopupButton className="delete-position-button button-reset">
          <ThemeIcon
            id="trash"
            width={21}
            height={21}
            ariaLabel="Delete position"
          />
        </PopupButton>
        <PopupContent useClose={false}>
          <div id="project-team-delete-member-title">Delete Position</div>
          <div
            id="project-team-delete-member-text"
            className="project-editor-extra-info"
          >
            Are you sure you want to delete{" "}
            <span className="project-info-highlight">
              {getProjectJob(currentJob?.role?.roleId as number)?.role?.label ??
                "Member"}
            </span>{" "}
            from the project? This action cannot be undone.
          </div>
          <div className="project-editor-button-pair">
            {/* TODO: make delete button work */}
            <PopupButton
              className="delete-button"
              callback={() => deletePosition()}
            >
              Delete
            </PopupButton>
            <PopupButton buttonId="team-delete-member-cancel-button">
              Cancel
            </PopupButton>
          </div>
        </PopupContent>
      </Popup>
    </>
  );

  // JSX content for editing position details.
  const positionEditWindow = (
    <>
      <div id="edit-position-role">
        <label>Role*</label>
        <Select>
          <SelectButton
            placeholder={isCreatingNewPosition ? "Select" : ""}
            initialVal={
              isCreatingNewPosition
                ? ""
                : (allRoles.find(
                    ({ roleId }) => roleId === currentJob?.role?.roleId
                  )?.label ?? "Member")
            }
            type="input"
          />
          <SelectOptions
            callback={(e) => {
              const selectedRole = allRoles.find(
                (role) => role.label === (e.target as HTMLButtonElement).value
              );

              if (selectedRole) {
                setCurrentJob({
                  ...emptyJob,
                  ...currentJob,
                  role: {
                    ...selectedRole,
                  },
                });
              }
            }}
            options={allRoles.map((role) => {
              return {
                markup: <>{role.label}</>,
                value: role.label,
                disabled: false,
              };
            })}
          />
        </Select>
        <div id="edit-position-buttons">
          <div id="edit-position-button-pair">
            <button
              type="button"
              onClick={savePosition}
              id="position-edit-save"
            >
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
          value={currentJob?.description ?? ""}
          onChange={(e) =>
            setCurrentJob({
              ...emptyJob,
              ...currentJob,
              description: e.target.value,
            })
          }
        >
          {isCreatingNewPosition
            ? ""
            : getProjectJob(currentJob?.role?.roleId as number)?.description}
        </textarea>
      </div>

      <div id="edit-position-details">
        <div id="edit-position-details-left">
          <label className="edit-position-availability">Availability</label>
          <Select>
            <SelectButton
              placeholder="Select"
              initialVal={
                isCreatingNewPosition
                  ? ""
                  : (getProjectJob(currentJob?.role?.roleId as number) && getProjectJob(currentJob?.role?.roleId as number)?.availability)
                      ? JobAvailabilityEnums[getProjectJob(currentJob?.role?.roleId as number)!.availability!] // explicit because its checked for before
                      : ''
              }
              type="input"
            />
            <SelectOptions
              callback={(e) =>{
                const key = Object.keys(JobAvailabilityEnums).find((key) => 
                  JobAvailabilityEnums[key as keyof typeof JobAvailabilityEnums] === (e.target as HTMLButtonElement).value);

                setCurrentJob({
                  ...emptyJob,
                  ...currentJob,
                  availability: key as JobAvailability,
                })
              }
              }
              options={Object.values(JobAvailabilityEnums).map((option) => {
                return {
                  markup: <>{option}</>,
                  value: option,
                  disabled: false,
                };
              })}
            />
          </Select>
          <label className="edit-position-location">Location</label>
          <Select>
            <SelectButton
              placeholder="Select"
              initialVal={
                isCreatingNewPosition
                  ? ""
                  : (getProjectJob(currentJob?.role?.roleId as number) && getProjectJob(currentJob?.role?.roleId as number)?.location)
                      ? JobLocationEnums[getProjectJob(currentJob?.role?.roleId as number)!.location!] // explicit because its checked for before
                      : ''
              }
              type="input"
            />
            <SelectOptions
              callback={(e) => {
                const key = Object.keys(JobLocationEnums).find((key) => JobLocationEnums[key as keyof typeof JobLocationEnums] === (e.target as HTMLButtonElement).value)

                setCurrentJob({
                  ...emptyJob,
                  ...currentJob,
                  location: key as JobLocation,
                })
              }
              }
              options={Object.values(JobLocationEnums).map((option) => {
                return {
                  markup: <>{option}</>,
                  value: option,
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
              type="input"
            />
            <SelectOptions
              className="edit-position-contact"
              callback={(e) => {
                const selectedId = parseInt(
                  (e.currentTarget as HTMLButtonElement).value
                );
                setCurrentJob({
                  ...emptyJob,
                  ...currentJob,
                  contact:
                    allUsers.find(({ userId }) => userId === selectedId) ??
                    null,
                });
              }}
              options={projectAfterTeamChanges.members
                .filter((member) => member.user !== null)
                // .filter((member) => member.role?.label === "Owner") // TODO change when perms exist
                .map(({ user }) => ({
                  markup: (
                    <>
                      <img
                        className="project-member-image"
                        src={user!.profileImage ?? profileImage}
                        alt="profile"
                        title={"Profile picture"}
                        // Cannot use usePreloadedImage function because this is in a callback
                        onError={(e) => {
                          const profileImageElement =
                            e.target as HTMLImageElement;
                          profileImageElement.src = profileImage;
                        }}
                      />
                      <div className="project-editor-project-member-info">
                        <div className="project-editor-project-member-name">
                          {user!.firstName} {user!.lastName}
                        </div>
                      </div>
                    </>
                  ),
                  value: user!.userId.toString(),
                  disabled: false,
                }))}
            />
          </Select>
        </div>
        <div id="edit-position-details-right">
          <label className="edit-position-duration">Duration</label>
          <Select>
            <SelectButton
              placeholder="Select"
              initialVal={
                isCreatingNewPosition
                  ? ""
                  : (getProjectJob(currentJob?.role?.roleId as number) && getProjectJob(currentJob?.role?.roleId as number)?.duration)
                      ? JobDurationEnums[getProjectJob(currentJob?.role?.roleId as number)!.duration!] // explicit because its checked for before
                      : ''
              }
              type="input"
            />
            <SelectOptions
              callback={(e) =>{
                const key = Object.keys(JobDurationEnums).find((key) => JobDurationEnums[key as keyof typeof JobDurationEnums] === (e.target as HTMLButtonElement).value)
                
                setCurrentJob({
                  ...emptyJob,
                  ...currentJob,
                  duration: key as JobDuration,
                })
              }
              }
              options={Object.values(JobDurationEnums).map((option) => {
                return {
                  markup: <>{option}</>,
                  value: option,
                  disabled: false,
                };
              })}
            />
          </Select>
          <label className="edit-position-compensation">Compensation</label>
          <Select>
            <SelectButton
              placeholder="Select"
              initialVal={
                isCreatingNewPosition
                  ? ""
                  : (getProjectJob(currentJob?.role?.roleId as number) && getProjectJob(currentJob?.role?.roleId as number)?.compensation)
                      ? JobCompensationEnums[getProjectJob(currentJob?.role?.roleId as number)!.compensation!] // explicit because its checked for before
                      : ''
              }
              type="input"
            />
            <SelectOptions
              callback={(e) =>{
                const key = Object.keys(JobCompensationEnums).find((key) => JobCompensationEnums[key as keyof typeof JobCompensationEnums] === (e.target as HTMLButtonElement).value)
                
                setCurrentJob({
                  ...emptyJob,
                  ...currentJob,
                  compensation: key as JobCompensation,
                })
              }
              }
              options={Object.values(JobCompensationEnums).map((option) => {
                return {
                  markup: <>{option}</>,
                  value: option,
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
  const positionWindow =
    editMode === true ? positionEditWindow : positionViewWindow;

  // Renders the current team members interface with member cards and edit functionality.
  const currentTeamContent: JSX.Element = useMemo(
    () => (
      <div id="project-editor-project-members">
        {/* List out project members */}
        {projectAfterTeamChanges.members.map((member) => (
          <div
            key={member.user?.userId}
            className="project-editor-project-member"
          >
            <img
              className="project-member-image"
              src={member.user?.profileImage ?? profileImage}
              alt="profile image"
              title={"Profile picture"}
              // Cannot use usePreloadedImage function because this is in a callback
              onError={(e) => {
                const profileImg = e.target as HTMLImageElement;
                profileImg.src = profileImage;
              }}
            />
            <div className="project-editor-project-member-info">
              <div className="project-editor-project-member-name">
                {member.user?.firstName} {member.user?.lastName}
              </div>
              <div className="project-editor-project-member-role project-editor-extra-info">
                {(member.role as Role).label}
              </div>
            </div>
            {/* ALWAYS SHOW EDIT BUTTON */}
            {
              /*((m.permissions < permissions) || (modifiedProject.userId === m.userId)) && (*/
              <Popup>
                <PopupButton
                  className="edit-project-member-button"
                  callback={() => {
                    setCurrentMember(structuredClone(member));
                  }}
                >
                  <ThemeIcon
                    id={"pencil"}
                    width={11}
                    height={12}
                    className={"gradient-color-fill edit-project-member-icon"}
                    ariaLabel={"edit"}
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
                      src={member.user?.profileImage ?? profileImage}
                      alt="profile image"
                      // default profile picture if user image doesn't load
                      onError={(e) => {
                        const profileImg = e.target as HTMLImageElement;
                        profileImg.src = profileImage;
                      }}
                    />
                    <div className="project-editor-project-member-name">
                      {`${member.user?.firstName} ${member.user?.lastName}`}
                    </div>
                  </div>
                  <div id="project-team-add-member-role">
                    <label>Role</label>
                    <Select>
                      <SelectButton
                        placeholder=""
                        initialVal={member.role?.label}
                        className=""
                        type="dropdown"
                      />
                      <SelectOptions
                        callback={(e) => {
                          // get role with matching name (for id)
                          const role = allRoles.find(
                            (role) =>
                              role.label ===
                              (e.target as HTMLSelectElement).value
                          );

                          // update current member
                          setCurrentMember({
                            ...currentMember!, // on edit button click, currentMember is defined
                            role: role as Role,
                          });
                        }}
                        options={allRoles.map((role) => {
                          return {
                            markup: <>{role.label}</>,
                            value: role.label,
                            disabled: false,
                          };
                        })}
                      />
                    </Select>
                  </div>
                  {/* Action buttons */}
                  <div className="project-editor-button-pair">
                    {/* Save Button */}
                    <PopupButton
                      buttonId="team-edit-member-save-button"
                      callback={() => {
                        // TODO error messages
                        if (!currentMember) return;
                        if (isNullOrUndefined(currentMember.user)) return;

                        // update member in data manager
                        dataManager.updateMember({
                          id: {
                            type:
                              "localId" in currentMember ? "local" : "canon",
                            value: currentMember.user?.userId,
                          },
                          data: {
                            roleId: currentMember.role?.roleId,
                          },
                        });

                        // update team changes array
                        projectAfterTeamChanges.members = 
                          projectAfterTeamChanges.members.map((member) => {
                            // if this member matches the updated member
                            if (currentMember.user?.userId === member.user?.userId) {
                              // update role
                              return {
                                ...member,
                                role:
                                  currentMember.role,
                              } as PendingProjectMember;
                            } else {
                              // if it doesn't match, do nothing to the member
                              return member;
                            }
                          })
                      }}
                    >
                      Save
                    </PopupButton>

                    {/* Delete User button */}
                    <Popup>
                      <PopupButton className="delete-button">
                        Delete
                      </PopupButton>
                      <PopupContent>
                        <div id="project-team-delete-member-title">
                          Delete Member
                        </div>
                        <div
                          id="project-team-delete-member-text"
                          className="project-editor-extra-info"
                        >
                          Are you sure you want to delete{" "}
                          <span className="project-info-highlight">
                            {member.user?.firstName} {member.user?.lastName}
                          </span>{" "}
                          from the project? This action cannot be undone.
                        </div>
                        <div className="project-editor-button-pair">
                          <PopupButton
                            className="delete-button"
                            callback={() => {
                              if (!currentMember) {
                                // TODO: error message here
                                return;
                              };
                              if (isNullOrUndefined(currentMember.user)) {
                                // TODO: error message here
                                return;
                              };

                              if ("localId" in currentMember) {
                                dataManager.deleteMember({
                                  id: {
                                    type: "local",
                                    value: currentMember.user.userId,
                                  },
                                  data: null,
                                });
                              } else {
                                dataManager.deleteMember({
                                  id: {
                                    type: "canon",
                                    value: currentMember.user.userId,
                                  },
                                  data: null,
                                });
                              }
                              projectAfterTeamChanges.members =
                              projectAfterTeamChanges.members.filter(
                                    (member) =>
                                      member.user?.userId !==
                                      currentMember.user?.userId
                                  )
                                  updatePendingProject(projectAfterTeamChanges)
                            }}
                          >
                            Delete
                          </PopupButton>
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

                  {/* Cancel Edit button */}
                  <PopupButton
                    buttonId="team-edit-member-cancel-button"
                    className="button-reset"
                    callback={() => {
                      setCurrentMember(
                        projectAfterTeamChanges.members.find(
                          (member) =>
                            member.user?.userId === currentMember?.user?.userId
                        )
                      );
                    }}
                  >
                    Cancel
                  </PopupButton>
                </PopupContent>
              </Popup>
              /* ) */
            }
          </div>
        ))}
        {/* Add member button */}
        <Popup>
          <PopupButton
            buttonId="project-editor-add-member"
            callback={() => setCurrentMember(undefined)}
          >
            <ThemeIcon
              id="add-person"
              width={74}
              height={74}
              className="header-color-fill"
              ariaLabel="add member"
            />
            <div id="project-team-add-member-text">Add Member</div>
          </PopupButton>
          <PopupContent useClose={true}>
            <div id="project-team-add-member-title">Add Member</div>
            <div
              className={successAddMember ? "success" : "error"}
              id="error-add-member"
            >
              {errorAddMember}
            </div>
            <div id="project-team-add-member-info">
              <label id="project-team-add-member-name">Name</label>
              <div id="user-search-container">
                <Dropdown>
                  <DropdownButton buttonId="user-search-dropdown-button">
                    <SearchBar
                      key={searchBarKey}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      dataSets={[{ data: searchableUsers }]}
                      onSearch={(results) => {
                        handleSearch(results as UserPreview[][]);
                      }}
                    ></SearchBar>
                  </DropdownButton>
                  <DropdownContent>
                    <div id="user-search-results">
                      {searchResults.map((user, index) => (
                        <DropdownButton
                          key={user.userId}
                          className={`user-search-item
                            ${index === 0 ? "top" : ""}
                            ${index === searchResults.length - 1 ? "bottom" : ""}`}
                          callback={() =>
                            user && handleUserSelect(user as UserPreview)
                          }
                        >
                          <p className="user-search-name">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="user-search-username">
                            {user.username}
                          </p>
                        </DropdownButton>
                      ))}
                    </div>
                  </DropdownContent>
                </Dropdown>
              </div>
              <label id="project-team-add-member-role">Role</label>
              <Select key={selectKey}>
                <SelectButton placeholder="Select" initialVal="" type="input" />
                <SelectOptions
                  callback={(e) => {
                    setCurrentMember({
                      ...emptyMember,
                      ...currentMember,
                      role:
                        allRoles.find(
                          ({ label }) =>
                            label === (e.target as HTMLButtonElement).value
                        ) ?? null,
                    });
                  }}
                  options={allRoles.map(({ label }) => {
                    return {
                      markup: <>{label}</>,
                      value: label,
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
                callback={() => handleNewMember()}
                doNotClose={() => !closePopup}
              >
                Add
              </PopupButton>
              <PopupButton
                buttonId="team-add-member-cancel-button"
                callback={() => {
                  setCurrentMember(emptyMember);
                  setErrorAddMember("");
                  handlePopupReset();
                }}
                className="button-reset"
              >
                Cancel
              </PopupButton>
            </div>
          </PopupContent>
        </Popup>
      </div>
    ),
    [allRoles, closePopup, currentMember, dataManager, errorAddMember, updatePendingProject, handleNewMember, projectAfterTeamChanges, handleSearch, handleUserSelect, searchBarKey, searchQuery, searchResults, searchableUsers, selectKey, successAddMember]
  );
  // Renders the open positions interface with job listings and position editing functionality.
  const openPositionsContent: JSX.Element = useMemo(
    () => (
      <div id="project-team-open-positions-popup">
        <div className="positions-popup-list">
          <div id="team-positions-popup-list-header">Open Positions</div>
          <div id="team-positions-popup-list-buttons">
            {projectAfterTeamChanges.jobs?.map((job) => (
              <div
                key={
                  "jobId" in job ? job.jobId + "-canon" : job.localId + "-local"
                }
                className="team-positions-button"
              >
                <img src="/images/icons/drag.png" alt="positions" />
                <button
                  className="positions-popup-list-item"
                  data-id={"jobId" in job ? job.jobId : job.localId}
                  data-id-type={"jobId" in job ? "canon" : "local"}
                  onClick={() => {
                    if (!editMode) {
                      setCurrentJob(job);
                    }
                  }}
                >
                  {job.role?.label ?? "Member"}
                </button>
              </div>
            ))}
            <div className="add-item-button">
              <button
                onClick={() => {
                  if (!editMode) {
                    setIsCreatingNewPosition(true);
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
        <div
          className="positions-popup-info"
          id={editMode ? "positions-popup-list-edit" : ""}
        >
          {/* {positionWindowContent} */}
          {positionWindow}
        </div>
      </div>
    ),
    [
      addPositionCallback,
      editMode,
      positionWindow,
      projectAfterTeamChanges.jobs,
    ]
  );

  // Set content depending on what tab is selected
  const teamTabContent =
    currentTeamTab === 0 ? (
      currentTeamContent
    ) : currentTeamTab === 1 ? (
      openPositionsContent
    ) : (
      <></>
    );

  // --- Complete component ---
  return (
    <div id="project-editor-team">
      <div id="project-editor-team-tabs">
        <button
          onClick={() => {
            setCurrentTeamTab(0); /*setTeamTabContent(currentTeamContent);*/
          }}
          className={`button-reset project-editor-team-tab ${currentTeamTab === 0 ? "team-tab-active" : ""}`}
        >
          Current Team
        </button>
        <button
          onClick={() => {
            setCurrentTeamTab(1); /*setTeamTabContent(openPositionsContent);*/
          }}
          className={`button-reset project-editor-team-tab ${currentTeamTab === 1 ? "team-tab-active" : ""}`}
        >
          Open Positions
        </button>
      </div>

      <div id="project-editor-team-content">{teamTabContent}</div>

      <div id="team-save-info">
       <Popup>
        <PopupButton
          buttonId="project-editor-save"
          doNotClose={() => failCheck}
        >
          Save Changes
        </PopupButton>
          <PopupContent useClose={false}>
            <div id="confirm-editor-save-text">Are you sure you want to save all changes?</div>
          <div id="confirm-editor-save">
         <PopupButton callback={saveProject} closeParent={closeOuterPopup} buttonId="project-editor-save">
           Confirm
         </PopupButton>
         <PopupButton buttonId="team-edit-member-cancel-button" >
           Cancel
         </PopupButton>
         </div>
          </PopupContent>
      </Popup>
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
//         setCurrentJob(getProjectJob(currentlyViewedJobId));
//         setPositionWindowContent(positionEditWindow);
//         setEditMode(true);
//       }}
//     >
//       <img className="edit-project-member-icon" src="/images/icons/pencil.png" alt="" />
//     </button>
//     <div className="positions-popup-info-title">{getProjectJob(currentlyViewedJobId).jobTitle}</div>
//     <div className="positions-popup-info-description">
//       <div id="position-description-content">{getProjectJob(currentlyViewedJobId).description}</div>
//     </div>
//     <div id="open-position-details">
//       <div id="open-position-details-left">
//         <div id="position-availability">
//           <span className="position-detail-indicator">Availability: </span>
//           {getProjectJob(currentlyViewedJobId).availability}
//         </div>
//         <div id="position-location">
//           <span className="position-detail-indicator">Location: </span>
//           {getProjectJob(currentlyViewedJobId).location}
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
//           {getProjectJob(currentlyViewedJobId).duration}
//         </div>
//         <div id="position-compensation">
//           <span className="position-detail-indicator">Compensation: </span>
//           {getProjectJob(currentlyViewedJobId).compensation}
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
//             {getProjectJob(currentlyViewedJobId).jobTitle}
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
// ), [currentlyViewedJobId, deletePosition, getProjectJob, positionEditWindow]);
// const positionEditWindow = useMemo(() => (
//   <>
//     <div id="edit-position-role">
//       {/* TODO: add place for error message (setErrorAddPosition) */}
//       <label>Role*</label>
//       <select
//         key={currentlyViewedJobId}
//         onChange={(e) => {
//           const selectedRole = allRoles.find((j) => j.label === e.target.value);
//           if (selectedRole)
//             setCurrentJob({
//               ...currentJob,
//               titleId: selectedRole.titleId,
//               jobTitle: selectedRole.label,
//             });
//         }}
//       >
//         <option disabled selected={isCreatingNewPosition}>
//           Select
//         </option>
//         {allRoles.map((job: { titleId: number; label: string }) => (
//           <option
//             key={job.titleId}
//             selected={isCreatingNewPosition ? false : job.titleId === currentlyViewedJobId}
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
//         {isCreatingNewPosition ? '' : getProjectJob(currentlyViewedJobId).description}
//       </textarea>
//     </div>

//     <div id="edit-position-details">
//       <div id="edit-position-details-left">
//         <label className="edit-position-availability">Availability</label>
//         <select
//           className="edit-position-availability"
//           onChange={(e) => setCurrentJob({ ...currentJob, availability: e.target.value })}
//         >
//           <option disabled selected={isCreatingNewPosition}>
//             Select
//           </option>
//           {availabilityOptions.map((o) => (
//             <option
//               key={o}
//               selected={isCreatingNewPosition ? false : getProjectJob(currentlyViewedJobId).availability === o}
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
//           <option disabled selected={isCreatingNewPosition}>
//             Select
//           </option>
//           {locationOptions.map((o) => (
//             <option
//               selected={isCreatingNewPosition ? false : getProjectJob(currentlyViewedJobId).location === o}
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
//           <option disabled selected={isCreatingNewPosition}>
//             Select
//           </option>
//           {durationOptions.map((o) => (
//             <option
//               selected={isCreatingNewPosition ? false : getProjectJob(currentlyViewedJobId).duration === o}
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
//           <option disabled selected={isCreatingNewPosition}>
//             Select
//           </option>
//           {compensationOptions.map((o) => (
//             <option
//               selected={isCreatingNewPosition ? false : getProjectJob(currentlyViewedJobId).compensation === o}
//             >
//               {o}
//             </option>
//           ))}
//         </select>
//       </div>
//     </div>
//   </>
// ), [addPositionCallback, allRoles, currentJob, currentlyViewedJobId, errorAddPosition, getProjectJob, modifiedProject, isCreatingNewPosition, savePosition]);
