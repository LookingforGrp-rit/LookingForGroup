import { useState, useRef, FC, Dispatch, SetStateAction, useEffect, useCallback, useMemo } from "react";
import { Popup, PopupButton, PopupContent } from "../Popup";
import { GeneralTab } from "./tabs/GeneralTab";
import { MediaTab } from "./tabs/MediaTab";
import { LinksTab } from "./tabs/LinksTab";
import { TeamTab } from "./tabs/TeamTab";
import { TagsTab } from "./tabs/TagsTab";
import { ThemeIcon } from "../ThemeIcon";
import * as paths from '../../constants/routes';
import {
  createNewProject,
  getProjectSocials,
  updateProjectSocial,
  addProjectSocial,
  deleteProjectSocial,
  getByID,
  requestProjectReview,
} from "../../api/projects";
import { ProjectContext as ProjectContextEnums, ProjectStatus as ProjectStatusEnums, ProjectApprovalStatus as ApprovalStatus } from "@looking-for-group/shared/enums";
import { getCurrentAccount, getProjectsByUser, getUsersById, getCurrentUsername } from "../../api/users";
import { projectDataManager } from "../../api/data-managers/project-data-manager";
import { Pending, PendingProject, PendingProjectMember } from "../../../types/types";
import { Medium, ProjectFollowers, ProjectImage, ProjectJob, ProjectMember, ProjectContext, ProjectSocial, ProjectStatus, ProjectVideo, ProjectWithFollowers, Tag, UserDetail, Visibility, MemberRequests, } from '@looking-for-group/shared';
import { useNavigate } from "react-router-dom";
import { setIsSaving, getIsSaving } from "../pages/MyProjects";

type ApprovalStatusKey = keyof typeof ApprovalStatus;

// NO COMMENTS FOR WHAT THESE ARE??????
interface Props {
  // If this project already exists to be edited or if it's being created
  newProject: boolean;

  //if the user is currently in mobile view, set to true (default is false)-
  //created for styling of bottom navbar in mobile view
  mobileView: boolean;

  // If true, open the creation editor automatically on mount (used to drop a
  // user straight into project creation, e.g. right after they sign in).
  autoStart?: boolean;

  // Not a real property, set to a variable to a function in the code
  buttonCallback?: (state: boolean) => void;

  // Unused property, don't know why it's here
  updateDisplayedProject?: Dispatch<SetStateAction<ProjectWithFollowers | undefined>>;
  // permissions?: number;

  approvalStatus?: ApprovalStatusKey
}

let dataManager: Awaited<ReturnType<typeof projectDataManager>>;

/**
 * This component enables both creating new projects and editing existing ones. 
 * It provides a tabbed interface for managing different aspects of a project, including general information, media, tags, team members, and social links. 
 * The component is accessed via either the 'edit project' button on project pages or the 'create' button in the sidebar.
 * @returns React component Popup - Renders a modal for creating or editing projects
 */
export const ProjectCreatorEditor: FC<Props> = ({ newProject, mobileView = false, autoStart = false, buttonCallback = () => { }, updateDisplayedProject, approvalStatus, }) => {
  //Get project ID from search parameters
  const urlParams = new URLSearchParams(window.location.search);
  const navigate = useNavigate();

  // --- Hooks ---

  // Stores current project data: represents actual data from the server
  const [projectData, setProjectData] = useState<ProjectWithFollowers>();

  // Stores current project id
  const [projectID, setProjectID] = useState<number>(0);

  // Tracks temporary project data changes before saving: compared against projectData
  const [modifiedProject, setModifiedProject] = useState<PendingProject>();

  const [projectMessages, setProjectMessages] = useState<string[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<MemberRequests[]>([]);
  const [pendingApplications, setPendingApplications] = useState<MemberRequests[]>([]);
  const [pendingRequestsLoaded, setPendingRequestsLoaded] = useState(false);
  const [initialPendingRequests, setInitialPendingRequests] = useState<{
    invitations: MemberRequests[];
    applications: MemberRequests[];
  }>({ invitations: [], applications: [] });

  // Indicates if the data validation has failed: prevents saving when invalid
  const [failCheck, setFailCheck] = useState(false);

  // Tracks which tab is currently active: 0 - general, 1 - Media, 2 - tags, 3 - team, 4 - links
  const [currentTab, setCurrentTab] = useState(0);

  // Error message for member validation (used in TeamTab)
  const [errorAddMember, setErrorAddMember] = useState("");
  // Error message for position addition (used in TeamTab)
  const [errorAddPosition, setErrorAddPosition] = useState("");
  // Error message for Links validation (used in LinksTab)
  const [errorLinks, setErrorLinks] = useState("");

  // Tracker that checks if the project is currently saveable.
  // If this is set to true, the "Save Changes" button is clickable
  const [saveable, setSaveable] = useState(false);

  // Tracks whether the project was successfully saved (prevents deletion on cleanup after save)
  const [saved, setSaved] = useState(true);

  // Tracks if to show the confirmation popup when closing without saving
  const [confirm, setConfirm] = useState(false);

  // Tracks the error message to display when missing required fields
  const [message, setMessage] = useState("");

  //tracks if title is unique
  const [isUniqueTitle, setIsUniqueTitle] = useState(true);

  // Component Refs
  const exitButton = useRef(null);
  const startButton = useRef(null);

  // Tracks details on the current user, used when creating a project, not when editing
  const [currentUser, setCurrentUser] = useState<UserDetail>();

  
  // Check if the current project can be saved
  let valid = false;
  if ((modifiedProject?.title != "" && modifiedProject?.title != undefined && modifiedProject?.title != null)
    && (isUniqueTitle)
    && (modifiedProject?.hook != "" && modifiedProject?.hook != undefined)
    && (modifiedProject?.description != "" && modifiedProject?.description != undefined)
    && (modifiedProject?.tags?.length !== 0)
    && (modifiedProject?.mediums?.length !== 0)) {
    valid = true;
  }

  if (valid != saveable) {
    setSaveable(valid);
  }

  const setup = async () => {
    // Load existing project
    try {
      // const response = await getByID(Number(projectID));
      // if (!response.data) return;

      dataManager = await projectDataManager(projectID);

      const data = dataManager.getSavedProject();

      setProjectData(data);
      setModifiedProject(data);
    } catch (err) {
      console.error("Error loading existing project:", err);
    }
  }

  /**
   * update the red missing fields message to show what is missing from the page
   */
  const updateMessage = async () => {
    let newMessage = "";
    if (modifiedProject?.title === "" || modifiedProject?.title === undefined) newMessage = "Project is missing a title!";
    else if (modifiedProject?.mediums.length == 0) newMessage = "Project is missing a project type!";
    else if (modifiedProject?.tags.length == 0) newMessage = "Project is missing tags!";
    else if (modifiedProject?.hook === "" || modifiedProject?.hook === undefined) newMessage = "Project is missing a short description!";
    else if (modifiedProject?.description === "" || modifiedProject?.description === undefined) newMessage = "Project is missing a description!";

    setMessage(newMessage);
  }

  /**
   * faster version of updateMessage, for use with updateDisplayedProject()
   * @param updatedPendingProject - parameter of updateDisplayedProject, using is faster than trying for modifiedProject
   */
  const fastUpdateMessage = (updatedPendingProject: PendingProject) => {
    let newMessage = "";
    if (updatedPendingProject.title !== null && updatedPendingProject.title !== undefined) { getUniqueProjectTitle(updatedPendingProject?.title, projectID); }
    if(getIsSaving())
    {
        newMessage = "Project is saving! Please wait a moment!"
    }
    else
    {
      newMessage = "Project cannot have same title as existing project!"; //for some reason, the initial newMessage value pops up if you've met all the requirements *and then* change title to a duplicate name. so, default value is now the duplicate title error text
      if (updatedPendingProject.title === "" || updatedPendingProject.title === undefined) newMessage = "Project is missing a title!";
      else if (!isUniqueTitle) newMessage = "Project cannot have same title as existing project!";
      else if (updatedPendingProject.hook === "" || updatedPendingProject.hook === undefined) newMessage = "Project is missing a Short Description!";
      else if (updatedPendingProject.description === "" || updatedPendingProject.description === undefined) newMessage = "Project is missing a Project Overview!";
      else if (updatedPendingProject.mediums.length == 0) newMessage = "Project is missing a project type!";
      else if (updatedPendingProject.tags.length == 0) newMessage = "Project is missing tags!";
    }

    setMessage(newMessage);
  }

  // Start editing the project creator
  const createOrEdit = async () => {
    const res = await getCurrentUsername();
    if (!(res.status === 200 && res.data?.username)) {
      //redirect user to login if they aren't logged in, remembering that they
      //wanted to create a project so we can drop them straight into the editor
      //once they're signed in
      navigate(paths.routes.LOGIN, {
        state: { from: { pathname: paths.routes.MYPROJECTS, search: '?create=1' } },
      });
      return;
    }
    else {
      const user = await getUsersById(res.data.userId);
      if (user.data)
        await setCurrentUser(user.data);
    }
    setSaved(true);
    setConfirm(false);

    if(getIsSaving())
    {
      setMessage("Project is saving! Please wait a moment!");
    }
    else
    {
        
      setMessage("Project is missing a Short Description!");
    }

    if (newProject) {
      // Setup default project for creation
      const newData = {
        title: "My Project",
        description: "",
        context: null,
        status: "Planning",
        audience: "",
        globalVisibility: "public",
        projectImages: [] as ProjectImage[],
        projectSocials: [] as ProjectSocial[],
        projectVideos: [] as ProjectVideo[],
        jobs: [] as ProjectJob[],
        members: [{
          user: currentUser ?? (await getCurrentAccount()).data,
          role: {
            roleId: 77,
            label: "Owner"
          },
          memberSince: new Date(Date.now()),
          apiUrl: "api/user/" + currentUser?.userId
        }] as ProjectMember[],
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now()),
        followers: {} as ProjectFollowers,
        tags: [] as Tag[],
        mediums: [] as Medium[],
        approved: false,
        owner: {...currentUser ?? (await getCurrentAccount()).data}
      } as ProjectWithFollowers;

      setProjectData(newData);
      setModifiedProject(newData);
    }
    else if (projectID) {
      // Closing the editor clears projectData but leaves `dataManager` set, so
      // gating on `!dataManager` meant setup() never re-ran on reopen and the
      // editor came up empty. Reload whenever the project data is missing.
      if (projectData === undefined)
        setup();
    }


    if (startButton.current) {
      (startButton.current as unknown as HTMLElement).focus();
    }
  }

  // When asked to auto-start (e.g. the user just signed in after clicking
  // "Create Project"), initialize and open the creation editor once on mount.
  const autoStarted = useRef(false);
  useEffect(() => {
    if (autoStart && newProject && !autoStarted.current) {
      autoStarted.current = true;
      createOrEdit();
    }

    if (!newProject && projectID) setup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoStart, newProject, projectID]);

  /**
   * Collects and validates all link information from the LinksTab
   * Updates the modifiedProject state with valid link data
   * Sets error messages for invalid link data
   * @returns void
   */
  const updateLinks = async () => {
    if (!projectID) return;
    try {
      // Get current socials from database
      const currentSocialsResponse = await getProjectSocials(projectID);
      const currentSocials = currentSocialsResponse.data || [];

      // Process each social in the modified project
      for (const social of modifiedProject?.projectSocials || []) {
        if (!social.url || !social.websiteId || !social.alias || social.websiteId === 0) continue;

        // If there is an existing social ID, update it; otherwise, add a new social
        if (social.id) {
          await updateProjectSocial(projectID, social.id, {
            url: social.url,
            alias: social.alias,
            websiteId: social.websiteId,
          });
        } else {
          await addProjectSocial(projectID, {
            websiteId: social.websiteId,
            alias: social.alias,
            url: social.url,
          });
        }

        // Delete socials that were removed
        const modifiedSocialIds = (modifiedProject?.projectSocials || [])
          .filter(s => s.url && s.websiteId && s.websiteId !== 0)
          .map(s => s.id);

        for (const currentSocial of currentSocials) {
          if (!modifiedSocialIds.includes(currentSocial.id)) {
            await deleteProjectSocial(projectID, currentSocial.id);
          }
        }
      }
    } catch (error) {
      console.error('Error updating social links:', error);
      setErrorLinks('Error updating social links. Please try again.');
    }
  };

  const close = useCallback(() => {
    setConfirm(false);
    setSaved(true);
    setCurrentTab(0);
    setProjectData(undefined);
    setModifiedProject(undefined);
    buttonCallback(false);
  }, []);

  useEffect(() => {
    window.onbeforeunload = () => { if (!saved) return ' ' };

    // if not a new project, get project id from url (existing project)
    if (!newProject) setProjectID(Number(urlParams.get("projectID")));
  }, [open, projectID, newProject, saved]);

  const toggleConfirm = async () => {
    if (saved) {
      buttonCallback(false);
      setCurrentTab(0);
    }
    else
      // Set (don't toggle): every close attempt with unsaved changes must SHOW
      // the confirm. Toggling let a second outside-click silently dismiss it.
      setConfirm(true);
  }

  /** Dismisses the "exit without saving" dialog and stays in the editor. */
  const cancelConfirm = () => setConfirm(false);

  /**
   *  Updates boolean value of isUniqueTitle based on if the desired title
   * is a duplicate of one of the user's existing projects or not
   */
  const getUniqueProjectTitle = async (
    desiredTitle: string,
    currentProjectId: number
  ): Promise<void> => {
    const base = desiredTitle.trim();

    const res = await getProjectsByUser();
    const projects = res.data ?? [];

    // Lower-cased titles of the user's OTHER projects
    const takenNames = new Set(
      projects
        .filter((p) => p.projectId !== currentProjectId)
        .map((p) => p.title.trim().toLowerCase())
    );

    if (takenNames.has(base.toLowerCase())) {
      setIsUniqueTitle(false);
    } else {
      setIsUniqueTitle(true);
    }
    // Find the lowest available "(n)" suffix
    // let n = 1;
    // while (takenNames.has(`${base}(${n})`.toLowerCase())) {
    //   n++;
    // }
    // return `${base}(${n})`;
  };

  /**
   * Jumps the editor to the first missing/invalid required field after a failed
   * save: switches to the tab that contains it, scrolls it into view, and
   * flashes a highlight so the user can see exactly what blocked the save.
   */
  const scrollToInvalidField = () => {
    // First failing required field, checked in the same order the save
    // validation reports them. [tab index, element id]
    let tab: number;
    let elementId: string;

    if (!modifiedProject?.title || !isUniqueTitle) {
      tab = 0; elementId = "project-editor-title-input";
    } else if (!modifiedProject.hook) {
      tab = 0; elementId = "project-editor-description-input";
    } else if (!modifiedProject.description) {
      tab = 0; elementId = "project-editor-long-description-input";
    } else if (!modifiedProject.status) {
      tab = 0; elementId = "project-editor-status-input";
    } else if (modifiedProject.mediums.length === 0) {
      tab = 2; elementId = "project-editor-type-tags";
    } else if (modifiedProject.tags.length === 0) {
      tab = 2; elementId = "project-editor-tag-search";
    } else {
      return;
    }

    setCurrentTab(tab);

    // Wait a beat so the target tab's content is mounted before scrolling.
    window.setTimeout(() => {
      const el = document.getElementById(elementId);
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("field-invalid-flash");
      window.setTimeout(() => el.classList.remove("field-invalid-flash"), 2000);
    }, 100);
  };

  const updateFailCheck = useMemo(() => {
    if (!saveable) return true;
    // default to no errors
    setFailCheck(false);

    // save if on link tab
    //if (currentTab === 4) await updateLinks();

    //Error Handling
    if (errorAddMember !== "" || errorAddPosition !== "" || errorLinks !== "") {
      setFailCheck(true);
      return true;
    }

    if (modifiedProject?.title !== null && modifiedProject?.title !== "" && modifiedProject?.title !== undefined) {
      setFailCheck(true);
      return true;
    }

    //pops up error text if required fields in general haven't been filled out
    if (
      !modifiedProject?.title ||
      !isUniqueTitle ||
      !modifiedProject.description ||
      !modifiedProject.status ||
      !modifiedProject.hook
    ) {
      setFailCheck(true);
      return true;
    }

    //pops up error text if no tags have been chosen
    if (
      modifiedProject.tags.length == 0 ||
      modifiedProject.mediums.length == 0
    ) {
      setFailCheck(true);
      return true;
    }

    return false;

  }, [setFailCheck, modifiedProject, errorAddMember, errorAddPosition, errorLinks, isUniqueTitle, saveable]);

  /**
   * Handles saving project changes to the server, validates input data before saving
   * For existing projects: updates thumbnails, images, positions, and project information
   * For new projects: creates the project and adds images and thumbnails
   * Handles errors during the save process
   * @returns Promise<void>
   */
  const saveProject = async () => {
    
    // default to no errors
    setFailCheck(false);

    // save if on link tab
    //if (currentTab === 4) await updateLinks();

    //Error Handling
    if (errorAddMember !== "" || errorAddPosition !== "" || errorLinks !== "") {
      await setFailCheck(true);
      return;
    }

    if (modifiedProject?.title !== null && modifiedProject?.title !== "" && modifiedProject?.title !== undefined) {
      getUniqueProjectTitle(modifiedProject?.title, projectID);
    }

    //pops up error text if required fields in general haven't been filled out
    if (
      !modifiedProject?.title ||
      !isUniqueTitle ||
      !modifiedProject.description ||
      !modifiedProject.status ||
      !modifiedProject.hook
    ) {
      const errorText = document.getElementById("invalid-input-error");
      await setFailCheck(true);

      if (errorText) {
        errorText.style.display = "block";
      }
      // Take the user to the missing field instead of failing silently.
      scrollToInvalidField();
      return;
    }

    //pops up error text if no tags have been chosen
    if (
      modifiedProject.tags.length == 0 ||
      modifiedProject.mediums.length == 0
    ) {
      const errorText = document.getElementById("invalid-input-error");
      await setFailCheck(true);

      if (errorText) {
        errorText.style.display = "block";
      }
      // Take the user to the missing tags/medium section.
      scrollToInvalidField();
      return;
    }

    if (modifiedProject?.projectSocials) {
      for (let i: number = 0; i < modifiedProject.projectSocials.length; i++) {
        if (!modifiedProject.projectSocials[i].url || modifiedProject.projectSocials[i].url?.trim() == "") {
          continue;
        }
        else if (!(modifiedProject.projectSocials[i].url?.startsWith("https://") ||
          modifiedProject.projectSocials[i].url?.startsWith("http://"))) {
          modifiedProject.projectSocials[i].url = "https://" + modifiedProject.projectSocials[i].url;
        }
      }
    }

    setCurrentTab(0);

    // Prevent duplicate project names in the user's project list.
    // If the title collides with another of their projects, auto-rename it
    // (e.g. "ProjectTitle" -> "ProjectTitle(1)").

    // if (uniqueTitle !== modifiedProject.title) {
    //   dataManager.updateFields({
    //     id: { value: projectID, type: "canon" },
    //     data: { title: uniqueTitle },
    //   });
    //   setModifiedProject({ ...modifiedProject, title: uniqueTitle });
    // }

    try {
      // Used to set the save changes button to a loading icon
      await setIsSaving(true);

      // EXISTING PROJECT
      if (!newProject && projectID) {
        //Updates display automatically when adding members        
        await updateLinks();
        await dataManager.saveChanges();

        if (updateDisplayedProject) {
          const freshResp = await getByID(projectID);
          if (freshResp.data) {
            updateDisplayedProject(freshResp.data);
          } else {
            updateDisplayedProject(dataManager.getSavedProject());
          }
        }
      } else if (newProject) {
        const newStatus = Object.keys(ProjectStatusEnums).find(
          key => ProjectStatusEnums[key as keyof typeof ProjectStatusEnums] === modifiedProject.status)
        const newContext = Object.keys(ProjectContextEnums).find(
          key => ProjectContextEnums[key as keyof typeof ProjectContextEnums] === modifiedProject.context)

        const response = await createNewProject({
          title: modifiedProject?.title as string,
          hook: modifiedProject?.hook,
          description: modifiedProject?.description,
          audience: modifiedProject?.audience as string,
          globalVisibility: modifiedProject?.globalVisibility as Visibility,
          status: newStatus as ProjectStatus,
          context: newContext as ProjectContext,
        });

        if (!response.error && response.data) {
          dataManager = await projectDataManager(response.data.projectId);
          setProjectID(response.data.projectId);

          /* PROJECT IMAGES */
          for (const image of modifiedProject.projectImages) {
            await dataManager.createImage({
              id: {
                type: "local",
                value: (image as ProjectImage).imageId
              },
              data: {
                image: image.image as File,
                altText: (image as ProjectImage).altText,
              }
            })
          }
          if (modifiedProject.thumbnail)
            dataManager.updateThumbnail({
              id: {
                value: projectID,
                type: "local",
              },
              data: {
                thumbnail: (modifiedProject.thumbnail as ProjectImage).imageId as number
              }
            });

          /* PROJECT VIDEOS */
          for (const video of modifiedProject.projectVideos as ProjectVideo[]) {
            await dataManager?.createVideo({
              id: {
                value: video.videoId,
                type: "local"
              },
              data: { ...video },
            });
          }

          /* PROJECT TAGS */
          for (const tag of modifiedProject.tags) {
            await dataManager.addTag({
              id: {
                type: "local",
                value: tag.tagId,
              },
              data: {
                tagId: tag.tagId,
                displayOrder: modifiedProject.tags.indexOf(tag),
              }
            });
          }

          /* PROJECT MEDIUMS */
          for (const medium of modifiedProject.mediums) {
            await dataManager.addMedium({
              id: {
                type: "local",
                value: medium.mediumId,
              },
              data: {
                mediumId: medium.mediumId,
              }
            })
          }

          /* PROJECT MEMBERS */
          for (const member of modifiedProject.members) {
            if (member.user?.userId === currentUser?.userId) continue;
            dataManager.createMember({
              id: {
                type: "canon",
                value: (member as PendingProjectMember).localId as number,
              },
              data: {
                prospectiveMemberId: (member as PendingProjectMember).user?.userId as number,
                // use project owner as inviter if current user id is not loaded for some reason (shouldn't happen but just in case)
                ownerUserId: (currentUser?.userId ?? modifiedProject.owner?.userId) as number,
                roleId: member.role?.roleId as number,
                message: projectMessages[modifiedProject.members.indexOf(member)],
              }
            })
          }

          /* PROJECT JOBS */
          for (const job of modifiedProject.jobs) {
            dataManager.createJob({
              id: {
                type: "local",
                value: (job as Pending<ProjectJob>).localId as number,
              },
              data: {
                availability: (job as ProjectJob).availability,
                compensation: (job as ProjectJob).compensation,
                contactUserId: (job as ProjectJob).contact.userId,
                jobStart: (job as ProjectJob).jobStart,
                jobEnd: (job as ProjectJob).jobEnd,
                location: (job as ProjectJob).location,
                roleId: (job as ProjectJob).role.roleId,
                description: job.description ?? undefined,
                jobSkills: (job as ProjectJob).jobSkills
              }
            })
          }

          /* PROJECT SOCIALS */
          for (const link of modifiedProject.projectSocials) {
            await dataManager.addSocial({
              id: {
                type: "local",
                value: link.id as number,
              },
              data: link as ProjectSocial,
            })
          }

          await dataManager.saveChanges();
        }
      }
      
      // Mark project as saved so cleanup won't delete it
      setSaved(true);
      setProjectData(dataManager.getSavedProject());
      // Remove the unload blocker before reloading the page, otherwise the prior
      // `saved === false` closure can still fire and trigger a browser prompt.
      window.onbeforeunload = null;
      window.location.reload();
      // projectID !== 0
      // ? window.location.reload()
      // : navigate(`${paths.routes.PROJECT}?projectID=${dataManager.getSavedProject().projectId}`);
    } catch (err) {
      console.error(err);
    }
    
  };

  const updatePendingProject = (updatedPendingProject: PendingProject) => {
    setModifiedProject(updatedPendingProject);
    setSaved(false);
    fastUpdateMessage(updatedPendingProject);
  }

  const generalTabInvalid = !modifiedProject?.title || !modifiedProject?.hook || !modifiedProject?.description;
  const tagsTabInvalid = modifiedProject?.tags?.length === 0 || modifiedProject?.mediums?.length === 0;
  const teamTabInvalid = errorAddMember !== "" || errorAddPosition !== "";
  const linksTabInvalid = errorLinks !== "";

  return (
    <Popup startOpen={autoStart && newProject}>
      {newProject ? (
        <PopupButton callback={() => { buttonCallback(true); createOrEdit(); }} buttonId={`project-info-create`}>
          {" "}
          <ThemeIcon
            id={"create"}
            width={25}
            height={25}
            className={"color-fill"}
            ariaLabel={"create"}
          />{" "}
          {!mobileView ? <p>Create</p> : ""}

        </PopupButton>
      ) : (
        <div id="project-info-contexts">
          <PopupButton callback={() => { buttonCallback(true); createOrEdit(); }} buttonId="project-info-edit">
            Edit Project
          </PopupButton>
          {approvalStatus === "not-approved" ?
            <Popup>
              {/* TODO: add checking if the project is approved/rejected/pending */}
              <PopupButton buttonId="project-info-request" >
                Request Project Review
              </PopupButton>
              <PopupContent>
                <div id="project-request-review">
                  <label id="project-request-label">
                    Would you like to submit your project for review?
                  </label>
                  <div id="project-request-info">
                    Submiting a request will make your project visible to moderators who will choose to either
                    accept and make your project visible to all, request changes for you to make,
                    or reject it for various reasons. <br />
                    <strong>(Moderators are not capable of directly altering or deleting your projects)</strong>
                  </div>
                  <div id="project-request-buttons">
                    <PopupButton buttonId="request-confirm-button"
                      callback={() => {
                        if (projectData) requestProjectReview(projectID);
                      }}
                    >
                      Request Review
                    </PopupButton>
                    <PopupButton buttonId="request-cancel-button">
                      Cancel
                    </PopupButton>
                  </div>
                </div>
              </PopupContent>
            </Popup> : ""}
        </div>
      )}


      <PopupContent callback={toggleConfirm} closeButtonRef={exitButton} confirmation={!saved}>
        {confirm ? <PopupContent confirmation={true} useClose={false}>
          <div id="confirm-editor-save-text">Are you sure you want to exit without saving?</div>
          <div id="confirm-editor-save">
            <PopupButton doNotClose={() => false} callback={close} buttonId="project-editor-save">
              Confirm
            </PopupButton>
            <PopupButton doNotClose={() => true} callback={cancelConfirm} buttonId="team-edit-member-cancel-button" >
              Cancel
            </PopupButton>
          </div>
        </PopupContent> : ""}
        <div id="project-creator-editor">
          <div id="project-editor-tabs">
            <button
              id="general-tab"
              onClick={() => {
                setCurrentTab(0);
              }}
              className={`project-editor-tab ${currentTab === 0 ? "project-editor-tab-active" : ""}`}
              ref={startButton}
            >
              General{generalTabInvalid && <span className="invalid-tab-alert" aria-hidden="true">*</span>}
            </button>
            <button
              id="media-tab"
              onClick={() => {
                setCurrentTab(1);
              }}
              className={`project-editor-tab ${currentTab === 1 ? "project-editor-tab-active" : ""}`}
            >
              Media
            </button>
            <button
              id="tags-tab"
              onClick={() => {
                setCurrentTab(2);
              }}
              className={`project-editor-tab ${currentTab === 2 ? "project-editor-tab-active" : ""}`}
            >
              Tags{tagsTabInvalid && <span className="invalid-tab-alert" aria-hidden="true">*</span>}
            </button>
            <button
              id="team-tab"
              onClick={() => {
                setCurrentTab(3);
              }}
              className={`project-editor-tab ${currentTab === 3 ? "project-editor-tab-active" : ""}`}
            >
              Team{teamTabInvalid && <span className="invalid-tab-alert" aria-hidden="true">*</span>}
            </button>
            <button
              id="links-tab"
              onClick={() => {
                setCurrentTab(4);
              }}
              className={`project-editor-tab ${currentTab === 4 ? "project-editor-tab-active" : ""}`}
            >
              Links{linksTabInvalid && <span className="invalid-tab-alert" aria-hidden="true">*</span>}
            </button>
          </div>

          <div id="project-editor-content" className={newProject ? 'project-creator' : ''} >
            {projectData && modifiedProject ? (currentTab === 0 ? (
              <GeneralTab
                dataManager={dataManager}
                projectData={modifiedProject}
                unmodifiedProject={projectData}
                updatePendingProject={updatePendingProject}
                saveProject={saveProject}
                saveable={saveable}
                failCheck={failCheck}
                updateFailCheck={updateFailCheck}
                message={message}
                isSaving={getIsSaving()}
              />
            ) : currentTab === 1 ? (
              <MediaTab
                dataManager={dataManager}
                projectData={modifiedProject}
                unmodifiedProject={projectData}
                updatePendingProject={updatePendingProject}
                saveProject={saveProject}
                saveable={saveable}
                failCheck={failCheck}
                updateFailCheck={updateFailCheck}
                message={message}
                isSaving={getIsSaving()}
              />
            ) : currentTab === 2 ? (
              <TagsTab
                dataManager={dataManager}
                projectData={modifiedProject}
                unmodifiedProject={projectData}
                updatePendingProject={updatePendingProject}
                saveProject={saveProject}
                saveable={saveable}
                failCheck={failCheck}
                updateFailCheck={updateFailCheck}
                message={message}
                isSaving={getIsSaving()}
              />
            ) : currentTab === 3 ? (
              <TeamTab
                dataManager={dataManager}
                updatePendingProject={updatePendingProject}
                saveProject={saveProject}
                projectData={modifiedProject}
                unmodifiedProject={projectData}
                pendingInvitations={pendingInvitations}
                pendingApplications={pendingApplications}
                setPendingInvitations={setPendingInvitations}
                setPendingApplications={setPendingApplications}
                pendingRequestsLoaded={pendingRequestsLoaded}
                setPendingRequestsLoaded={setPendingRequestsLoaded}
                initialPendingRequests={initialPendingRequests}
                setInitialPendingRequests={setInitialPendingRequests}
                setErrorMember={setErrorAddMember}
                setErrorPosition={setErrorAddPosition} /*permissions={permissions}*/
                saveable={saveable}
                failCheck={failCheck}
                updateFailCheck={updateFailCheck}
                message={message}
                messages={projectMessages}
                setMessages={setProjectMessages}
                isSaving={getIsSaving()}
              />
            ) : currentTab === 4 ? (
              <LinksTab
                dataManager={dataManager}
                projectData={modifiedProject}
                unmodifiedProject={projectData}
                saveProject={saveProject}
                updatePendingProject={updatePendingProject}
                setErrorLinks={setErrorLinks}
                saveable={saveable}
                failCheck={failCheck}
                updateFailCheck={updateFailCheck}
                message={message}
                currentUser={currentUser as UserDetail}
                isSaving={getIsSaving()}
              />
            ) : (
              <></>
            )) : (
              <></>
            )}
          </div>

          {/*Focus control*/}
          <div tabIndex={0} onFocus={() => (exitButton.current as unknown as HTMLElement).focus()}></div>

          {/* Responsiveness fix: General Tab has its own button/error text for layout change 
            - This never actually displays anywhere, so I'm commenting it out
          */}
          {/*
          currentTab !== 0 ? (
            <div id="invalid-input-error" className={"save-error-msg"}>
              <p>{message}</p>
            </div>
          ) : (
            <></>
          )
          */}
        </div>
      </PopupContent>

    </Popup>
  );
};

