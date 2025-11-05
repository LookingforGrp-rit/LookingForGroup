// --- Imports ---
import { JSX, useCallback, useEffect, useMemo, useState } from "react";
import { Popup, PopupButton, PopupContent } from "../../Popup";
import profileImage from "../../../images/blue_frog.png";
import { SearchBar } from "../../SearchBar";
import { Dropdown, DropdownButton, DropdownContent } from "../../Dropdown";
import { ThemeIcon } from "../../ThemeIcon";
import { Select, SelectButton, SelectOptions } from "../../Select";
import {
  getJobTitles,
  getUsers,
  getUsersById,
  getUserByUsername,
} from "../../../api/users";
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
  Role,
  CreateProjectJobInput,
  CreateProjectMemberInput,
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

// --- Variables ---
// Default project value
const emptyMember: PendingProjectMember = {
  user: null,
  role: null,
  localId: null,
};

type UserSearchableFields = Pick<
  UserPreview,
  "firstName" | "lastName" | "username"
>;

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
  setProjectData: (data: ProjectDetail) => void;
  setErrorMember: (error: string) => void;
  setErrorPosition: (error: string) => void;
  // permissions: number;
  saveProject: () => void;
  updatePendingProject: (updatedPendingProject: PendingProject) => void;
  failCheck: boolean;
};

// --- Component ---
export const TeamTab = ({
  dataManager,
  projectData,
  setProjectData,
  setErrorMember,
  setErrorPosition,
  /*permissions,*/
  saveProject,
  updatePendingProject,
  failCheck,
}: TeamTabProps) => {
  // --- Hooks ---
  // for complete list of...
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [allUsers, setAllUsers] = useState<UserPreview[]>([]);
  const [searchableUsers, setSearchableUsers] = useState<
    UserSearchableFields[]
  >([]);

  // tracking team changes
  const [projectAfterTeamChanges, setProjectAfterTeamChanges] =
    useState<PendingProject>(structuredClone(projectData));

  // HTML contents (needed if using commented out block at end of file)
  // const [teamTabContent, setTeamTabContent] = useState(<></>);
  // const [positionWindowContent, setPositionWindowContent] = useState(<></>);

  // tracking which team tab is currently being viewed: 0 - current team, 1 - open positions
  const [currentTeamTab, setCurrentTeamTab] = useState(0);

  // tracking which role is being viewed out of all open positions: value is project jobId
  // TODO: merge functionality with currentlyEditingJob
  const [currentlyViewedJobId, setCurrentlyViewedJobId] = useState(0);

  // tracking edits for...
  const [currentMember, setCurrentMember] = useState<
    ProjectMember | PendingProjectMember
  >();
  const [currentlyEditingJob, setCurrentlyEditingJob] = useState<
    ProjectJob | Pending<ProjectJob>
  >();

  // tracking whether position view is in edit mode or not
  const [editMode, setEditMode] = useState(false);

  // tracking if the user is making a new position (after pressing Add Position button)
  const [isCreatingNewPosition, setIsCreatingNewPosition] = useState(false);

  // determine if a popup should close after press (PopupButton)
  const [closePopup, setClosePopup] = useState(false);

  // store search results
  const [searchResults, setSearchResults] = useState<Partial<UserPreview>[]>(
    []
  );

  // errors/successful messages
  const [errorAddMember, setErrorAddMember] = useState("");
  const [errorAddPosition, setErrorAddPosition] = useState("");
  const [successAddMember, setSuccessAddMember] = useState(false);

  // tracking search input & dropdown selections
  const [searchQuery, setSearchQuery] = useState("");
  const [searchBarKey, setSearchBarKey] = useState(0);
  const [selectKey, setSelectKey] = useState(0);
  // const [permissionSelectKey, setPermissionSelectKey] = useState(0);

  // check if a value is null or undefined
  const isNullOrUndefined = (value: unknown | null | undefined) => {
    return value === null || value === undefined;
  };

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
        // if (!currentlyEditingJob) setCurrentlyEditingJob({ ...emptyJob });
      }
    };
    if (allRoles.length === 0) {
      getRolesList();
    }
  }, [allRoles, currentlyEditingJob]);

  // Get user list if allUsers is empty
  useEffect(() => {
    const getUsersList = async () => {
      try {
        const response = await getUsers();

        if (response.data) setAllUsers(response.data);

        // FIXME why is this async?
        // list of users to search. users searchable by first name, last name, or username
        const searchableUsers = (await Promise.all(
          response.data!.map(async (user: UserPreview) => {
            // get make searchable user
            const filteredUser = {
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
            };
            return filteredUser;
          })
        )) as UserSearchableFields[];

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
    const assigningButton = document.querySelector(
      `button[data-id="${currentlyViewedJobId}"]`
    );
    if (assigningButton) {
      // remove id of old button
      const oldButton = document.querySelector("#team-positions-active-button");
      if (oldButton) {
        oldButton.id = "";
      }
      assigningButton.id = "team-positions-active-button";
      return;
    }

    // neither button present, assign default
    const buttonDiv = document.querySelector(".team-positions-button");

    if (buttonDiv && buttonDiv.querySelector("button")) {
      const defaultButton = buttonDiv.querySelector("button");
      defaultButton!.id = "team-positions-active-button"; // explicit because check is passed in the if statement
      setCurrentlyViewedJobId(Number(defaultButton!.dataset.id));
    }
  }, [currentlyViewedJobId, isTeamTabOpen]);

  // --- Data retrieval ---
  // Get project job info using role id to compare
  const getProjectJob = useCallback(
    (id: number) => {
      // return projectAfterTeamChanges.jobs.find(
      //   (job) => job.role?.roleId === roleId
      // );

      return projectAfterTeamChanges.jobs.find(
        (job: ProjectJob | Pending<ProjectJob>) =>
          ("jobId" in job && (job as ProjectJob).jobId === id) ||
          ("localId" in job && (job as Pending<ProjectJob>).localId === id)
      );
    },
    [projectAfterTeamChanges.jobs]
  );

  // --- Member handlers ---
  // Error checks for adding a new member
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
        setErrorAddMember("Select a role"); // TODO could also just default to Member role
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
        // FIXME why is this set as an error
        `${currentMember.user.firstName} ${currentMember.user.lastName} added to team!`
      );

      // FIXME what is the delay for?
      // reset prompt to clear
      setTimeout(() => {
        setErrorAddMember("");
        setSuccessAddMember(false);
      }, 2000);

      // close popup
      setClosePopup(true);
      // add member

      const thisMemberLocalId = ++localIdIncrement;

      dataManager.createMember({
        id: {
          value: thisMemberLocalId,
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
        localId: thisMemberLocalId,
      };

      setProjectAfterTeamChanges((previous) => ({
        ...previous,
        members: [...previous.members, localProjectMember],
      }));

      setCurrentMember(emptyMember);
      resetFields();
      return true;
    }
  }, [allRoles, allUsers, currentMember, dataManager]);

  // Handle search results
  // FIXME does this need to be a 2D array?
  const handleSearch = useCallback((results: Partial<UserPreview>[][]) => {
    // Update search results only if a change has been made
    if (JSON.stringify(searchResults) !== JSON.stringify(results[0])) {
      setSearchResults(results[0]);
    }
  }, [searchResults]);

  // Handle clicking on a member in the search dropdown
  const handleUserSelect = useCallback(
    async (selectedUser: UserPreview) => {
      // reset error
      setErrorAddMember("");

      // set text input
      setSearchQuery(
        `${selectedUser.firstName} ${selectedUser.lastName} (${selectedUser.username})`
      );

      // get matching user data from user id
      const matchedUser = allUsers.find(
        (user) => user.userId === selectedUser.userId
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
    [allUsers, currentMember]
  );

  // Resets Add Member name field, role/permission dropdowns
  const handlePopupReset = () => {
    setSearchQuery("");
    setSearchBarKey((previous) => previous + 1);
    setSelectKey((previous) => previous + 1);
    setClosePopup(false);
  };

  // --- Position handlers ---
  // update position edit window for creating a new position
  const addPositionCallback = useCallback(() => {
    // going back to previousious state (cancel button)
    if (isCreatingNewPosition || editMode) {
      // we are no longer creating a new position
      setIsCreatingNewPosition(false);
      // reset the pending job
      setCurrentlyEditingJob({ ...emptyJob });
      // return to selected role
      const positions = document.querySelectorAll(".positions-popup-list-item");
      for (const p of positions) {
        const dataId = p.getAttribute("data-id");
        if (dataId && parseInt(dataId) === currentlyViewedJobId) {
          // found matching id, set element as active
          p.id = "team-positions-active-button";
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
      setIsCreatingNewPosition(true);
      // clear selected role
      setCurrentlyEditingJob({ ...emptyJob });
      const activePosition = document.querySelector(
        "#team-positions-active-button"
      );
      if (activePosition) activePosition.id = "";
      // change to position edit window
      // setPositionWindowContent(positionEditWindow);
      setEditMode(true);
    }
    setErrorAddPosition("");
  }, [currentlyViewedJobId, editMode, isCreatingNewPosition]);

  // Remove position listing
  const deletePosition = useCallback(() => {
    const jobToBeDeleted = projectAfterTeamChanges.jobs.find(
      (job) =>
        (job as ProjectJob).jobId === currentlyViewedJobId ||
        (job as Pending<ProjectJob>).localId === currentlyViewedJobId
    );
    if (
      jobToBeDeleted &&
      ((jobToBeDeleted as ProjectJob).jobId ||
        (jobToBeDeleted as Pending<ProjectJob>).localId)
    ) {
      if ("jobId" in jobToBeDeleted) {
        dataManager.deleteJob({
          id: {
            type: "canon",
            value: jobToBeDeleted.jobId,
          },
          data: null,
        });
      } else {
        dataManager.deleteJob({
          id: {
            type: "local",
            value: jobToBeDeleted.localId!,
          },
          data: null,
        });
      }

      setProjectAfterTeamChanges((previous) => ({
        ...previous,
        jobs: [
          ...previous.jobs.filter(
            (job) =>
              !(
                (job as ProjectJob).jobId === currentlyViewedJobId &&
                (job as Pending<ProjectJob>).localId === currentlyViewedJobId
              )
          ),
        ],
      }));

      updatePendingProject(projectAfterTeamChanges);
    }

    // filter out position
    // const updatedJobs = projectAfterTeamChanges.jobs.filter(
    //   ({ role: { roleId } }) => roleId !== currentlyViewedJobId
    // );

    // update jobs
    // setModifiedProject({ ...modifiedProject, jobs: updatedJobs });

    // reset current position
    const buttonDiv = document.querySelector(".team-positions-button");
    if (buttonDiv && buttonDiv.querySelector("button")) {
      const defaultButton = buttonDiv.querySelector("button");
      defaultButton!.id = "team-positions-active-button"; // explicit because check is passed in the if statement
      setCurrentlyViewedJobId(Number(defaultButton!.dataset.id));
    }
  }, [
    currentlyViewedJobId,
    dataManager,
    projectAfterTeamChanges,
    updatePendingProject,
  ]);

  //Save current inputs in position editing window
  const savePosition = useCallback(() => {
    if (!currentlyEditingJob) {
      setErrorAddPosition("No job to save!");
      return;
    }

    // job hasn't been created yet, this is a new job
    if (isCreatingNewPosition) {
      if (
        isNullOrUndefined(currentlyEditingJob.role?.roleId) ||
        isNullOrUndefined(currentlyEditingJob.availability) ||
        isNullOrUndefined(currentlyEditingJob.location) ||
        isNullOrUndefined(currentlyEditingJob.duration) ||
        isNullOrUndefined(currentlyEditingJob.compensation) ||
        isNullOrUndefined(currentlyEditingJob.contact?.userId)
      ) {
        // set error
        setErrorAddPosition("All fields are required");
        console.log(currentlyEditingJob);
        return;
      }

      const localId = ++localIdIncrement;

      dataManager.createJob({
        id: {
          value: localId,
          type: "local",
        },
        data: {
          availability: currentlyEditingJob.availability,
          compensation: currentlyEditingJob.compensation,
          contactUserId: currentlyEditingJob.contact.userId,
          duration: currentlyEditingJob.duration,
          location: currentlyEditingJob.location,
          roleId: currentlyEditingJob.role.roleId,
          description: currentlyEditingJob.description ?? undefined,
        },
      });

      setProjectAfterTeamChanges((previous) => ({
        ...previous,
        jobs: [
          ...previous.jobs,
          {
            localId,
            availability: currentlyEditingJob.availability,
            compensation: currentlyEditingJob.compensation,
            contact: currentlyEditingJob.contact,
            description: currentlyEditingJob.description ?? "",
            duration: currentlyEditingJob.duration,
            location: currentlyEditingJob.location,
            role: currentlyEditingJob.role,
          },
        ],
      }));

      updatePendingProject(projectAfterTeamChanges);

      setCurrentlyViewedJobId(localId);

      return;
    }

    dataManager.updateJob({
      id: {
        value: (currentlyEditingJob as ProjectJob).jobId,
        type: "canon",
      },
      data: {
        availability: currentlyEditingJob.availability ?? undefined,
        compensation: currentlyEditingJob.compensation ?? undefined,
        contactUserId: currentlyEditingJob.contact?.userId ?? undefined,
        description: currentlyEditingJob.description ?? undefined,
        duration: currentlyEditingJob.duration ?? undefined,
        location: currentlyEditingJob.location ?? undefined,
        roleId: currentlyEditingJob.role?.roleId ?? undefined,
      },
    });

    setProjectAfterTeamChanges((previous) => ({
      ...previous,
      jobs: [
        ...previous.jobs.filter(
          (job) =>
            (job as ProjectJob).jobId !==
            (currentlyEditingJob as ProjectJob).jobId
        ),
        {
          jobId: (currentlyEditingJob as ProjectJob).jobId,
          availability: (currentlyEditingJob as ProjectJob).availability,
          compensation: (currentlyEditingJob as ProjectJob).compensation,
          contact: (currentlyEditingJob as ProjectJob).contact,
          description: (currentlyEditingJob as ProjectJob).description ?? "",
          duration: (currentlyEditingJob as ProjectJob).duration,
          location: (currentlyEditingJob as ProjectJob).location,
          role: (currentlyEditingJob as ProjectJob).role,
          apiUrl: (currentlyEditingJob as ProjectJob).apiUrl,
          createdAt: (currentlyEditingJob as ProjectJob).createdAt,
          updatedAt: (currentlyEditingJob as ProjectJob).updatedAt,
        },
      ],
    }));

    updatePendingProject(projectAfterTeamChanges);

    setCurrentlyViewedJobId((currentlyEditingJob as ProjectJob).jobId);

    // // check if same position is present
    // // TODO projects can't have two leads? two devs? two artists? etc..
    // const existingJob = projectAfterTeamChanges.jobs.find(
    //   (job) =>
    //     job.role.roleId === currentlyEditingJob?.roleId && job.jobId !== currentlyEditingJob.jobId
    // );
    // if (existingJob) {
    //   setErrorAddPosition("Job already exists");
    //   return;
    // }

    // if new position, add to job list
    // if (isCreatingNewPosition) {
    //   // setModifiedProject({
    //   //   ...modifiedProject,
    //   //   jobs: [...modifiedProject.jobs, currentlyEditingJob],
    //   // });
    // } else {
    //   // find matching position
    //   const updatedJobs = projectAfterTeamChanges.jobs.map((j) =>
    //     j.jobId === currentlyEditingJob.jobId ? { ...j, ...currentlyEditingJob } : j
    //   );
    // setModifiedProject({ ...modifiedProject, jobs: updatedJobs });
    // }
    setErrorAddPosition("");
    setIsCreatingNewPosition(false);
    // setPositionWindowContent(positionViewWindow);
    setEditMode(false);

    // set current position to saved position
    // setCurrentlyViewedJobId((currentlyEditingJob as ProjectJob).jobId || (currentlyEditingJob as Pending<ProjectJob>).localId);
  }, [
    currentlyEditingJob,
    dataManager,
    isCreatingNewPosition,
    projectAfterTeamChanges,
    updatePendingProject,
  ]);

  // --- Content variables ---
  // Open position display
  const positionViewWindow = (
    <>
      <button
        className="edit-project-member-button"
        onClick={() => {
          setCurrentlyEditingJob(
            getProjectJob(currentlyEditingJob?.role?.roleId as number)
          );
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
        {getProjectJob(currentlyEditingJob?.role?.roleId as number)?.role
          ?.label ?? "Member"}
      </div>
      <div className="positions-popup-info-description">
        <div id="position-description-content">
          {getProjectJob(currentlyEditingJob?.role?.roleId as number)
            ?.description ?? ""}
        </div>
      </div>
      <div id="open-position-details">
        <div id="open-position-details-left">
          <div id="position-availability">
            <span className="position-detail-indicator">Availability: </span>
            {
              getProjectJob(currentlyEditingJob?.role?.roleId as number)
                ?.availability
            }
          </div>
          <div id="position-location">
            <span className="position-detail-indicator">Location: </span>
            {
              getProjectJob(currentlyEditingJob?.role?.roleId as number)
                ?.location
            }
          </div>
          <div id="open-position-contact">
            <span className="position-detail-indicator">Contact: </span>
            {/* FIXME: Contact is owner until change contact is implemented */}
            <div
              id="position-contact-link"
              onClick={() => {}} // TODO: link to owner's profile
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
              {projectAfterTeamChanges.owner?.firstName}{" "}
              {projectAfterTeamChanges.owner?.lastName}
            </div>
          </div>
        </div>
        <div id="open-position-details-right">
          <div id="position-duration">
            <span className="position-detail-indicator">Duration: </span>
            {
              getProjectJob(currentlyEditingJob?.role?.roleId as number)
                ?.duration
            }
          </div>
          <div id="position-compensation">
            <span className="position-detail-indicator">Compensation: </span>
            {
              getProjectJob(currentlyEditingJob?.role?.roleId as number)
                ?.compensation
            }
          </div>
        </div>
      </div>
      <Popup>
        <PopupButton className="delete-position-button button-reset">
          <img src="/images/icons/delete-red.svg" alt="trash can" />
        </PopupButton>
        <PopupContent useClose={false}>
          <div id="project-team-delete-member-title">Delete Position</div>
          <div
            id="project-team-delete-member-text"
            className="project-editor-extra-info"
          >
            Are you sure you want to delete{" "}
            <span className="project-info-highlight">
              {getProjectJob(currentlyEditingJob?.role?.roleId as number)?.role
                ?.label ?? "Member"}
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

  // Find selected members
  const selectedMember = projectAfterTeamChanges.members.find(
    ({ user }) => user?.userId === projectAfterTeamChanges.owner?.userId
  );

  // Edit open position or creating new position
  const positionEditWindow = (
    <>
      <div id="edit-position-role">
        <label>Role*</label>
        {/* <select
          key={currentlyViewedJobId}
          onChange={(e) => {
            const selectedRole = allRoles.find((j) => j.label === e.target.value);
            if (selectedRole)
              setCurrentlyEditingJob({
                ...currentlyEditingJob,
                titleId: selectedRole.titleId,
                jobTitle: selectedRole.label,
              });
          }}
        >
          <option disabled selected={isCreatingNewPosition}>
            Select
          </option>
          {allRoles.map((job: { titleId: number; label: string }) => (
            <option
              key={job.titleId}
              selected={isCreatingNewPosition ? false : job.titleId === currentlyViewedJobId}
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
            placeholder={isCreatingNewPosition ? "Select" : ""}
            initialVal={
              isCreatingNewPosition
                ? ""
                : (allRoles.find(
                    ({ roleId }) => roleId === currentlyViewedJobId // FIXME this doesn't work and can't until currentlyViewed and currentlyEditing are merged
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
                setCurrentlyEditingJob({
                  ...emptyJob,
                  ...currentlyEditingJob,
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
          value={currentlyEditingJob?.description ?? ""}
          onChange={(e) =>
            setCurrentlyEditingJob({
              ...emptyJob,
              ...currentlyEditingJob,
              description: e.target.value,
            })
          }
        >
          {isCreatingNewPosition
            ? ""
            : getProjectJob(currentlyEditingJob?.role?.roleId as number)
                ?.description}
        </textarea>
      </div>

      <div id="edit-position-details">
        <div id="edit-position-details-left">
          <label className="edit-position-availability">Availability</label>
          {/* <select
            className="edit-position-availability"
            onChange={(e) => setCurrentlyEditingJob({ ...currentlyEditingJob, availability: e.target.value })}
          >
            <option disabled selected={isCreatingNewPosition}>
              Select
            </option>
            {availabilityOptions.map((o) => (
              <option
                key={o}
                selected={getProjectJob(currentlyViewedJobId)?.availability === o}
              >
                {o}
              </option>
            ))}
          </select> */}
          <Select>
            <SelectButton
              placeholder="Select"
              initialVal={
                isCreatingNewPosition
                  ? ""
                  : (getProjectJob(currentlyEditingJob?.role?.roleId as number)
                      ?.availability ?? "")
              }
              type="input"
            />
            <SelectOptions
              callback={(e) =>
                setCurrentlyEditingJob({
                  ...emptyJob,
                  ...currentlyEditingJob,
                  availability: (e.target as HTMLButtonElement)
                    .value as JobAvailability,
                })
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
          {/* <select
            className="edit-position-location"
            onChange={(e) => setCurrentlyEditingJob({ ...currentlyEditingJob, location: e.target.value })}
          >
            <option disabled selected={isCreatingNewPosition}>
              Select
            </option>
            {locationOptions.map((o) => (
              <option
                selected={getProjectJob(currentlyViewedJobId)?.location === o}
              >
                {o}
              </option>
            ))}
          </select> */}
          <Select>
            <SelectButton
              placeholder="Select"
              initialVal={
                isCreatingNewPosition
                  ? ""
                  : (getProjectJob(currentlyEditingJob?.role?.roleId as number)
                      ?.location ?? "")
              }
              type="input"
            />
            <SelectOptions
              callback={(e) =>
                setCurrentlyEditingJob({
                  ...emptyJob,
                  ...currentlyEditingJob,
                  location: (e.target as HTMLButtonElement)
                    .value as JobLocation,
                })
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
              initialVal={
                selectedMember?.user
                  ? `${selectedMember.user.firstName} ${selectedMember.user.lastName}`
                  : ""
              }
              type="input"
            />
            <SelectOptions
              className="edit-position-contact"
              callback={(e) => {
                const selectedId = parseInt(
                  (e.target as HTMLButtonElement).value
                );
                setCurrentlyEditingJob({
                  ...emptyJob,
                  ...currentlyEditingJob,
                  contact:
                    allUsers.find(({ userId }) => userId === selectedId) ??
                    null,
                });
              }}
              options={projectAfterTeamChanges.members
                .filter((member) => member.user !== null)
                .filter((member) => member.role.label === "Owner") // TODO change when perms exist
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
          {/* <select
            className="edit-position-duration"
            onChange={(e) => setCurrentlyEditingJob({ ...currentlyEditingJob, duration: e.target.value })}
          >
            <option disabled selected={isCreatingNewPosition}>
              Select
            </option>
            {durationOptions.map((o) => (
              <option
                selected={getProjectJob(currentlyViewedJobId)?.duration === o}
              >
                {o}
              </option>
            ))}
          </select> */}
          <Select>
            <SelectButton
              placeholder="Select"
              initialVal={
                isCreatingNewPosition
                  ? ""
                  : (getProjectJob(currentlyEditingJob?.role?.roleId as number)
                      ?.duration ?? "")
              }
              type="input"
            />
            <SelectOptions
              callback={(e) =>
                setCurrentlyEditingJob({
                  ...emptyJob,
                  ...currentlyEditingJob,
                  duration: (e.target as HTMLButtonElement)
                    .value as JobDuration,
                })
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
          {/* <select
            className="edit-position-compensation"
            onChange={(e) => setCurrentlyEditingJob({ ...currentlyEditingJob, compensation: e.target.value })}
          >
            <option disabled selected={isCreatingNewPosition}>
              Select
            </option>
            {compensationOptions.map((o) => (
              <option
                selected={isCreatingNewPosition ? false : getProjectJob(currentlyViewedJobId)?.compensation === o}
              >
                {o}
              </option>
            ))}
          </select> */}
          <Select>
            <SelectButton
              placeholder="Select"
              initialVal={
                isCreatingNewPosition
                  ? ""
                  : (getProjectJob(currentlyEditingJob?.role?.roleId as number)
                      ?.compensation ?? "")
              }
              type="input"
            />
            <SelectOptions
              callback={(e) =>
                setCurrentlyEditingJob({
                  ...emptyJob,
                  ...currentlyEditingJob,
                  compensation: (e.target as HTMLButtonElement)
                    .value as JobCompensation,
                })
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

  // teamTabContent is one of these
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
                {/* TODO add current user */}
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
                        initialVal={member.role.label}
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

                          console.log("current member updated", currentMember);
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
                            roleId: currentMember.role.roleId,
                          },
                        });

                        // update team changes array
                        setProjectAfterTeamChanges((previous) => ({
                          ...previous,
                          members: previous.members.map((member) => {
                            // if this member matches the updated member
                            if (
                              currentMember.user?.userId === member.user?.userId
                            ) {
                              // update role
                              return {
                                ...member,
                                role:
                                  currentMember.role ??
                                  allRoles.find(
                                    (role) => role.label === "Member"
                                  ),
                              };
                            } else {
                              // if it doesn't match, do nothing to the member
                              return member;
                            }
                          }),
                        }));
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
                          <button
                            className="delete-button"
                            onClick={() => {
                              // TODO error messages
                              if (!currentMember) return;
                              if (isNullOrUndefined(currentMember.user)) return;

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
                            }}
                          >
                            Delete
                          </button>
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
            callback={() => {
              setCurrentMember({ ...emptyMember });
            }}
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
                      dataSets={ [{ data: searchableUsers }] }
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
                doNotClose={(previous) => !previous}
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
    [
      allRoles,
      currentMember,
      dataManager,
      errorAddMember,
      handleNewMember,
      handleSearch,
      handleUserSelect,
      projectAfterTeamChanges.members,
      searchBarKey,
      searchQuery,
      searchResults,
      searchableUsers,
      selectKey,
      successAddMember,
    ]
  );
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
                  id=""
                  data-id={"jobId" in job ? job.jobId : job.localId}
                  onClick={() => {
                    if (!editMode) {
                      if ("jobId" in job) setCurrentlyViewedJobId(job.jobId);
                      else setCurrentlyViewedJobId(job.localId!);
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
        <PopupButton
          buttonId="project-editor-save"
          callback={saveProject}
          doNotClose={() => failCheck}
        >
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
//         setCurrentlyEditingJob(getProjectJob(currentlyViewedJobId));
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
//             setCurrentlyEditingJob({
//               ...currentlyEditingJob,
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
//         onChange={(e) => setCurrentlyEditingJob({ ...currentlyEditingJob, description: e.target.value })}
//       >
//         {isCreatingNewPosition ? '' : getProjectJob(currentlyViewedJobId).description}
//       </textarea>
//     </div>

//     <div id="edit-position-details">
//       <div id="edit-position-details-left">
//         <label className="edit-position-availability">Availability</label>
//         <select
//           className="edit-position-availability"
//           onChange={(e) => setCurrentlyEditingJob({ ...currentlyEditingJob, availability: e.target.value })}
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
//           onChange={(e) => setCurrentlyEditingJob({ ...currentlyEditingJob, location: e.target.value })}
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
//           onChange={(e) => setCurrentlyEditingJob({ ...currentlyEditingJob, duration: e.target.value })}
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
//           onChange={(e) => setCurrentlyEditingJob({ ...currentlyEditingJob, compensation: e.target.value })}
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
// ), [addPositionCallback, allRoles, currentlyEditingJob, currentlyViewedJobId, errorAddPosition, getProjectJob, modifiedProject, isCreatingNewPosition, savePosition]);
