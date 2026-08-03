// --- Imports ---
import {
	JSX,
	useCallback,
	useEffect,
	useMemo,
	useState,
	useContext
} from "react";
import { useNavigate } from "react-router-dom";
import { Popup, PopupButton, PopupContent, PopupContext } from "../../Popup";
import { DeleteProjectButton } from "../DeleteProjectButton";
import { MergeProjectTeam } from "./MergeProjectTeam";
import profileImage from "../../../images/lfrog.png";
import { SearchBar } from "../../SearchBar";
import { Dropdown, DropdownButton, DropdownContent } from "../../Dropdown";
import { ThemeIcon } from "../../ThemeIcon";
import { Select, SelectButton, SelectOptions } from "../../Select";
// import { Tag as TagElement } from "../../Tag";
// import { SkillsTab } from "../../Profile/tabs/SkillsTab";
import {
	getJobTitles,
	getUsers,
	getUsersById,
	getCurrentAccount
} from "../../../api/users";
import {
	getMemberRequestByProjectID,
	changeOwner,
} from "../../../api/projects"
import {
	ProjectJob,
	UserPreview,
	ProjectMember,
	JobAvailability,
	JobLocation,
	JobCompensation,
	Role,
	ProjectWithFollowers,
	MemberRequests,
	JobSkill,
} from "@looking-for-group/shared";
import {
	JobAvailability as JobAvailabilityEnums,
	JobLocation as JobLocationEnums,
	JobCompensation as JobCompensationEnums,
} from "@looking-for-group/shared/enums";
import {
	Fillable,
	Pending,
	PendingProject,
	PendingProjectMember
} from "@looking-for-group/client";
import { projectDataManager } from "../../../api/data-managers/project-data-manager";
//import { current } from "../../../../../node_modules/@reduxjs/toolkit/dist/index";
import * as paths from "../../../constants/routes";
import { JobSkillPopup } from "./JobSkillPopup";
// --- Variables ---
// Default project value
//wait why are the placeholders still here

// Empty member object template used when adding new members.
const emptyMember: PendingProjectMember = {
	user: null,
	role: null,
	localId: null
};

type UserSearchableFields = Pick<
	UserPreview,
	"firstName" | "lastName" | "username"
>;

// Empty job position template used when creating new positions.
const emptyJob: Fillable<Pending<ProjectJob>> = {
	availability: null,
	compensation: null,
	contact: null,
	description: "",
	jobStart: null,
	jobEnd: null,
	localId: null,
	location: null,
	role: null,
	jobSkills: []
};

let localIdIncrement = 0;

type TeamTabProps = {
	dataManager?: Awaited<ReturnType<typeof projectDataManager>>;
	projectData: PendingProject;
	unmodifiedProject: ProjectWithFollowers;
	pendingInvitations: MemberRequests[];
	pendingApplications: MemberRequests[];
	setPendingInvitations: React.Dispatch<React.SetStateAction<MemberRequests[]>>;
	setPendingApplications: React.Dispatch<React.SetStateAction<MemberRequests[]>>;
	pendingRequestsLoaded: boolean;
	setPendingRequestsLoaded: React.Dispatch<React.SetStateAction<boolean>>;
	initialPendingRequests: {
		invitations: MemberRequests[];
		applications: MemberRequests[];
	};
	setInitialPendingRequests: React.Dispatch<React.SetStateAction<{
		invitations: MemberRequests[];
		applications: MemberRequests[];
	}>>;
	//setProjectData: (data: ProjectDetail) => void; because of the data manager we no longer directly update the projectData 
	// from here
	setErrorMember: (error: string) => void;
	setErrorPosition: (error: string) => void;
	// permissions: number;
	saveProject: () => void;
	updatePendingProject: (updatedPendingProject: PendingProject) => void;
	saveable: boolean;
	failCheck: boolean;
	updateFailCheck: boolean;
	message: string;
	messages: string[];
	setMessages: React.Dispatch<React.SetStateAction<string[]>>;
	isSaving: boolean;
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
	unmodifiedProject,
	pendingInvitations,
	pendingApplications,
	setPendingInvitations,
	setPendingApplications,
	pendingRequestsLoaded,
	setPendingRequestsLoaded,
	initialPendingRequests,
	setInitialPendingRequests,
	setErrorMember,
	setErrorPosition,
	/*permissions,*/
	saveProject,
	updatePendingProject,
	saveable,
	failCheck,
	updateFailCheck,
	message,
	messages,
	setMessages,
	isSaving
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
	const projectAfterTeamChanges: PendingProject =
		structuredClone(projectData);

	// Tracks whether the edited position was saved
	const [positionSaved, setPositionSaved] = useState<boolean>(true);

	const [confirm, setConfirm] = useState(false);

	const [positionConfirm, setPositionConfirm] = useState(false);

	const cancelConfirm = () => setPositionConfirm(false);

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
		ProjectJob | Fillable<Pending<ProjectJob>>
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

	// current logged in user id
	const [currentUserId, setCurrentUserId] = useState<number | null>(null);

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

	const [messageText, setMessageText] = useState("");

	const [newOwner, setNewOwner] = useState<UserPreview | null>(null);
	const [ownerChange, setOwnerChange] = useState("");
	/**
	 * Handles invitation request in local and data manager
	 */
	const handleDeleteInvitation = useCallback(
		(request: MemberRequests) => {
			if (!request.requestId) return;

			dataManager?.deleteMemberRequest({
				id: { type: "canon", value: request.requestId },
				data: null,
			});

			setPendingInvitations((prevInvites) =>
				prevInvites.filter((invite) => invite.requestId !== request.requestId)
			);

			// Mark the parent editor as dirty so closing the popup shows unsaved confirmation.
			updatePendingProject(structuredClone(projectData));
		},
		[dataManager, projectData, updatePendingProject]
	);

	// State for editing a pending invitation
	const [editingRequest, setEditingRequest] = useState<MemberRequests | null>(null);

	// check if a value is null or undefined
	const isNullOrUndefined = (value: unknown | null | undefined) => {
		return value === null || value === undefined;
	};

	const navigate = useNavigate();

	const { setOpen: closeOuterPopup } = useContext(PopupContext);
	const { setOpen } = useContext(PopupContext);
	
	// Check if the Pending Requests tab is unsaved
	const isPendingRequestsUnsaved = useMemo(() => {
		const currentInvitations = pendingInvitations || [];
		const currentApplications = pendingApplications || [];
		const originalInvitations = initialPendingRequests.invitations || [];
		const originalApplications = initialPendingRequests.applications || [];

		if (currentInvitations.length !== originalInvitations.length) return true;
		if (currentApplications.length !== originalApplications.length) return true;

		const compareRequests = (current: MemberRequests[], original: MemberRequests[]) =>
			current.some((request, index) => {
				const originalRequest = original[index];
				if (!originalRequest) return true;
				return (
					request.requestId !== originalRequest.requestId ||
					request.requestStatus !== originalRequest.requestStatus ||
					request.sentFromProject !== originalRequest.sentFromProject ||
					request.roleId !== originalRequest.roleId ||
					request.prospectiveMemberId !== originalRequest.prospectiveMemberId
				);
			});

		return (
			compareRequests(currentInvitations, originalInvitations) ||
			compareRequests(currentApplications, originalApplications)
		);
	}, [pendingInvitations, pendingApplications]);

	// Check if the Team Members tab is unsaved
	const isTeamMembersUnsaved = useMemo(() => {
		const currentMembers = projectData?.members || [];
		const originalMembers = unmodifiedProject?.members || [];

		if (currentMembers.length !== originalMembers.length) return true;

		// Deep comparison
		return currentMembers.some((current, index) => {
			const original = originalMembers[index];
			if (!original) return true;
			return (
				current.user?.userId !== original.user?.userId ||
				current.role?.roleId !== original.role?.roleId
			);
		});
	}, [projectData?.members, unmodifiedProject?.members]);

	// Check if Open Positions is unsaved
	const isOpenPositionsUnsaved = useMemo(() => {
		const currentJobs = projectData?.jobs || [];
		const originalJobs = unmodifiedProject?.jobs || [];

		if (currentJobs.length !== originalJobs.length) return true;

		// Deep comparison! Is this getting old?
		return currentJobs.some((current, index) => {
			const original = originalJobs[index];
			if (!original) return true;
			return (
				current.role?.roleId !== original.role?.roleId ||
				current.availability !== original.availability ||
				current.location !== original.location ||
				current.jobStart !== original.jobStart ||
				current.jobEnd !== original.jobEnd ||
				current.compensation !== original.compensation ||
				current.description !== original.description ||
				current.contact?.userId !== original.contact?.userId
			);
		});
	}, [projectData?.jobs, unmodifiedProject?.jobs]);

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
				const searchableUsers = response.data?.map(
					(user: UserPreview) => {
						// get make searchable user
						const filteredUser = {
							username: user.username,
							firstName: user.firstName,
							lastName: user.lastName
						};
						return filteredUser;
					}
				) as UserSearchableFields[];

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

	// load current logged-in account id
	useEffect(() => {
		const loadCurrent = async () => {
			try {
				const resp = await getCurrentAccount();
				if (resp && resp.data) setCurrentUserId(resp.data.userId);
			} catch (e) {
				console.error("Failed to load current account", e);
			}
		};

		loadCurrent();
	}, []);

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
	}, [
		currentJob,
		isCreatingNewPosition,
		isTeamTabOpen,
		projectAfterTeamChanges.jobs
	]);

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
	const getProjectJob = useCallback(
		(id: number) => {
			return projectAfterTeamChanges.jobs.find(
				(j) => j.role?.roleId === id
			);
		},
		[projectAfterTeamChanges.jobs]
	);

	/**
	 * Helper function that retrieves all pending requests associated to the project
	 * @returns Pending requests (using useState)
	 */
	const getPendingRequests = async () => {
		if (!projectData.projectId) return;

		try {
			const requests = await getMemberRequestByProjectID(projectData.projectId);
			if (requests.data) {
				const invitations = requests.data.filter(
					(r) => r.requestStatus === 'Pending' && r.sentFromProject === true
				);
				const applications = requests.data.filter(
					(r) => r.requestStatus === 'Pending' && r.sentFromProject === false
				);
				setPendingInvitations(invitations);
				setPendingApplications(applications);
				setInitialPendingRequests({ invitations, applications });
			}
		} catch (e) {
			console.log('Failed to fetch pending member requests.');
		} finally {
			setPendingRequestsLoaded(true);
		}
	};

	// Load pending member requests once per project when no saved local state exists
	useEffect(() => {
		if (!pendingRequestsLoaded && projectData.projectId) {
			getPendingRequests();
		}
	}, [pendingRequestsLoaded, projectData.projectId]);

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
			setMessageText("");
		};

		// notify user of error, reset fields
		const errorWarning = (message: string) => {
			setSuccessAddMember(false);
			setErrorAddMember(message);
			resetFields();
			return false;
		};

		// check if member is already in project
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
						...roleObject
					};
				}
			} else {
				setSuccessAddMember(false);
				setErrorAddMember("Select a role"); // TODO default to Member role instead
				setSelectKey((previous) => previous + 1);
				return false;
			}
		}

		// limit posbile null role
		if (!currentMember.role) {
			setSuccessAddMember(false);
			setErrorAddMember("Select a role");
			setSelectKey((previous) => previous + 1);
			return false;
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

			if ("localId" in currentMember)
				(currentMember as PendingProjectMember).localId =
					++localIdIncrement;

			dataManager?.createMember({
				id: {
					value:
						(currentMember as PendingProjectMember).localId ??
						++localIdIncrement,
					type: "local"
				},
				data: {
					prospectiveMemberId: currentMember.user.userId,
					// use project owner as inviter if current user id is not loaded for some reason (shouldn't happen but just in case)
					ownerUserId: (currentUserId ??
						projectAfterTeamChanges.owner?.userId) as number,
					roleId: currentMember.role.roleId,
					message: messageText
				}
			});

			setMessages([...messages, messageText]);

			// const pendingRole =
			// 	allRoles.find((r) => r.label === "Pending") ??
			// 	currentMember.role;
			// const localProjectMember: PendingProjectMember = {
			// 	user: currentMember.user,
			// 	role: currentMember.role,
			// 	localId:
			// 		(currentMember as PendingProjectMember).localId ??
			// 		++localIdIncrement
			// };

			// projectAfterTeamChanges.members = [
			// 	...projectAfterTeamChanges.members,
			// 	localProjectMember
			// ];
			// updatePendingProject(projectAfterTeamChanges);

			const newInvitation: MemberRequests = {
				requestId: 0, // or a temporary local id if you have one
				prospectiveMemberId: currentMember.user.userId,
				projectId: projectAfterTeamChanges.projectId as number,
				roleId: currentMember.role.roleId,
				sentFromProject: true,
				requestStatus: "Pending",
			};

			setPendingInvitations(prev => [...prev, newInvitation]);

			updatePendingProject(structuredClone(projectAfterTeamChanges));

			setCurrentMember(emptyMember);
			resetFields();
			return true;
		}
	}, [
		allRoles,
		allUsers,
		currentMember,
		projectAfterTeamChanges,
		dataManager,
		updatePendingProject
	]);

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
   * Runs when the editor popup is closed. Discards any unsaved edits so that
   * reopening the editor shows the current saved profile instead of stale
   * in-editor changes. (The component stays mounted while the popup is hidden,
   * so this state would otherwise persist until a full page refresh.)
   */
  const handleEditorClose = () => {

    // Discard unsaved field edits...
    if (currentJob) setCurrentJob(structuredClone(currentJob));
    // ...and the pending changes tracked by the data manager, so they can't be
    // re-applied on a later save.
    if ((currentJob as ProjectJob).jobId) {
		//isLocal = false;
		dataManager?.deleteJob({
			id: {
				type: "canon",
				value: (currentJob as ProjectJob).jobId
			},
			data: null
		});
	} else if ((currentJob as Pending<ProjectJob>).localId) {
		dataManager?.deleteJob({
			id: {
				type: "local",
				value:
					(currentJob as Pending<ProjectJob>).localId ??
					++localIdIncrement
			},
			data: null
		});
	}
    setPositionSaved(true);
  };

	  // Fires when the popup is closed (X, Escape, or click-outside). With
  // confirmation={!saved} on the PopupContent below, an unsaved close is
  // intercepted — the popup stays open and we surface the confirm dialog
  // instead of discarding the edits.
  const handlePopupCallback = () => {
    if (positionSaved) {
      handleEditorClose();
    } else {
      setPositionConfirm(true);
    }
  };

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
			// Somehow wait until they accept the invite
			setCurrentMember({
				...emptyMember,
				...currentMember,
				user: {
					...matchedUser
				}
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
		setMessageText("");
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
			emptyJob.jobSkills = [];
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

	// User confirmed they want to leave without saving: discard edits and let the
  	// popup close (the Confirm button has doNotClose=false, so it closes itself).
  	const confirmExit = () => {
  	  setPositionConfirm(false);
  	  handleEditorClose();
  	};

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
			//let isLocal : bool = true;

			if ((currentJob as ProjectJob).jobId) {
				//isLocal = false;
				dataManager?.deleteJob({
					id: {
						type: "canon",
						value: (currentJob as ProjectJob).jobId
					},
					data: null
				});
			} else if ((currentJob as Pending<ProjectJob>).localId) {
				dataManager?.deleteJob({
					id: {
						type: "local",
						value:
							(currentJob as Pending<ProjectJob>).localId ??
							++localIdIncrement
					},
					data: null
				});
			}

			const updatedProject = {
				...projectAfterTeamChanges,
				jobs: projectAfterTeamChanges.jobs.filter(
					(job) =>
						("jobId" in currentJob &&
							"jobId" in job &&
							job.jobId !== currentJob.jobId) ||
						("localId" in currentJob &&
							"localId" in job &&
							job.localId !== currentJob.localId)
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
	}, [
		currentJob,
		dataManager,
		projectAfterTeamChanges,
		updatePendingProject
	]);

	/**
	 * Validates and saves position data, updating the project's job listings.
	 * @returns void
	 */
	const savePosition = useCallback(() => {
		(currentJob as Pending<ProjectJob>).localId = localIdIncrement++;
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
				isNullOrUndefined(currentJob.compensation) ||
				isNullOrUndefined(currentJob.contact?.userId) ||
				currentJob.jobSkills?.length === 0
			) {
				// set error
				setErrorAddPosition("All fields are required");
				return;
			}

			if (isNullOrUndefined(currentJob.jobStart)) {
				currentJob.jobStart = new Date(1900, 0, 1);
			}

			if (isNullOrUndefined(currentJob.jobEnd)) {
				currentJob.jobEnd = new Date(1900, 0, 1);
			}

			dataManager?.createJob({
				id: {
					value:
						(currentJob as Pending<ProjectJob>).localId ??
						++localIdIncrement,
					type: "local"
				},
				data: {
					availability: currentJob.availability,
					compensation: currentJob.compensation,
					contactUserId: currentJob.contact.userId,
					jobStart: currentJob.jobStart,
					jobEnd: currentJob.jobEnd,
					location: currentJob.location,
					roleId: currentJob.role.roleId,
					description: currentJob.description ?? undefined,
					jobSkills: (currentJob.jobSkills as JobSkill[])
				}
			});

			//passing in the associated job's localId to get this to work properly
			if (currentJob.jobSkills) {
				for (const skill of currentJob.jobSkills) {

					dataManager?.addProjectJobSkill({
						id: {
							value:
								(currentJob as Pending<ProjectJob>).localId ??
								localIdIncrement++,
							type: "local"
						},
						data: {
							skillId: (skill as JobSkill).skillId,
							proficiency: (skill as JobSkill).proficiency,
							position: (skill as JobSkill).position
						}
					});
				}
			}

			projectAfterTeamChanges.jobs = [
				...projectAfterTeamChanges.jobs,
				currentJob as Pending<ProjectJob>
			];

			updatePendingProject(projectAfterTeamChanges);
			setEditMode(false);
			setIsCreatingNewPosition(false);
			setErrorAddPosition("");
			setCurrentJob(currentJob);
			return;
		} else {
			const unmodifiedSkills = unmodifiedProject.jobs.find(
				(j) => j.jobId === (currentJob as ProjectJob).jobId
			)?.jobSkills;
			let skillsToBeAdded = [];

			if (currentJob.jobSkills) {
				if (unmodifiedSkills && unmodifiedSkills.length > 0) {
					for (const skill of unmodifiedSkills) {
						if ((currentJob.jobSkills as JobSkill[]).every((curSkill) => curSkill?.skillId !== skill.skillId)) {
							dataManager?.deleteProjectJobSkill({
								id: {
									value: skill.skillId,
									type: "canon"
								},
								data: {
									jobId: (currentJob as ProjectJob).jobId,
									skillId: skill.skillId
								}
							});
						}
					}
					skillsToBeAdded = (currentJob.jobSkills as JobSkill[]).filter((s) => unmodifiedSkills.every((u) => u.skillId !== s.skillId))
				}
				else {
					skillsToBeAdded = currentJob.jobSkills as JobSkill[]
				}
				for (const skill of skillsToBeAdded) {
					dataManager?.addProjectJobSkill({
						id: {
							value: (currentJob as ProjectJob).jobId,
							type: "canon"
						},
						data: {
							skillId: (skill as JobSkill).skillId,
							proficiency: (skill as JobSkill).proficiency,
							position: (skill as JobSkill).position
						}
					});
				}
			}

			dataManager?.updateJob({
				id: {
					value: (currentJob as ProjectJob).jobId,
					type: "canon"
				},
				data: {
					availability: currentJob.availability ?? undefined,
					compensation: currentJob.compensation ?? undefined,
					contactUserId: currentJob.contact?.userId ?? undefined,
					description: currentJob.description ?? undefined,
					jobStart: currentJob.jobStart ?? undefined,
					jobEnd: currentJob.jobEnd ?? undefined,
					location: currentJob.location ?? undefined,
					roleId: currentJob.role?.roleId ?? undefined
				}
			});

			projectAfterTeamChanges.jobs = [
				...projectAfterTeamChanges.jobs.filter(
					(job) =>
						(job as ProjectJob).jobId !==
						(currentJob as ProjectJob).jobId
				),
				currentJob as ProjectJob
			];

			setErrorAddPosition("");
			setEditMode(false);

			updatePendingProject(projectAfterTeamChanges);
		}
	}, [currentJob, dataManager, isCreatingNewPosition, projectAfterTeamChanges, unmodifiedProject.jobs, updatePendingProject]);

	const undefinedDateToString = (undefinedDate: Date | null | undefined) => {
		if (undefinedDate) {
			if (undefinedDate.toString().slice(0, 10) === "1900-01-01") {
				return " None";
			}

			return ` ${undefinedDate.toString().slice(0, 10)}`;
		}

		return " Date was undefined";
	}

	//make date safe to stop crashing
	const safeDate = (value: Date | string | null | undefined) => {
		if (!value) return "None";

		//convert to real date
		const dateObj = value instanceof Date ? value : new Date(value)

		//validate
		if (isNaN(dateObj.getTime())) return "None";

		//convert to ISO string + remove time
		const date = dateObj.toISOString().slice(0, 10);

		//no date
		if (date === "1900-01-01") return "None";

		return `${date}`;
	}

	// --- Content variables ---
	// JSX content for viewing position details.
	const positionViewWindow =
		projectAfterTeamChanges.jobs.length === 0 ? (
			// No positions to view
			<>
				<div className="positions-popup-info-title">
					No open positions
				</div>
			</>
		) : (
			// Positions to view
			<>
				<button
					className="edit-project-member-button"
					onClick={() => {
						setCurrentJob(
							getProjectJob(currentJob?.role?.roleId as number)
						);
						setEditMode(true);
					}}>
					<ThemeIcon
						id={"pencil"}
						width={11}
						height={12}
						className={
							"gradient-color-fill edit-project-member-icon"
						}
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
				{/*job skills would probably go here, i find it's important enough to go above everything else*/}
				{/*it looks awful right now so uh yeah*/}
				<div id="positions-popup-info-job-skills">
					<span className="position-detail-indicator">
						Job Skills
					</span>

					<div id="edit-position-skills-list">
						{/* TODO: make displayed tags look like tags */}
						{currentJob?.jobSkills &&
							currentJob?.jobSkills?.length > 0 ?
							currentJob?.jobSkills?.map((tag) => {
								if (tag) {
									let category: string;
									switch (tag.type) {
										case "Designer":
											category = "red";
											break;
										case "Developer":
											category = "yellow";
											break;
										case "Soft":
											category = "purple";
											break;
										case "Audio":
											category = "periwinkle";
											break;
										case "Engineer":
											category = "cyan";
											break;
										default:
											category = "grey";
									}
									return (
										<div
											key={`${tag.skillId}`}
											className={`skill-tag-label label-${category}`}
										>
											{tag.label}
										</div>
									);
								}
								else return ""
							}
							) : "None"}
					</div>
				</div>
				<div id="open-position-details">
					<div id="open-position-details-left">
						<div id="position-availability">
							<span className="position-detail-indicator">
								Availability:{" "}
							</span>
							{currentJob &&
								currentJob?.availability &&
								JobAvailabilityEnums[currentJob.availability]}
						</div>
						<div id="position-location">
							<span className="position-detail-indicator">
								Location:{" "}
							</span>
							{currentJob &&
								currentJob?.location &&
								JobLocationEnums[currentJob.location]}
						</div>
						<div id="open-position-contact">
							<span className="position-detail-indicator">
								Contact:{" "}
							</span>
							<div
								id="position-contact-link"
								onClick={() => {
									// Link to profile, close popup
									navigate(
										`${paths.routes.PROFILE}?userID=${currentJob?.contact?.userId}`
									);
									setOpen(false);
								}}>
								<img
									className="project-member-image"
									src={
										projectAfterTeamChanges.owner
											?.profileImage ?? profileImage
									}
									alt="profile picture"
									onError={(e) => {
										// default profile picture if user image doesn't load
										// Cannot use usePreloadedImage function because this is in a callback
										const profileImg =
											e.target as HTMLImageElement;
										profileImg.src = profileImage;
									}}
								/>
								<span>{contactName}</span>
							</div>
						</div>
					</div>
					<div id="open-position-details-right">
						<div id="position-start">
							<span className="position-detail-indicator">
								Job Start:
							</span>

							{//if no date was inserted, "none" appears
								safeDate(currentJob?.jobStart)}
						</div>

						<div id="position-end">
							<span className="position-detail-indicator">
								Job End:
							</span>

							{safeDate(currentJob?.jobEnd)}
						</div>

						<div id="position-compensation">
							<span className="position-detail-indicator">
								Compensation:{" "}
							</span>
							{currentJob &&
								currentJob?.compensation &&
								JobCompensationEnums[currentJob.compensation]}
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
						<div id="project-team-delete-member-title">
							Delete Position
						</div>
						<div
							id="project-team-delete-member-text"
							className="project-editor-extra-info">
							Are you sure you want to delete{" "}
							<span className="project-info-highlight">
								{getProjectJob(
									currentJob?.role?.roleId as number
								)?.role?.label ?? "Member"}
							</span>{" "}
							from the project? This action cannot be undone.
						</div>
						<div className="project-editor-button-pair">
							{/* TODO: make delete button work */}
							<PopupButton
								className="delete-button"
								callback={() => deletePosition()}>
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
				<label>
					Role
					<span
						className="required-asterisk"
						aria-hidden="true"
						title="Required">
						*
					</span>
				</label>
				<Select>
					<SelectButton
						placeholder={isCreatingNewPosition ? "Select" : ""}
						searchable={true}
						initialVal={
							isCreatingNewPosition
								? ""
								: (allRoles.find(
									({ roleId }) =>
										roleId === currentJob?.role?.roleId
								)?.label ?? "Member")
						}
						type="input"
					/>
					<SelectOptions
						callback={(e) => {
							const selectedRole = allRoles.find(
								(role) =>
									role.label ===
									(e.target as HTMLButtonElement).value
							);

							if (selectedRole) {
								setCurrentJob({
									...currentJob,
									role: {
										...selectedRole
									}
								} as ProjectJob);
							}
						}}
						options={allRoles.map((role) => {
							return {
								markup: <>{role.label}</>,
								value: role.label,
								disabled: false
							};
						})}
					/>
				</Select>
			</div>

			<div id="edit-position-description">
				<label>
					Role Description
					<span
						className="required-asterisk"
						aria-hidden="true"
						title="Required">
						*
					</span>
				</label>
				<textarea
					value={currentJob?.description ?? ""}
					onChange={(e) => {
						setCurrentJob({
							...currentJob,
							description: e.target.value
						} as ProjectJob);
					}}>
					{isCreatingNewPosition
						? ""
						: getProjectJob(currentJob?.role?.roleId as number)
							?.description}
				</textarea>
			</div>

			<div id="edit-position-skills-container">
				<Popup>
					<div id="edit-position-skills-label-button">
						<label>Job Skills
							<span
								className="required-asterisk"
								aria-hidden="true"
								title="Required">
								*
							</span>
						</label>
						<PopupButton
							className="edit-project-member-button"
							doNotClose={() => currentJob === undefined}>
							<ThemeIcon
								id={"pencil"}
								width={11}
								height={12}
								className={
									"gradient-color-fill edit-project-member-icon"
								}
								ariaLabel={"edit job skills"}
							/>
						</PopupButton>
						{currentJob ? (
							<PopupContent callback={handlePopupCallback} confirmation={!positionSaved}>
								{confirm ? <PopupContent confirmation={true} useClose={false} callback={() => {console.log("true!")}}>
        					  	<div id="confirm-editor-save-text">Are you sure you want to exit without saving?</div>
        					  	<div id="confirm-editor-save">
        					  	  <PopupButton doNotClose={() => false} callback={confirmExit} buttonId="project-editor-save">
        					  	    Confirm
        					  	  </PopupButton>
        					  	  <PopupButton doNotClose={() => true} callback={cancelConfirm} buttonId="team-edit-member-cancel-button" >
        					  	    Cancel
        					  	  </PopupButton>
        					  	</div>
        						</PopupContent> : ""}
								<JobSkillPopup
									job={currentJob}
									updateJob={setCurrentJob}
									setPositionSaved={setPositionSaved}
								/>
							</PopupContent>
						) : (
							""
						)}
					</div>
				</Popup>
				<div id="edit-position-skills-list">
					{/* TODO: make displayed tags look like tags */}
					{currentJob?.jobSkills &&
						currentJob?.jobSkills?.length > 0 ?
						currentJob?.jobSkills?.map((tag) => {
							if (tag) {
								let category: string;
								switch (tag.type) {
									case "Designer":
										category = "red";
										break;
									case "Developer":
										category = "yellow";
										break;
									case "Soft":
										category = "purple";
										break;
									case "Audio":
										category = "periwinkle";
										break;
									case "Engineer":
										category = "cyan";
										break;
									default:
										category = "grey";
								}
								return (
									<div
										key={`${tag.skillId}`}
										className={`skill-tag-label label-${category}`}
									>
										{tag.label}
									</div>
								);
							}
							else return ""
						}
						) : <div id="invalid-input-error"><p>Select up to 5 skills for this position</p></div>}
				</div>
			</div>
			<div id="edit-position-details">
				<div id="edit-position-details-top">
					<div className="edit-position-container">
						<div id="edit-position-job-start">
							<label className="edit-position-job-start">Job Start</label>
							<input
								type="date"
								id="input-job-start"
								name="job-start"
								min="1000-01-01"
								max="9999-12-31"
								onChange={(e) => {
									if (currentJob) {
										currentJob.jobStart = e.currentTarget.valueAsDate;
									} else {
										console.log("currentJob is undefined");
									}
								}}>
							</input></div>

						<div id="edit-position-job-end">
							<label className="edit-position-job-end">Job End</label>
							<input
								type="date"
								id="input-job-end"
								name="job-end"
								min="1000-01-01"
								max="9999-12-31"
								onChange={(e) => {
									if (currentJob) {
										currentJob.jobEnd = e.currentTarget.valueAsDate;
									} else {
										console.log("currentJob is undefined");
									}
								}}>
							</input>
						</div>
					</div>
				</div>
				<div id="edit-position-details-left">
					<div className="edit-position-container">
						<label className="edit-position-availability">
							Availability
							<span
								className="required-asterisk"
								aria-hidden="true"
								title="Required">
								*
							</span>
						</label>
						<Select>
							<SelectButton
								placeholder="Select"
								initialVal={
									isCreatingNewPosition
										? ""
										: getProjectJob(
											currentJob?.role
												?.roleId as number
										) &&
											getProjectJob(
												currentJob?.role
													?.roleId as number
											)?.availability
											? JobAvailabilityEnums[
											getProjectJob(
												currentJob?.role
													?.roleId as number
											)!.availability!
											] // explicit because its checked for before
											: ""
								}
								type="input"
							/>
							<SelectOptions
								callback={(e) => {
									const key = Object.keys(
										JobAvailabilityEnums
									).find(
										(key) =>
											JobAvailabilityEnums[
											key as keyof typeof JobAvailabilityEnums
											] ===
											(e.target as HTMLButtonElement)
												.value
									);

									setCurrentJob({
										...currentJob,
										availability: key as JobAvailability
									} as ProjectJob);
								}}
								options={Object.values(
									JobAvailabilityEnums
								).map((option) => {
									return {
										markup: <>{option}</>,
										value: option,
										disabled: false
									};
								})}
							/>
						</Select>
					</div>
					<div className="edit-position-container">
						<label className="edit-position-location">
							Location
							<span
								className="required-asterisk"
								aria-hidden="true"
								title="Required">
								*
							</span>
						</label>
						<Select>
							<SelectButton
								placeholder="Select"
								initialVal={
									isCreatingNewPosition
										? ""
										: getProjectJob(
											currentJob?.role
												?.roleId as number
										) &&
											getProjectJob(
												currentJob?.role
													?.roleId as number
											)?.location
											? JobLocationEnums[
											getProjectJob(
												currentJob?.role
													?.roleId as number
											)!.location!
											] // explicit because its checked for before
											: ""
								}
								type="input"
							/>
							<SelectOptions
								callback={(e) => {
									const key = Object.keys(
										JobLocationEnums
									).find(
										(key) =>
											JobLocationEnums[
											key as keyof typeof JobLocationEnums
											] ===
											(e.target as HTMLButtonElement)
												.value
									);

									setCurrentJob({
										...currentJob,
										location: key as JobLocation
									} as ProjectJob);
								}}
								options={Object.values(JobLocationEnums).map(
									(option) => {
										return {
											markup: <>{option}</>,
											value: option,
											disabled: false
										};
									}
								)}
							/>
						</Select>
					</div>

				</div>
				<div id="edit-position-details-right">
					<div className="edit-position-container">
						<label className="edit-position-compensation">
							Compensation
							<span
								className="required-asterisk"
								aria-hidden="true"
								title="Required">
								*
							</span>
						</label>
						<Select>
							<SelectButton
								placeholder="Select"
								initialVal={
									isCreatingNewPosition
										? ""
										: getProjectJob(
											currentJob?.role
												?.roleId as number
										) &&
											getProjectJob(
												currentJob?.role
													?.roleId as number
											)?.compensation
											? JobCompensationEnums[
											getProjectJob(
												currentJob?.role
													?.roleId as number
											)!.compensation!
											] // explicit because its checked for before
											: ""
								}
								type="input"
							/>
							<SelectOptions
								callback={(e) => {
									const key = Object.keys(
										JobCompensationEnums
									).find(
										(key) =>
											JobCompensationEnums[
											key as keyof typeof JobCompensationEnums
											] ===
											(e.target as HTMLButtonElement)
												.value
									);

									setCurrentJob({
										...currentJob,
										compensation: key as JobCompensation
									} as ProjectJob);
								}}
								options={Object.values(
									JobCompensationEnums
								).map((option) => {
									return {
										markup: <>{option}</>,
										value: option,
										disabled: false
									};
								})}
							/>
						</Select>
					</div>
				</div>
				<div id="edit-position-details-right">
					<div className="edit-position-container">
						<label className="edit-position-contact">
							Main Contact
							<span
								className="required-asterisk"
								aria-hidden="true"
								title="Required">
								*
							</span>
						</label>
						{/* <select className="edit-position-contact"></select> */}
						<Select>
							<SelectButton
								className="edit-position-contact"
								placeholder="Select"
								type="input"
								initialVal={
									currentJob?.contact
										? `${currentJob.contact.firstName} ${currentJob.contact.lastName}`
										: ""
								}
							/>
							<SelectOptions
								className="edit-position-contact"
								callback={(e) => {
									const selectedId = parseInt(
										(e.currentTarget as HTMLButtonElement)
											.value
									);
									setCurrentJob({
										...currentJob,
										contact:
											allUsers.find(
												({ userId }) =>
													userId === selectedId
											) ?? null
									} as ProjectJob);
								}}
								options={unmodifiedProject.members
									.filter((member) => member.user !== null)
									.filter(member => {
										const pendingInvitation = pendingInvitations.find(req =>
											req.prospectiveMemberId === member.user?.userId &&
											req.roleId === member.role?.roleId &&
											req.requestStatus !== 'Accepted');
										const pendingApplication = pendingApplications.find(req =>
											req.prospectiveMemberId === member.user?.userId &&
											req.roleId === member.role?.roleId &&
											req.requestStatus !== 'Accepted');
										return !pendingInvitation && !pendingApplication;
									})
									// .filter((member) => member.role?.label === "Owner") // TODO change when perms exist
									.map(({ user }) => ({
										markup: (
											<>
												<div className="project-editor-project-member-info">
													<img
														className="project-member-image"
														src={
															user!
																.profileImage ??
															profileImage
														}
														alt="profile"
														title={
															"Profile picture"
														}
														// Cannot use usePreloadedImage function because this is in a callback
														onError={(e) => {
															const profileImageElement =
																e.target as HTMLImageElement;
															profileImageElement.src =
																profileImage;
														}}
													/>{" "}
													<div className="project-editor-project-member-name">
														{user!.firstName}{" "}
														{user!.lastName}
													</div>
												</div>
											</>
										),
										value: user!.userId.toString(),
										disabled: false
									}))}
							/>
						</Select></div>
				</div>
			</div>
			<div id="edit-position-buttons">
				<div id="edit-position-button-pair">
					<button
						type="button"
						onClick={savePosition}
						id="position-edit-save">
						Save
					</button>
					<button
						onClick={() => {
							addPositionCallback();
						}}
						id="position-edit-cancel"
						className="button-reset">
						Cancel
					</button>
				</div>
				<div className="error">{errorAddPosition}</div>
			</div>
		</>
	);

	// Check if team tab is in edit mode
	const positionWindow =
		editMode === true ? positionEditWindow : positionViewWindow;
	
		// Renders the current member requests interface with member cards and edit functionality.
	const currentRequestsContent: JSX.Element = useMemo(
		() => (
			<div id="project-editor-project-requests">
				{/* List out project requests */}
				<p className="project-editor-project-header">Invitations</p>
				<div className="project-editor-project-invites">
					{pendingInvitations.length != 0
						? pendingInvitations
							.map((pI) => {
								const member = allUsers.find((u) => u.userId === pI.prospectiveMemberId);
								const role = allRoles.find((r) => r.roleId === pI.roleId);
								if (!member || !role) return;

								return (
									<div
										key={member.userId}
										className="project-editor-project-member"
									>
										<img
											className="project-member-image"
											src={member.profileImage ?? profileImage}
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
												{member.firstName} {member.lastName}
											</div>
											<div className="project-editor-project-member-role project-editor-extra-info">
												{role.label}
											</div>
										</div>
										{/* <Popup>
                      <PopupButton className="edit-project-member-button">
                        <ThemeIcon
                          id={"pencil"}
                          width={11}
                          height={12}
                          className={"gradient-color-fill edit-project-member-icon"}
                          ariaLabel={"edit"}
                        />
                      </PopupButton>
                    </Popup> */}
										{/* <div className="invite-actions"> */}
										<Popup>
											{/* <PopupButton
                          className="edit-invite-btn"
                          callback={() => setEditingRequest(pI)}
                        >
                          <i className="fa fa-pencil" />
                        </PopupButton> */}
											<PopupButton
												className="edit-project-member-button"
												callback={() => setEditingRequest(pI)} >
												<ThemeIcon
													id={"pencil"}
													width={11}
													height={12}
													className={"gradient-color-fill edit-project-member-icon"}
													ariaLabel={"edit"}
												/>
											</PopupButton>
											<PopupContent useClose={false}>
												<div id="project-team-edit-invite-title">Edit Invitation</div>
												<div className="project-editor-extra-info">
													Edit the requested role for <span className="project-info-highlight">{member.firstName} {member.lastName}</span>
												</div>
												<label className="project-team-edit-invite-role">Role</label>
												<Select>
													<SelectButton placeholder={role.label} initialVal="" type="input" searchable={true} />
													<SelectOptions
														callback={(e) => {
															// update local editingRequest roleId
															if (!editingRequest) return;
															const newRole = allRoles.find((r) => r.label === (e.target as HTMLButtonElement).value);
															if (!newRole) return;
															setEditingRequest({ ...editingRequest, roleId: newRole.roleId } as MemberRequests);
														}}
														options={allRoles.map(({ label }) => ({ markup: <>{label}</>, value: label, disabled: false }))}
													/>
												</Select>
												<div className="project-editor-button-pair">
													<PopupButton
														buttonId="team-edit-invite-cancel-button"
														className="button-reset"
														callback={() => setEditingRequest(null)}
													>
														Cancel
													</PopupButton>
													<PopupButton
														className="save-button"
														callback={() => {
															if (!editingRequest || !editingRequest.requestId) return;

															if (dataManager?.updateMemberRequest) {
																dataManager.updateMemberRequest({
																	id: { type: 'canon', value: editingRequest.requestId },
																	data: { roleId: editingRequest.roleId }
																});
															}

															const updatedInvitations = pendingInvitations.map((inv) =>
																inv.requestId === editingRequest.requestId
																	? { ...inv, roleId: editingRequest.roleId }
																	: inv
															);
															setPendingInvitations(updatedInvitations);

															// mark parent editor as dirty
															updatePendingProject(structuredClone(projectData));
															setEditingRequest(null);
														}}
													>
														Save
													</PopupButton>
												</div>
											</PopupContent>
										</Popup>

										<Popup>
											<PopupButton className="delete-invite-btn">
												<i className="fa fa-trash" style={{ color: '#ff4d4f' }} />
											</PopupButton>
											<PopupContent useClose={false}>
												<div id="project-team-delete-member-request-title">
													Delete Invitation
												</div>
												<div
													id="project-team-delete-member-request-text"
													className="project-editor-extra-info"
												>
													Are you sure you want to delete the invitation for{' '}
													<span className="project-info-highlight">
														{member.firstName} {member.lastName}
													</span>{' '}
													to join this project? This action cannot be undone.
												</div>
												<div className="project-editor-button-pair">
													<PopupButton
														className="delete-button"
														callback={() => handleDeleteInvitation(pI)}
													>
														Delete
													</PopupButton>
													<PopupButton
														buttonId="team-delete-member-request-cancel-button"
														className="button-reset"
													>
														Cancel
													</PopupButton>
												</div>
											</PopupContent>
										</Popup>
										{/* </div> */}
									</div>
								)
							})
						// {addMemberButton}
						: <div>No Existing Invitations</div>
					}
				</div>
				<div className="project-editor-project-header">Applications</div>
				<div className="project-editor-project-applications">
					{/* No Pending Applications */}
					{pendingApplications.length != 0
						? pendingApplications
							.map((pA) => {
								const member = allUsers.find((u) => u.userId === pA.prospectiveMemberId);
								const role = allRoles.find((r) => r.roleId === pA.roleId);
								if (!member || !role) return;

								return (
									<div
										key={member.userId}
										className="project-editor-project-member"
									>
										<img
											className="project-member-image"
											src={member.profileImage ?? profileImage}
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
												{member.firstName} {member.lastName}
											</div>
											<div className="project-editor-project-member-role project-editor-extra-info">
												{role.label}
											</div>
										</div>
										<Popup>
											<PopupButton className="next-btn">
												<i className="fa fa-arrow-right" />
											</PopupButton>
											<PopupContent useClose={false}>
												<div id="project-team-review-app-title">
													Any Unsaved Changes?
												</div>
												<div
													id="project-team-review-app-text"
													className="project-editor-extra-info"
												>
													If you leave this page to review an application,
													any unsaved changes will be lost. Would you like to save your changes
													before continuing?
												</div>
												<div className="project-editor-button-pair">
													<PopupButton
														className="save-button"
														callback={() => {
															// Save changes, then navigate to the application
															saveProject();
															navigate(`/acceptApplication/${pA.requestId}`);
														}}
													>
														Save & Continue
													</PopupButton>
													<PopupButton
														buttonId="team-review-app-cancel-button"
														className="button-reset"
													>
														Stay on Page
													</PopupButton>
												</div>
											</PopupContent>
										</Popup>
									</div>
								)
							})
						: <div>No Existing Applications</div>
					}
				</div>
			</div>
		),
		[pendingInvitations, pendingApplications, allUsers, allRoles, editingRequest, dataManager, setPendingInvitations, updatePendingProject, projectData, handleDeleteInvitation, saveProject, navigate]
	);
	// Renders the current team members interface with member cards and edit functionality.
	const currentTeamContent: JSX.Element = useMemo(
		() => (
			<div id="project-editor-project-members">
				{/* List out project members */}
				{projectAfterTeamChanges.members.map((member) => (
					<div
						key={member.user?.userId}
						className="project-editor-project-member">
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
							{projectAfterTeamChanges.owner.userId === member.user?.userId ? <ThemeIcon id={'owner-crown'} width={18} height={18} className={'color-fill'} ariaLabel="Project Owner"/> : ""}
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
										setCurrentMember(
											structuredClone(member)
										);
									}}>
									<ThemeIcon
										id={"pencil"}
										width={11}
										height={12}
										className={
											"gradient-color-fill edit-project-member-icon"
										}
										ariaLabel={"edit"}
									/>
								</PopupButton>
								{/* Edit member button */}
								<PopupContent useClose={false}>
									<div id="project-team-edit-member-title">
										Edit Member
									</div>
									<div
										id="project-team-edit-member-card"
										className="project-editor-project-member">
										<img
											className="project-member-image"
											src={
												member.user?.profileImage ??
												profileImage
											}
											alt="profile image"
											// default profile picture if user image doesn't load
											onError={(e) => {
												const profileImg =
													e.target as HTMLImageElement;
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
												searchable={true}
											/>
											<SelectOptions
												callback={(e) => {
													// get role with matching name (for id)
													const role = allRoles.find(
														(role) =>
															role.label ===
															(
																e.target as HTMLSelectElement
															).value
													);

													// update current member
													setCurrentMember({
														...currentMember!, // on edit button click, currentMember is defined
														role: role as Role
													});
												}}
												options={allRoles.map(
													(role) => {
														return {
															markup: (
																<>
																	{role.label}
																</>
															),
															value: role.label,
															disabled: false
														};
													}
												)}
											/>
										</Select>
									</div>
									{projectAfterTeamChanges.owner.userId === currentMember?.user?.userId
										&& currentMember.role?.label.toLowerCase() !== "owner" ?
										<div id="project-team-change-owner">
											<label>Choose a member to take ownership of the project</label>
											<div id="user-search-container">
												<Dropdown>
													<DropdownButton buttonId="user-search-dropdown-button">
														<SearchBar
															key={searchBarKey}
															value={ownerChange}
															onChange={(e) =>
																setOwnerChange(e.target.value)
															}
															dataSets={[
																{ data: projectAfterTeamChanges.members }
															]}
															onSearch={(results) => {
																handleSearch(
																	results as UserPreview[][]
																);
															}}
															placeholderText='Search Members'>
														</SearchBar>
													</DropdownButton>
													<DropdownContent>
														<div id="user-search-results">
															{projectAfterTeamChanges.members.map(
																(user, index) => (
																	<DropdownButton
																		key={user.user?.userId}
																		className={`user-search-item
																		${index === 0 ? "top" : ""}
																		${index === searchResults.length - 1 ? "bottom" : ""}`}
																		callback={() => {
																			setNewOwner(user.user);
																			setOwnerChange(`${user.user?.firstName} ${user.user?.lastName} (${user.user?.username})`)
																			if (errorAddMember === "To relinquish ownership, you must select a new owner.")
																				setErrorAddMember("");
																		}
																		}
																	>
																		<p className="user-search-name">
																			{user.user?.firstName}{" "}
																			{user.user?.lastName}
																		</p>
																		<p className="user-search-username">
																			{user.user?.username}
																		</p>
																	</DropdownButton>
																)
															)}
														</div>
													</DropdownContent>
												</Dropdown>
											</div>
										</div> :
										""
									}
									{errorAddMember !== "" ?
										<div>
											{errorAddMember}
										</div>
										: ""}
									{/* Action buttons */}
									<div className="project-editor-button-pair">
										{/* Save Button */}
										<PopupButton
											buttonId="team-edit-member-save-button"
											doNotClose={() =>
												!currentMember ||
												!currentMember.user ||
												!currentMember.user.userId ||
												(currentMember.user.userId === projectAfterTeamChanges.owner?.userId && !newOwner)
											}
											callback={() => {
												if (!currentMember) {
													setErrorAddMember("No member selected.");
													return;
												};
												if (!currentMember.user || !currentMember.user.userId) {
													setErrorAddMember("Member is missing user information.");
													return;
												} // cant edit owner role
												if (currentMember.user.userId === projectAfterTeamChanges.owner?.userId && !newOwner) {
													setErrorAddMember("To relinquish ownership, you must select a new owner.");
													return;
												}
												//if (isNullOrUndefined(currentMember.user)) return;

												if (newOwner) {
													dataManager?.swapOwner({
														id: {
															type: "canon",
															value: newOwner.userId,
														},
														data: newOwner.userId,
													});
													dataManager?.updateMember({
														id: {
															type: "canon",
															value: newOwner.userId,
														},
														data: {
															roleId: 77,
															profileVisibility: "public"
														}
													})
													let newMembers = structuredClone(projectAfterTeamChanges.members).map(
														(member) => {
															// if this member matches the updated member
															if (
																newOwner
																	.userId ===
																member.user
																	?.userId
															) {
																// update role
																return {
																	...member,
																	role: { label: "Owner", roleId: 77 }
																} as PendingProjectMember;
															} else {
																// if it doesn't match, do nothing to the member
																return member;
															}
														}
													);
													projectAfterTeamChanges.members = newMembers;
												}
												// update member in data manager
												try {
													dataManager?.updateMember({
														id: {
															type:
																"localId" in
																	currentMember
																	? "local"
																	: "canon",
															value: currentMember
																.user?.userId
														},
														data: {
															roleId: currentMember
																.role?.roleId
														}
													});
												} catch (e) {
													console.error(e);
													setErrorAddMember("Failed to update member");
													return;
												}
												// update team changes array
												projectAfterTeamChanges.members =
													projectAfterTeamChanges.members.map(
														(member) => {
															// if this member matches the updated member
															if (
																currentMember
																	.user
																	?.userId ===
																member.user
																	?.userId
															) {
																// update role
																return {
																	...member,
																	role: currentMember.role
																} as PendingProjectMember;
															} else {
																// if it doesn't match, do nothing to the member
																return member;
															}
														}
													);

												//update the temporary changes made to edit member popup roles, if pressed x for main save, it will still undo everything else
												updatePendingProject(
													projectAfterTeamChanges
												);
											}}>
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
													className="project-editor-extra-info">
													Are you sure you want to
													delete{" "}
													<span className="project-info-highlight">
														{member.user?.firstName}{" "}
														{member.user?.lastName}
													</span>{" "}
													from the project? This
													action cannot be undone.
												</div>
												<div className="project-editor-button-pair">
													<PopupButton
														className="delete-button"
														callback={() => {
															if (!currentMember) {
																setErrorAddMember("no member selected");
																return;
															}
															if (!currentMember.user || !currentMember.user.userId) {
																setErrorAddMember("Member is missing user information")
																return;
															} //no deleting project owner
															if (currentMember.user.userId === projectAfterTeamChanges.owner?.userId) {
																setErrorAddMember("Owner cannot be removed");
																return;
															}

															if ("localId" in currentMember) {
																try {
																	dataManager?.deleteMember(
																		{
																			id: {
																				type: "local",
																				value: currentMember
																					.user
																					.userId
																			},
																			data: null
																		}
																	);
																} catch (e) {
																	console.error(e);
																	setErrorAddMember("Failed to delete member");
																	return;
																}
															} else {
																try {
																	dataManager?.deleteMember(
																		{
																			id: {
																				type: "canon",
																				value: currentMember
																					.user
																					.userId
																			},
																			data: null
																		}
																	);
																} catch (e) {
																	console.error(e);
																	setErrorAddMember("Failed to delete member");
																	return;
																}
															}
															projectAfterTeamChanges.members =
																projectAfterTeamChanges.members.filter(
																	(member) =>
																		member
																			.user
																			?.userId !==
																		currentMember
																			.user
																			?.userId
																);
															updatePendingProject(
																projectAfterTeamChanges
															);
														}}>
														Delete
													</PopupButton>
													<PopupButton
														buttonId="team-delete-member-cancel-button"
														className="button-reset">
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
														member.user?.userId ===
														currentMember?.user
															?.userId
												)
											);
										}}>
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
						callback={() => setCurrentMember(undefined)}>
						<ThemeIcon
							id="add-person"
							width={74}
							height={74}
							className="header-color-fill"
							ariaLabel="add member"
						/>
						<div id="project-team-add-member-text">
							Invite Member
						</div>
					</PopupButton>
					<PopupContent useClose={true}>
						<div id="project-team-add-member-title">
							Invite Member
						</div>
						<div
							className={successAddMember ? "success" : "error"}
							id="error-add-member">
							{errorAddMember}
						</div>
						<div id="project-team-add-member-info">
							<label id="project-team-add-member-name">
								Name <span className="requiredAsterisk">*</span>
							</label>
							<div id="user-search-container">
								<Dropdown>
									<DropdownButton buttonId="user-search-dropdown-button">
										<SearchBar
											key={searchBarKey}
											value={searchQuery}
											onChange={(e) =>
												setSearchQuery(e.target.value)
											}
											dataSets={[
												{ data: searchableUsers }
											]}
											onSearch={(results) => {
												handleSearch(
													results as UserPreview[][]
												);
											}}
											placeholderText='Search by Name'>
										</SearchBar>
									</DropdownButton>
									<DropdownContent>
										<div id="user-search-results">
											{searchResults.map(
												(user, index) => (
													<DropdownButton
														key={user.userId}
														className={`user-search-item
                            ${index === 0 ? "top" : ""}
                            ${index === searchResults.length - 1 ? "bottom" : ""}`}
														callback={() =>
															user &&
															handleUserSelect(
																user as UserPreview
															)
														}>
														<p className="user-search-name">
															{user.firstName}{" "}
															{user.lastName}
														</p>
														<p className="user-search-username">
															{user.username}
														</p>
													</DropdownButton>
												)
											)}
										</div>
									</DropdownContent>
								</Dropdown>
							</div>
							<label id="project-team-add-member-role">
								Role <span className="requiredAsterisk">*</span>
							</label>
							<Select key={selectKey}>
								<SelectButton
									placeholder="Select"
									initialVal=""
									type="input"
									searchable={true}
								/>
								<SelectOptions
									callback={(e) => {
										setCurrentMember({
											...emptyMember,
											...currentMember,
											role:
												allRoles.find(
													({ label }) =>
														label ===
														(
															e.target as HTMLButtonElement
														).value
												) ?? null
										});
									}}
									options={allRoles.map(({ label }) => {
										return {
											markup: <>{label}</>,
											value: label,
											disabled: false
										};
									})}
								/>
							</Select>
							<label id="project-team-add-member-message-label">
								Message
							</label>
							<textarea
								id="project-team-add-member-message-text"
								value={messageText}
								onChange={(e) =>
									setMessageText(e.target.value)
								}></textarea>
						</div>
						<div className="requiredText">
							<span className="requiredAsterisk">*</span> Indicates required field
						</div>
						{/* Action buttons */}
						<div className="project-editor-button-pair">
							<PopupButton
								buttonId="team-add-member-add-button"
								callback={() => handleNewMember()}
								doNotClose={() => !closePopup}>
								Invite
							</PopupButton>
							<PopupButton
								buttonId="team-add-member-cancel-button"
								callback={() => {
									setCurrentMember(emptyMember);
									setErrorAddMember("");
									handlePopupReset();
								}}
								className="button-reset">
								Cancel
							</PopupButton>
						</div>
					</PopupContent>
				</Popup>
			</div>
		),
		[projectAfterTeamChanges, successAddMember, errorAddMember, searchBarKey, searchQuery, searchableUsers, searchResults, selectKey, allRoles, messageText, currentMember, dataManager, updatePendingProject, handleSearch, handleUserSelect, handleNewMember, closePopup]
	);
	// Renders the open positions interface with job listings and position editing functionality.
	const openPositionsContent: JSX.Element = useMemo(
		() => (
			<div id="project-team-open-positions-info">
				{/* left container */}
				<div className="positions-popup-list">
					<div id="team-positions-popup-list-header">
						Open Positions
					</div>
					<div id="team-positions-popup-list-buttons">
						{projectAfterTeamChanges.jobs?.map((job) => (
							<div
								key={
									"jobId" in job
										? job.jobId + "-canon"
										: job.localId + "-local"
								}
								className="team-positions-button">
								<button
									className="positions-popup-list-item"
									data-id={
										"jobId" in job ? job.jobId : job.localId
									}
									data-id-type={
										"jobId" in job ? "canon" : "local"
									}
									onClick={() => {
										if (!editMode) {
											setCurrentJob(job);
										}
									}}>
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
								}}>
								<i className="fa fa-plus" />
								<p className="project-editor-extra-info">
									Add position
								</p>
							</button>
						</div>
					</div>
				</div>
				{/* right container */}
				<div className="positions-popup-info-wrapper">
					<div
						className="positions-popup-info"
						id={editMode ? "positions-popup-list-edit" : ""}>
						{/* {positionWindowContent} */}
						{positionWindow}
					</div>
				</div>
			</div>
		),
		[
			addPositionCallback,
			editMode,
			positionWindow,
			projectAfterTeamChanges.jobs
		]
	);

	// Set content depending on what tab is selected
	const teamTabContent =
		currentTeamTab === 0 ? (
			currentTeamContent
		) : currentTeamTab === 1 ? (
			currentRequestsContent
		) : currentTeamTab === 2 ? (
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
						setCurrentTeamTab(
							0
						); /*setTeamTabContent(currentTeamContent);*/
					}}
					className={`button-reset project-editor-team-tab ${currentTeamTab === 0 ? "team-tab-active" : ""}`}>
					Current Team{" "}
					{isTeamMembersUnsaved && (
						<span className="unsaved-indicator">(Unsaved)</span>
					)}
				</button>
				<button
					onClick={() => {
						setCurrentTeamTab(1);
					}}
					className={`button-reset project-editor-team-tab ${currentTeamTab === 1 ? "team-tab-active" : ""}`}
				>
					Pending Requests {isPendingRequestsUnsaved && <span className="unsaved-indicator">(Unsaved)</span>}
				</button>
				<button
					onClick={() => {
						setCurrentTeamTab(
							2
						); /*setTeamTabContent(openPositionsContent);*/
					}}
					className={`button-reset project-editor-team-tab ${currentTeamTab === 2 ? "team-tab-active" : ""}`}>
					Open Positions{" "}
					{isOpenPositionsUnsaved && (
						<span className="unsaved-indicator">(Unsaved)</span>
					)}
				</button>
			</div>

			<div id="project-editor-team-content">
				{teamTabContent}
				{/* Merge another project's whole team into this one (invite-based).
				    Owner-only: non-owner members can't merge another team into this project. */}
				{currentTeamTab === 0 && currentUserId === projectAfterTeamChanges.owner?.userId && (
					<MergeProjectTeam
						dataManager={dataManager}
						targetProjectId={projectAfterTeamChanges.projectId as number}
						currentMembers={projectAfterTeamChanges.members}
						ownerUserId={currentUserId ?? projectAfterTeamChanges.owner?.userId ?? null}
						pendingInvitations={pendingInvitations}
						setPendingInvitations={setPendingInvitations}
						onInvitesQueued={() => updatePendingProject(structuredClone(projectAfterTeamChanges))}
					/>
				)}
			</div>

			<div id="team-save-info">
				<div className="editor-save-actions">
					<Popup>
						{saveable ? (
							""
						) : (
							<div
								id="invalid-input-error"
								className={"save-error-msg-general"}>
								<p>*{message}*</p>
							</div>
						)}
						{
							// Switches out the save button for a loading icon if the project is saving
							isSaving ?
							(
								// Currently Saving
								<div className='spinning-loader'></div>
							) : (
								// Save is complete or hasn't been pressed
								<PopupButton
									buttonId="project-editor-save"
									callback={() => {
										// Incomplete form: still clickable so the save validation
										// runs, shows the error, and auto-scrolls to the missing field.
										if (!saveable) saveProject?.();
										else setConfirm(true)
									}}>
									Save Changes
								</PopupButton>
							)
						}

						{confirm ?
							<PopupContent useClose={false} callback={() => setConfirm(false)}>
								<div id="confirm-editor-save-text">
									Are you sure you want to save all changes?
								</div>
								<div id="confirm-editor-save">
									<PopupButton
										callback={saveProject}
										closeParent={closeOuterPopup}
										buttonId="project-editor-save">
										Confirm
									</PopupButton>
									<PopupButton buttonId="team-edit-member-cancel-button">
										Cancel
									</PopupButton>
								</div>
							</PopupContent> : ""
						}
					</Popup>

					{
						// Hides the delete project button if the project is currently saving
						isSaving ?
						(
							// Just here for blank space and to prevent 
							// accidental deletion while a project is saving
							""
						) : (
							<DeleteProjectButton
								projectID={unmodifiedProject.projectId}
								projectTitle={unmodifiedProject.title}
							/>
						)
					}
				</div>
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
