//Styles
import "../Styles/credits.css";
import "../Styles/discoverMeet.css";
import "../Styles/emailConfirmation.css";
import "../Styles/general.css";
import "../Styles/loginSignup.css";
import "../Styles/profile.css";
import "../Styles/projects.css";
import "../Styles/settings.css";
import "../Styles/pages.css";

import { useState, useCallback, useEffect, useRef, useMemo, /*useContext*/ } from "react";
import { useNavigate } from "react-router-dom";
import * as paths from "../../constants/routes";
import { Header, loggedIn } from "../Header";
import { PanelBox } from "../PanelBox";
import { ProfileEditPopup } from "../Profile/ProfileEditPopup";
import { Dropdown, DropdownButton, DropdownContent } from "../Dropdown";
import { Popup, PopupButton, PopupContent } from "../Popup";
import { Select, SelectButton, SelectOptions } from "../Select";
import { ThemeIcon } from "../ThemeIcon";
import { ShareButton } from "../ShareButton";
// import { ProfileInterests } from "../Profile/ProfileInterests";
import Reporter from "../Reporter";
import profilePicture from "../../images/lfrog.png";
import { getVisibleProjects, getProjectsByUser, addUserFollowing, deleteUserFollowing, getUserFollowing, getProjectFollowing, getJobTitles, getGalleryImages, getGalleryVideos } from "../../api/users";
import { getUsersById, getCurrentAccount } from "../../api/users";
import { sendInvite } from "../../api/projects";
import { MeDetail, MePrivate, ProjectDetail, ProjectPreview, UserPreview, Role, UserDetail, UserAccessLevel, GalleryImage, GalleryVideo } from '@looking-for-group/shared';
import { RitStatus as RitStatusLabel } from '@looking-for-group/shared/enums';
import usePreloadedImage from "../../functions/imageLoad";
import { reportUser } from "../../api/users";
import { getReportedUsers, getUserAccessLevel, promoteToMod, demoteToUser, deleteUserReport, banUser, sendModeratorNotification, deactivateUserReport } from "../../api/mod-tools";
// import { PopupContext } from "../Popup";
import { UserReport } from "@looking-for-group/shared";
import { Carousel, CarouselButton, CarouselContent, CarouselTabs } from "../ImageCarousel";
import { getYouTubeEmbedID, getYouTubeEmbedURL } from "../../functions/parseYoutube";

type Profile = MeDetail;
//type Tag = UserSkill;
type Project = ProjectPreview;

// Stores if profile is loaded from server and if it's user's respectively
// const [profileLoaded, setProfileLoaded] = useState(false);

/**
 * Profile page with user information collected from profileID.
 * @returns JSX Element
 */
const Profile = (/*userProfile: any*/) => {
  // --------------------
  // Global variables
  // --------------------

  const navigate = useNavigate(); // Hook for navigation

  // Get URL parameters to tell what user we're looking for and store it
  const urlParams = new URLSearchParams(window.location.search);
  // User ID of profile being viewed
  const profileID: string = urlParams.get("userID")!;

  const [isUsersProfile, setIsUsersProfile] = useState<boolean>(false);

  const [displayedProfile, setDisplayedProfile] = useState<UserDetail>();
  const [userID, setUserID] = useState<number>(0);

  const [isUserMod, setIsUserMod] = useState<boolean>(false);
  const [isUserAdmin, setIsUserAdmin] = useState<boolean>(false);

  const [displayedProfileAccessLevel, setDisplayedProfileAccessLevel] = useState<UserAccessLevel>('User');
  const [previousDisplayedProfileAccessLevel, setPreviousDisplayedProfileAccessLevel] = useState<UserAccessLevel>('User');

  const [isFollow, setIsFollow] = useState<boolean>(false); //for the buttons specifically
  const [activeReportList, setActiveReportList] = useState<UserReport[]>([]);
  const [inactiveReportList, setInactiveReportList] = useState<UserReport[]>([]);
  
  const [showGallery, setShowGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [galleryVideos, setGalleryVideos] = useState<GalleryVideo[]>([]);

  // stores all followed users to display on personal user profile
  const [followedProfilesList, setFollowedProfilesList] = useState<UserPreview[]>([]);
  const [followedProjectsList, setFollowedProjectsList] = useState<ProjectPreview[]>([]);

  //boolean if likes tab is displaying projects
  const [isProjectLikesTab, setIsProjectLikesTab] = useState<boolean>(true);

  // Stores all projects
  const [fullProjectList, setFullProjectList] = useState<ProjectPreview[]>([]);
  // Projects displayed for searches
  const [displayedProjects, setDisplayedProjects] = useState<ProjectPreview[]>([]);

  const [majorsArr, setMajorsArr] = useState<string[]>([]);

  // If the user is banned
  const [modActionComplete, setModActionComplete] = useState<boolean>(false);
  const [banned, setBanned] = useState<boolean>(false);

  const reportMessage = useRef<HTMLTextAreaElement>(null);
  const warnMessage = useRef<HTMLTextAreaElement>(null);
  const banMessage = useRef<HTMLTextAreaElement>(null);
  const [reportResponseText, setReportResponseText] = useState<string>('');
  const [promoteResponseText, setPromoteResponseText] = useState<string>('');
  const [demoteResponseText, setDemoteResponseText] = useState<string>('');
  const [banReasonSystemMsg, setBanReasonSystemMsg] = useState<string>('');

  // ---- Invite-to-project popup state (only used when viewing someone else) ----
  // Projects the current logged-in user owns; populated lazily so we don't fetch
  // for guests or for the user's own profile.
  const [myOwnedProjects, setMyOwnedProjects] = useState<ProjectDetail[]>([]);
  const [allRoles, setAllRoles] = useState<Role[]>([]);
  const [inviteProjectId, setInviteProjectId] = useState<number | null>(null);
  const [inviteRoleId, setInviteRoleId] = useState<number | null>(null);
  const [inviteMessage, setInviteMessage] = useState<string>("");
  const [inviteError, setInviteError] = useState<string>("");
  const [inviteSuccess, setInviteSuccess] = useState<boolean>(false);
  const [inviteSending, setInviteSending] = useState<boolean>(false);

  const [followedProjectsIds, setFollowProjectsIds] = useState<Set<number>>(new Set);

  const projectSearchData = fullProjectList?.map(
    (project: Project) => {
      return { name: project.title, description: project.hook };
    }
  );

  // --------------------
  // Page redirect
  // --------------------
  // if we decide to remove the like button all together when user
  // is not loagged in then we do not need these first two functions
  useEffect(() => {
    const load = async () => {
      try {
        const me = await getCurrentAccount();
        if (!me.data) {
          setUserID(-1);
          return;
        }
        await getProfileData(me.data);
      } catch (e) {
        console.error("Failed to load profile:", e);
        setUserID(-1);
      }
    };
    load();
  }, [profileID]);

  useEffect(() => {
    if (userID === undefined) return;

    if (!profileID) {
      if (loggedIn) {
        navigate(`/profile?userID=${userID}`, { replace: true });
      } else {
        navigate(paths.routes.LOGIN, { state: { from: location.pathname + location.search } });
      }
    }
  }, [profileID, userID]);

  //check user following (this one is needed tho)
  useEffect(() => {
    if (userID === undefined || userID === -1) return;

    const loadFollow = async () => {
      const isFollowing = await checkFollow();
      setIsFollow(isFollowing ?? false);
    };
    loadFollow();
  }, [userID, profileID]);

  useEffect(() => {
    if (userID === undefined || userID === -1) return;

    const loadGallery = async () => {
      const imageResponse = await getGalleryImages(userID);
      const videoResponse = await getGalleryVideos(userID);

      if (imageResponse.data)
        setGalleryImages(imageResponse.data);
      //set placeholder until getting works
      else
        setGalleryImages([{
          galleryImageId: 0,
          image: "/src/images/lfrog.png",
          altText: "image 1",
          position: 0,
          userId: userID,
        },{
          galleryImageId: 1,
          image: "/src/images/lfrog.png",
          altText: "image 2",
          position: 1,
          userId: userID,
        },{
          galleryImageId: 2,
          image: "/src/images/lfrog.png",
          altText: "image 3",
          position: 2,
          userId: userID,
        },{
          galleryImageId: 3,
          image: "/src/images/lfrog.png",
          altText: "image 4",
          position: 3,
          userId: userID,
        },{
          galleryImageId: 4,
          image: "/src/images/lfrog.png",
          altText: "image 5",
          position: 4,
          userId: userID,
        },
      ]);

      if (videoResponse.data)
        setGalleryVideos(videoResponse.data);
      //set placeholder until getting works
      else
        setGalleryVideos([{
          galleryVideoId: 0, 
          videoUrl: "https://youtu.be/dQw4w9WgXcQ?si=caowhzEmsuRDRQsm",
          title: "video 1",
          position: 0,
          userId: userID
        },{
          galleryVideoId: 1, 
          videoUrl: "https://youtu.be/dQw4w9WgXcQ?si=caowhzEmsuRDRQsm",
          title: "video 2",
          position: 1,
          userId: userID
        }
      ]);
    }

    loadGallery();
  }, [userID]);

  useEffect(() => {
    //TODO: check if user wants gallery shown
    const response = {data: true};

    if (response.data)
      setShowGallery(response.data);
  })


  // --------------------
  // Helper functions
  // --------------------
  /**
   * Checks if the user is following this user
   * @returns true if following
   */
  const checkFollow = useCallback(async () => {
    if (userID !== -1 && userID !== undefined) {
      const followings = (await getUserFollowing(userID)).data?.users;

      let isFollowing = false;

      if (followings !== undefined) { //if they have no follows then obviously they can't be following the guy we're looking at
        for (const follower of followings) {
          isFollowing = (follower.user.userId === parseInt(profileID))
          if (isFollowing) break;
        }
      }
      setIsFollow(isFollowing);
      return isFollowing;

    }
  }, [profileID, userID])

  /**
     * Checks mod permissions for the user on render (in useEffect). The CURRENT user
     */
  const getUserPermissions = async () => {
    /* Ensures the user is logged in */
    const userAccount = await getCurrentAccount();
    if (userAccount.status === 200 && userAccount.data?.userId) {
      setUserID(userAccount.data?.userId);
      /* User must have mod permissions to access mod page */
      const accessLevel = await getUserAccessLevel(userAccount.data.userId);
      if (accessLevel.data?.toString() == 'Moderator' || accessLevel.data?.toString() == 'Administrator') {
        setIsUserMod(true);
      }
      if (accessLevel.data?.toString() == 'Administrator') {
        setIsUserAdmin(true);
      }
    }
  };

  /**
   * Checks permissions for the user of the DISPLAYED PROFILE on render (in useEffect).
   */
  const getProfileUserPermissions = async () => {
    /* Ensures the user is logged in */
    const userAccount = await getUsersById(parseInt(profileID));
    if (userAccount.status === 200 && userAccount.data?.userId) {
      const accessLevel = await getUserAccessLevel(userAccount.data.userId);
      switch (accessLevel.data?.toString()) {
        case 'User':
          setDisplayedProfileAccessLevel('User');
          setPreviousDisplayedProfileAccessLevel('User');
          break;
        case 'Moderator':
          setDisplayedProfileAccessLevel('Moderator');
          setPreviousDisplayedProfileAccessLevel('Moderator');
          break;
        case 'Administrator':
          setDisplayedProfileAccessLevel('Administrator');
          setPreviousDisplayedProfileAccessLevel('Administrator');
          break;
        default:
          setDisplayedProfileAccessLevel('User');
          setPreviousDisplayedProfileAccessLevel('User');
      }
    }
  };


  /**
   * Checks if the user has been reported and updates the useState
   */
  const isUserReported = async () => {
    const tempActiveList: UserReport[] = [];
    const tempInactiveList: UserReport[] = [];
    const currentUser = parseInt(profileID);
    const reportedUsers = (await getReportedUsers()).data;
    if (reportedUsers !== null && reportedUsers !== undefined) {
      for (const report of reportedUsers) {
        if (report.reportedId === currentUser) {
          if (report.active) {
            if (report.reporterId !== userID) tempActiveList.push(report)
          }
          else {
            tempInactiveList.push(report);
          }
        }
      }
    }
    setActiveReportList(tempActiveList);
    setInactiveReportList(tempInactiveList);
  };

  /**
   * Toggles following the user.
   */
  const followUser = async () => {

    if (!loggedIn) {
      navigate(paths.routes.LOGIN, { state: { from: location.pathname + location.search } }); // Redirect if logged out
    } else {
      //adds the user following
      const toggleFollow = !(await checkFollow());
      setIsFollow(toggleFollow);
      if (toggleFollow) {
        const follow = await addUserFollowing(parseInt(profileID));
        if (follow.status === 401) navigate(paths.routes.LOGIN, { state: { from: location.pathname + location.search } });
      }
      else {
        await deleteUserFollowing(parseInt(profileID)); //this would never show if you weren't logged in
      }
    }
  };

  /**
   * Updates the displayed projects based on the search results.
   * @param searchResults Filtered projects based on the search query.
   */
  const searchProjects = (searchResults: unknown[][]) => {
    const tempProjList: Project[] = [];

    for (const result of searchResults[0]) {
      for (const proj of projectSearchData) {
        if (result === proj.name) {
          if (fullProjectList[projectSearchData.indexOf(proj)].globalVisibility === "public")
            tempProjList.push(fullProjectList[projectSearchData.indexOf(proj)]);
          continue;
        }
      }
    }

    // If no projects were found
    if (tempProjList.length === 0) {
      setDisplayedProjects([]); // Clear the displayed list
      console.log("No matching projects found.");
    } else {
      setDisplayedProjects(tempProjList);
    }
  };

  /**
   * Gets the user's projects to display.
   */
  const getProfileProjectData = useCallback(async () => {
    try {
      const response = isUsersProfile ? await getProjectsByUser() : await getVisibleProjects(Number(profileID)) as { data: ProjectPreview[] }; //TODO: IMPLEMENT PROJECT GETTING
      const data = response.data;

      // Only update if there's data
      if (data) {
        setFullProjectList(data);
        setDisplayedProjects(data);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.log(`Unknown error: ${error}`);
      }
    }
  }, [profileID, isUsersProfile, setFullProjectList, setDisplayedProjects]);

  // Gets the profile data
  const getProfileData = async (data: MePrivate | undefined) => {
    // Get the userID for our current user
    if (data) {
      setUserID(data.userId);
      setIsUsersProfile(data.userId.toString() === profileID);
    }
    else { setUserID(-1); }

    //set the variable i just set the damn variable bro
    try {
      const { data } = await getUsersById(Number(profileID));

      // Only run this if profile data exists for user
      if (data) {
        //console.log(data);
        setDisplayedProfile(data);
        setMajorsArr(data.majors.map((maj) => maj.label));
        await getProfileProjectData();
        //checkFollow();
      } else {
        navigate(paths.routes.NOTFOUND, { replace: true });
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.log(`Unknown error: ${error}`);
      }
    }
  };

  //switches likes tab on personal profile to projects or users
  const switchTab = (switchTo: boolean) => {
    const projectsTabElement = document.querySelector("#likes-projects") as HTMLButtonElement;
    const profileTabElement = document.querySelector("#likes-profiles") as HTMLButtonElement;

    setIsProjectLikesTab(switchTo);
    if (switchTo === true) { //   
      profileTabElement.style.opacity = String(.5);
      projectsTabElement.style.opacity = String(1);
      // console.log("project select");

    } else {
      projectsTabElement.style.opacity = String(.5);
      profileTabElement.style.opacity = String(1);
      console.log("profile select");
    }
  }

  // Load the logged-in user's owned projects + role list once we know who is
  // viewing and that it isn't their own profile. Used to populate the
  // "Invite to project" popup.
  useEffect(() => {
    if (userID === undefined || userID === -1) return;
    if (isUsersProfile) {
      //if this is the user's profile, display their liked profiles/projects in the liked section      const displayFollowedProfiles = async () => {
      const displayFollowedProfiles = async () => {
        const tempFollowProfileArray = [];
        const profileFollowings = (await getUserFollowing(userID)).data?.users;
        if (profileFollowings !== undefined) {
          for (const follower of profileFollowings) {
            tempFollowProfileArray.push(follower.user);
          }
          setFollowedProfilesList(tempFollowProfileArray);
        }
      };
      //get followed projects to display
      const displayFollowedProjects = async () => {
        const tempFollowProjectArray = [];
        const tempIds: Set<number> = new Set();
        const projectFollowings = ((await getProjectFollowing(userID)).data?.projects);
        if (projectFollowings !== undefined) {
          for (const follower of projectFollowings) {
            tempFollowProjectArray.push(follower.project);
            tempIds.add(follower.project.projectId);
          }
          setFollowProjectsIds(tempIds);
        }
        setFollowedProjectsList(tempFollowProjectArray);
      }
      displayFollowedProfiles();
      displayFollowedProjects();
      switchTab(true);
      return;
    }

    let cancelled = false;
    const loadInviteOptions = async () => {
      try {
        const [projResp, roleResp] = await Promise.all([
          getProjectsByUser(),
          getJobTitles(),
        ]);
        if (cancelled) return;
        const owned = (projResp.data ?? []).filter(
          (p) => p.owner?.userId === userID
        );
        setMyOwnedProjects(owned);
        if (roleResp.data) setAllRoles(roleResp.data);
      } catch (e) {
        console.error("Failed to load invite options", e);
      }
    };
    loadInviteOptions();
    // CURRENT user permissions
    getUserPermissions();

    // THIS PROFILE's user permissions
    getProfileUserPermissions();

    // is the displayed profile a reported user
    isUserReported();

    return () => {
      cancelled = true;
    };

  }, [isUsersProfile, userID]);

  // Resets the invite form to its initial state. Called when the popup opens
  // or closes so a previous send doesn't bleed into the next one.
  const resetInviteForm = () => {
    setInviteProjectId(null);
    setInviteRoleId(null);
    setInviteMessage("");
    setInviteError("");
    setInviteSuccess(false);
    setInviteSending(false);
  };

  const handleSendInvite = async () => {
    setInviteError("");
    if (!userID || userID === -1) {
      setInviteError("You must be logged in to invite someone.");
      return;
    }
    if (!displayedProfile?.userId) {
      setInviteError("Could not determine who to invite.");
      return;
    }
    if (!inviteProjectId) {
      setInviteError("Pick a project.");
      return;
    }
    if (!inviteRoleId) {
      setInviteError("Pick a role.");
      return;
    }

    setInviteSending(true);
    const result = await sendInvite(inviteProjectId, {
      ownerUserId: userID,
      prospectiveMemberId: displayedProfile.userId,
      roleId: inviteRoleId,
      message: inviteMessage,
    });
    setInviteSending(false);

    if (result.error) {
      // 409 from the server means a pending/active invite already exists for
      // this user on this project.
      if (result.status === 409) {
        setInviteError(
          `${displayedProfile.firstName} already has an invite or is a member of that project.`
        );
      } else {
        setInviteError(result.error);
      }
      return;
    }
    setInviteSuccess(true);
  };

  /**
   * Sends a report of a user if no report exists and
   * tells the user the result
   */
  const reportUserPressed = async () => {
    /* a loop hole around an empty string */
    let message = "";
    if (reportMessage?.current?.value == "") {
      message = "No message given.";
    }
    else {
      message = reportMessage?.current?.value ?? "No message given.";
    }

    const response = await reportUser(parseInt(profileID), message);
    let responseText = response.error;
    if (responseText === null || responseText === undefined) {
      responseText = "Your report was sent! Your request will be processed and receive an update shortly.";
    }
    /* A report on the user already exists */
    else if (response.status === 409) {
      responseText = "This user has already been reported!";
    }
    else {
      responseText = "Uh oh! Something went wrong with your report!";
    }
    setReportResponseText(responseText);
  };

  /**
   * Promotes a user to mod
   */
  const promoteToModPressed = async () => {
    const response = await promoteToMod(userID ? userID : -1, displayedProfile ? displayedProfile.userId : -1);
    let responseText = response.error;
    if (responseText === null || responseText === undefined) {
      setDisplayedProfileAccessLevel('Moderator');
      responseText = `Success! ${displayedProfile ? displayedProfile.firstName : "This user"} is now a Moderator!`;
    }
    else {
      responseText = "Uh oh! Something went wrong when promoting the user!";
    }
    setPromoteResponseText(responseText);
  }

  /**
   * Demotes a mod to user
   */
  const demoteToUserPressed = async () => {
    const response = await demoteToUser(userID ? userID : -1, displayedProfile ? displayedProfile.userId : -1);;
    let responseText = response.error;
    if (responseText === null || responseText === undefined) {
      setDisplayedProfileAccessLevel('User');
      responseText = `Success! ${displayedProfile ? displayedProfile.firstName : "This user"} is now a User!`;
    }
    else {
      responseText = "Uh oh! Something went wrong when demoting the user!";
    }
    setDemoteResponseText(responseText);
  }

  /**
   * Resolves a user report
   * @param action action The action to take on the report ('dismiss', 'warn' or 'ban')
   * @returns void, refreshes the page if success
   */
  const resolveReport = async (action: 'dismiss' | 'warn' | 'ban') => {
    if (activeReportList.length === 0) return;

    if (action === 'dismiss') {
      const res = await Promise.all(
        activeReportList.map(r => deleteUserReport(r.reportId))
      );

      // send an update to reporter
      const notif = await Promise.all(activeReportList.map(r => sendModeratorNotification({
        modUserId: userID,
        receiverId: r.reporterId,
        subjectLine: `Update on Your Report on ${displayedProfile?.firstName} ${displayedProfile?.lastName}`,
        message: 'Thank you for submitting your report. ' +
          'Our moderation team has completed its review. ' +
          'After carefully reviewing the information provided and any relevant evidence, ' +
          'we have determined that this report does not warrant moderation action at this time. ' +
          'As a result, the report has been dismissed.',
        type: 'General',
      })));

      if (res?.every(r => r.status === 200) && notif.every(r => r.status === 201)) {
        setModActionComplete(true);
        navigate(paths.routes.MODERATION);
      };

    } else if (action === 'warn') {
      const warnRes = await sendModeratorNotification({
        modUserId: userID ?? 0,
        receiverId: parseInt(profileID) ?? 0,
        subjectLine: 'Action Required: Changes Requested to Your Profile',
        message: warnMessage.current?.value ?? '',
        type: 'Warning',
      });

      const deactivateRes = await Promise.all(activeReportList.map(
        r => deactivateUserReport(r.reportId)
      ));

      // send an update to reporter
      const notif = await Promise.all(activeReportList.map(r => sendModeratorNotification({
        modUserId: userID,
        receiverId: r.reporterId,
        subjectLine: `Update on Your Report on ${displayedProfile?.firstName} ${displayedProfile?.lastName}`,
        message: 'Thank you for submitting your report. ' +
          'Our moderation team has completed its review. ' +
          'After reviewing the information provided, we have taken action on the reported user by requesting changes to their profile. ' +
          'The user has been notified and asked to address the reported issue.',
        type: 'General',
      })));

      if (warnRes.status === 201
        && deactivateRes?.every(r => r.status === 200)
        && notif.every(r => r.status === 201)) {
        setModActionComplete(true);
        navigate(paths.routes.MODERATION);
      }
    } else if (action === 'ban') {
      if (!banMessage?.current?.value) {
        setBanReasonSystemMsg('Ban reason cannot be empty. Please provide a reason before banning this user.');
        setModActionComplete(true);
        return;
      } else {
        setBanReasonSystemMsg('');
      }

      const banRes = await banUser(
        {
          reason: banMessage.current.value,
          userId: parseInt(profileID) ?? 0,
        }
      );

      const deactivateRes = await Promise.all(activeReportList.map(
        r => deactivateUserReport(r.reportId)
      ));

      // send an update to reporter
      const notif = await Promise.all(activeReportList.map(r => sendModeratorNotification({
        modUserId: userID,
        receiverId: r.reporterId,
        subjectLine: `Update on Your Report on ${displayedProfile?.firstName} ${displayedProfile?.lastName}`,
        message: 'Thank you for submitting your report. ' +
          'Our moderation team has completed its review. ' +
          'After reviewing the information provided, we have determined that further action was necessary. ' +
          'The reported user has been banned from Looking For Group.',
        type: 'General',
      })));

      if (banRes.status === 200 &&
        deactivateRes.every(r => r.status === 200) &&
        notif.every(r => r.status === 201)) {
        setModActionComplete(true);
        setBanned(true);
      }
    } else {
      console.error(`Unknown action: ${action}`);
    }
  };

  // --------------------
  // Components
  // --------------------
  const aboutMeButtons = (
    <>
      {/* If the displayed user is the user's profile */}
      {isUsersProfile ? (
        <>
          <ShareButton />
          <ProfileEditPopup />
        </>
      ) : (
        <>
          {/* Or, show follow and options buttons */}
          {/*must change state based on follow status*/}
          {isFollow ? (
            <ThemeIcon
              width={28}
              height={25}
              id={"heart-filled"}
              ariaLabel="following"
              onClick={() => followUser()}
            />
          ) : (
            <ThemeIcon
              width={28}
              height={25}
              id={"heart-empty"}
              ariaLabel="following"
              onClick={() => followUser()}
            />
          )}
          <Dropdown>
            <DropdownButton>
              <ThemeIcon id={'menu'} width={25} height={25} className={'color-fill dropdown-menu'} ariaLabel={'More options'} />
            </DropdownButton>
            <DropdownContent>
              <div id="profile-menu-dropdown">
                {isUserAdmin && displayedProfileAccessLevel !== 'Administrator' ?
                  <Popup>
                    <PopupButton className="project-info-dropdown-option">
                      <ThemeIcon id={'settings'} width={27} height={27} className={'mono-stroke'} ariaLabel={"Manage User Permissions"} />
                      Manage Permissions
                    </PopupButton>
                    {displayedProfileAccessLevel === 'User' && previousDisplayedProfileAccessLevel === 'User' ?
                      <PopupContent>
                        <div className="small-popup" id="manage-perms-popup">
                          <h3>Manage {displayedProfile?.firstName ?? "User"}'s Permissions</h3>
                          <p>Promote {displayedProfile?.firstName ?? "User"} to Moderator?</p>
                          <div className="confirm-deny-btns">
                            <PopupButton
                              buttonId="team-delete-member-cancel-button"
                              className="button-reset"
                            >
                              Cancel
                            </PopupButton>
                            <Popup>
                              <PopupButton
                                className="confirm-btn"
                                callback={promoteToModPressed}>
                                Promote
                              </PopupButton>
                            </Popup>
                          </div>
                        </div>
                      </PopupContent> :
                      (previousDisplayedProfileAccessLevel == 'User' ? <PopupContent callback={() => { setPreviousDisplayedProfileAccessLevel('Moderator'); }}>
                        <div className="small-popup">
                          <p>{promoteResponseText}</p>
                          <PopupButton buttonId="continue-button" callback={() => { setPreviousDisplayedProfileAccessLevel('Moderator'); }}>
                            Continue
                          </PopupButton>
                        </div>
                      </PopupContent> : "")}
                    {displayedProfileAccessLevel === 'Moderator' && previousDisplayedProfileAccessLevel === 'Moderator' ?
                      <PopupContent>
                        <div className="small-popup" id="manage-perms-popup">
                          <h3>Manage {displayedProfile?.firstName ?? "User"}'s Permissions</h3>
                          <p>Demote {displayedProfile?.firstName ?? "Moderator"} to User?</p>
                          <div className="confirm-deny-btns">
                            <PopupButton
                              buttonId="team-delete-member-cancel-button"
                              className="button-reset"
                            >
                              Cancel
                            </PopupButton>
                            <Popup>
                              <PopupButton
                                className="delete-button"
                                callback={demoteToUserPressed}>
                                Demote
                              </PopupButton>
                            </Popup>
                          </div>
                        </div>
                      </PopupContent> :
                      (previousDisplayedProfileAccessLevel == 'Moderator' ? <PopupContent callback={() => { setPreviousDisplayedProfileAccessLevel('User'); }}>
                        <div className="small-popup">
                          <p>{demoteResponseText}</p>
                          <PopupButton buttonId="continue-button" callback={() => { setPreviousDisplayedProfileAccessLevel('User'); }}>
                            Continue
                          </PopupButton>
                        </div>
                      </PopupContent> : "")}
                  </Popup> : ""}
                <ShareButton />
                <button
                  className="profile-menu-dropdown-button"
                  id="profile-menu-block"
                >
                  <ThemeIcon id={'cancel'} width={27} height={27} ariaLabel={'Block'} />
                  Block
                </button>
                <Popup>
                  <PopupButton
                    className="project-info-dropdown-option"
                  >
                    <ThemeIcon
                      id={"warning"}
                      width={27}
                      height={27}
                      ariaLabel={"Report"}
                    />
                    Report
                  </PopupButton>
                  <PopupContent>
                    <div className="small-popup" id="report-popup">
                      <h3>Report {displayedProfile?.firstName ?? "User"} {displayedProfile?.lastName ?? ""}</h3>
                      <p>You are about to report {displayedProfile?.firstName ?? "User"}. Please provide your reasoning below.</p>
                      <textarea placeholder="Write your reasoning here..." className="input input-multiline" ref={reportMessage}></textarea>
                      <div className="confirm-deny-btns">
                        <PopupButton
                          buttonId="team-delete-member-cancel-button"
                          className="button-reset"
                        >
                          Cancel
                        </PopupButton>
                        {/* The Report Button */}
                        <Popup>
                          <PopupButton
                            className="delete-button"
                            callback={reportUserPressed}>
                            Report
                          </PopupButton>
                          <PopupContent>
                            <div className="small-popup">
                              <p>{reportResponseText}</p>
                              <PopupButton buttonId="continue-button">
                                Continue
                              </PopupButton>
                            </div>
                          </PopupContent>
                        </Popup>
                      </div>
                    </div>
                  </PopupContent>
                </Popup>
              </div>
            </DropdownContent>
          </Dropdown>
        </>
      )}
    </>
  );

  const fullGallery = useMemo(() => {
    return [
      ...galleryVideos.map(v => {
        const embedUrl = getYouTubeEmbedURL(v.videoUrl); 
        if (!embedUrl) return null;
        
        return (
          <iframe
            key={`video-${v.position}`}
            src={embedUrl}
            title={v.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{ width: 'auto', height: '100%', aspectRatio: '16/9', border: 'none', objectFit: 'cover' }}
          ></iframe>
        );
    }).filter(item => item !== null),
    ...galleryImages.map(i => (
      <img
        key={`img-${i.position}`}
        src={i.image}
        alt={i.altText}
        // Click to view the image full-size in the lightbox
        // style={{ cursor: 'zoom-in' }}
        // onClick={(e) => setLightboxSrc((e.currentTarget as HTMLImageElement).src)}
        // onError={(e) => {
        //   const projectImg = e.target as HTMLImageElement;
        //   projectImg.src = placeholderThumbnail;
        // }}
      />
    )),
    ];
  }, [galleryImages, galleryVideos]);

  const galleryPreviews = useMemo(() => {
    return [
      ...galleryVideos.map(v => {
        const embedID = getYouTubeEmbedID(v.videoUrl);

        return <img
          key={`img-${v.position}`}
          src={`http://img.youtube.com/vi/${embedID}/default.jpg`}
          alt={v.title}
        />
      }),
      ...galleryImages.map(i => (
        <img
          key={`img-${i.position}`}
          src={i.image}
          alt={i.altText}
        />
      )),
    ];
  }, [galleryImages, galleryVideos]);

  const UserGallery = (
    <div id="user-gallery">
      <h1 id="title">Gallery</h1>
      <Popup>
        <PopupButton buttonId="edit-gallery">Edit Gallery</PopupButton>
        <PopupContent>
          asd
        </PopupContent>
      </Popup>
      <Carousel
        dataList={fullGallery}
      >
        <div className='gallery-carousel'>
          <CarouselContent className='gallery-carousel-content' />
          {fullGallery.length > 1 ?
          <div className='carousel-row'>
            <CarouselButton
              direction='left'
              className='gallery-carousel-btn'
              size='small'
            />
            <CarouselTabs className='gallery-carousel-tabs'>{galleryPreviews}</CarouselTabs>
            <CarouselButton 
              direction='right'
              className='gallery-carousel-btn'
              size='small'
            />
          </div> : ""}
          {/* <div className='carousel-row'>
          </div> */}
        </div>
      </Carousel>
    </div>
  );

  //console.log(followedProjectsIds);
  // --------------------
  // Final component
  // --------------------
  return (
    <div className="page" tabIndex={-1}>
      <Header
        dataSets={[{ data: fullProjectList }]}
        onSearch={searchProjects}
        hideSearchBar={true}
        onChange={() => { }}
        setCurrentUserId={getProfileData} //brother you're not even passing anything
        hideBackButton={false}
        placeholderText=''
      />

      {/* Checks if we have profile data to use, then determines what to render */}
      <main id="main" tabIndex={-1}>
        <div id="profile-page-content">
          <div id="profile-hero">
            <div id="profile-img-container">
              <img
                src={usePreloadedImage(`${displayedProfile?.profileImage}`, profilePicture)}
                id="profile-image"
                alt={`${displayedProfile?.firstName} ${displayedProfile?.lastName}'s avatar`}
                onError={(e) => {
                  const profileImg = e.target as HTMLImageElement;
                  profileImg.src = profilePicture;
                }}
              />
              {displayedProfile?.headline != "" ? <div id="profile-bio">{displayedProfile?.headline}</div> : ""}
            </div>

            <div id="profile-info">
              <div id="profile-info-text">
                <div id="profile-top-row">
                  <div id="profile-names">
                    <h1 id="profile-fullname">
                      {displayedProfile?.firstName} {displayedProfile?.lastName}
                    </h1>
                    <h2 id="profile-username">
                      @{displayedProfile?.username}
                    </h2>
                  </div>
                  <div id="profile-buttons">{aboutMeButtons}</div>
                </div>

                <div id="profile-extras">
                  {displayedProfile?.title ?
                    <div className="profile-extra">
                      <ThemeIcon id={'role'} width={20} height={20} className={'mono-fill'} ariaLabel={'Profession'} />
                      {displayedProfile.title}
                    </div> : ""}
                  {displayedProfile?.ritStatus ?
                    <div className="profile-extra">
                      <ThemeIcon id={'major'} width={24} height={24} className={'mono-fill'} ariaLabel={'Major'} />
                      {majorsArr.join(", ")} {RitStatusLabel[displayedProfile?.ritStatus]}
                    </div> : ""}
                  {displayedProfile?.location ?
                    <div className="profile-extra">
                      <ThemeIcon id={'location'} width={12} height={22} className={'mono-fill'} ariaLabel={'Location'} />
                      {displayedProfile?.location}
                    </div> : ""}
                  {displayedProfile?.pronouns ?
                    <div className="profile-extra">
                      <ThemeIcon id={'pronouns'} width={22} height={22} className={'mono-fill'} ariaLabel={'Pronouns'} />
                      {displayedProfile?.pronouns}
                    </div> : ""}
                  {/* Only show mentor status if user is a mentor */}
                  {displayedProfile?.mentor &&
                    <div className="profile-extra">
                      <ThemeIcon id={'mentor'} width={20} height={20} className={'mono-fill'} ariaLabel={'Mentorship Status'} />
                      Mentor
                    </div>
                  }
                </div>

                <div id="profile-description">{displayedProfile?.bio}</div>

                {/* <div id="profile-funfact">
                  <span id="funfact-start">
                    {displayedProfile?.funFact ? "Fun Fact!" : "No Fun Fact (Yet)!"}
                  </span>
                  {displayedProfile?.funFact}
                </div> */}

                {/* <div id="profile-interest">
                  <ProfileInterests
                    user={{ interests: displayedProfile.interests || [] }}
                    isUsersProfile={isUsersProfile}
                  />
                </div> */}
              </div>
            </div>
          </div>

          {/* Mod options when this is a reported user */}
          {(!isUsersProfile) && isUserMod && (activeReportList.length !== 0) && userID !== parseInt(profileID) ? <div id="mod-user-options">
            <h2>Reports</h2>
            <p>You can dismiss this report, warn the user and request edits from them, or ban the user.</p>
            <h3>Active Reports</h3>
            <p>These reports are currently under review and have not yet been resolved. Resolve them by dismissing the reports, warning the user, or banning the user. All active reports will be resolved using the same action.</p>
            {activeReportList.map(r => <Reporter modUserId={userID} reporterId={r.reporterId} reason={r.reason} key={'active-reporter-' + r.reporterId} />)}
            {inactiveReportList.length !== 0 && (<>
              <h3>Inactive Reports</h3>
              <p>These reports have already been reviewed and are no longer active.</p>
            </>)}
            {inactiveReportList.map(r => <Reporter modUserId={userID} reporterId={r.reporterId} reason={r.reason} key={'inactive-reporter-' + r.reporterId} />)}
            <div className="mod-options-btns">
              <button id="mod-dismiss-btn" onClick={() => resolveReport('dismiss')} >Dismiss Report</button>
              <Popup>
                <PopupButton className="mod-edit-btn">Warn User</PopupButton>
                <PopupContent>
                  <div className="small-popup" id="report-popup">
                    <h3>Warn User</h3>
                    <p>What should the user change about their profile?</p>
                    <textarea placeholder="Write your reasoning here..." className="input input-multiline" ref={warnMessage}></textarea>
                    <div className="confirm-deny-btns">
                      <PopupButton
                        buttonId="edits-cancel-button"
                        className="button-reset"
                        callback={() => { setModActionComplete(false); }}
                      >
                        Cancel
                      </PopupButton>
                      <button className="confirm-btn" onClick={() => resolveReport('warn')}>Submit</button>
                    </div>
                  </div>
                </PopupContent>
              </Popup>
              <Popup>
                <PopupButton
                  buttonId="mod-decline-btn"
                  className="delete-button"
                  callback={() => {
                    setModActionComplete(false);
                    setBanned(false);
                    setBanReasonSystemMsg('');
                  }}
                >
                  Ban User
                </PopupButton>
                <PopupContent>
                  <div className="small-popup" id="report-popup">
                    <h3>Ban {displayedProfile?.firstName} {displayedProfile?.lastName} from LookingForGroup</h3>
                    <p>Why are you banning this user?</p>
                    <textarea placeholder="Write your reasoning here..." className="input input-multiline" ref={banMessage}></textarea>
                    <div className="confirm-deny-btns">
                      <PopupButton
                        buttonId="ban-cancel-button"
                        className="button-reset"
                        callback={() => {
                          setModActionComplete(false);
                          setBanned(false);
                          setBanReasonSystemMsg('');
                        }}
                      >
                        Cancel
                      </PopupButton>
                      <Popup>
                        <PopupButton buttonId="mod-submit-ban-btn" className="confirm-btn" callback={() => resolveReport('ban')}>Submit</PopupButton>
                        <PopupContent>
                          <div className="small-popup">
                            {modActionComplete
                              ? (<>
                                <p>{banned
                                  ? "The user's account has been frozen and they can no longer log in to Looking For Group. The banned user has received an email explaining the ban and the reason provided. All reporters have received an update notification informing them that action has been taken."
                                  : banReasonSystemMsg}
                                </p>
                                <PopupButton buttonId="continue-button" callback={() => { if (banned) navigate(paths.routes.MODERATION); }}>
                                  {banned ? "Continue" : "Close"}
                                </PopupButton>
                              </>)
                              : <div className='placeholder-spacing'>
                                <div className='spinning-loader'></div>
                              </div>
                            }
                          </div>
                        </PopupContent>
                      </Popup>
                      {/* <button className="confirm-btn" onClick={() => resolveReport('ban')}>Submit</button> */}
                    </div>
                  </div>
                </PopupContent>
              </Popup>
            </div>
          </div> : ""}

          {showGallery ? UserGallery : ""}

          <div id="profile-extra">
            <div id="contact-and-skills">
              <div id="socials">
                <div className="contact-skills-edit-label-btn">
                  <h1 id="title">Contact Me</h1>
                  {isUsersProfile ? <ProfileEditPopup editContact={true} />
                    : ""}</div>
                <div id="profile-email">
                  {/* TODO: make icon for email and phone */}
                  {displayedProfile?.username ?
                    <a href={`mailto:${displayedProfile?.username}@g.rit.edu`}>
                      <ThemeIcon id={'mail'} width={25} height={25} className={'mono-fill'} ariaLabel={'mail'} />
                      {displayedProfile?.username}@g.rit.edu</a>
                    : <a><ThemeIcon id={'mail'} width={25} height={25} className={'mono-fill'} ariaLabel={'mail'} />no email</a>}
                </div>

                {/* Show phone number if present */}
                {displayedProfile?.phoneNumber ? /* no need to also check displayPhone, the number won't be in the request if it's false */
                  <div id="profile-number">
                    <a id="profile-number" href={`sms:${displayedProfile.phoneNumber}`}>
                      <ThemeIcon id={'phone'} width={25} height={25} className={'mono-fill'} ariaLabel={'phone'} />
                      {displayedProfile.phoneNumber}</a>
                  </div>
                  //dead link when no number
                  : <></>}
                {/* Add social links if present */}
                <div id="links-and-invite-project">
                  {displayedProfile?.socials && (
                    <div id="about-me-buttons">
                      {displayedProfile?.socials.map((link) => (
                        <a
                          key={link.websiteId}
                          href={link.url}
                          target="_blank"
                        >
                          <ThemeIcon
                            id={link.label === "Other" ? "link" : link.label.toLowerCase()}
                            width={25}
                            height={25}
                            className={"mono-fill"}
                            ariaLabel={link.label}
                          />
                          {link.alias}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                {/* Invite-to-project: only shown when a logged-in user is
                  viewing someone else's profile. */}
                {(!isUsersProfile) && userID !== undefined && userID !== -1 && (
                  <Popup>
                    <PopupButton
                      buttonId="profile-invite-button"
                      callback={resetInviteForm}
                    >
                      Invite to Project
                    </PopupButton>
                    <PopupContent useClose={true}>
                      <div className="small-popup">
                        <div id="profile-invite-title">
                          Invite {displayedProfile?.firstName} to a project
                        </div>
                        {myOwnedProjects.length === 0 ? (
                          <div id="profile-invite-empty">
                            You don't own any projects yet. Create one to start
                            inviting people.
                          </div>
                        ) : inviteSuccess ? (
                          <div id="profile-invite-success">
                            Invite sent! {displayedProfile?.firstName} will get an
                            email to accept or decline.
                          </div>
                        ) : (
                          <>
                            <div id="profile-invite-form">
                              <label
                                className="profile-invite-label"
                                htmlFor="profile-invite-project"
                              >
                                Project
                              </label>
                              <div id="profile-invite-project">
                                <Select>
                                  <SelectButton
                                    placeholder="Select a project"
                                    searchable={true}
                                    type="input"
                                  />
                                  <SelectOptions
                                    callback={(e) => {
                                      const value = (e.target as HTMLButtonElement)
                                        .value;
                                      const proj = myOwnedProjects.find(
                                        (p) => p.title === value
                                      );
                                      setInviteProjectId(proj?.projectId ?? null);
                                    }}
                                    options={myOwnedProjects.map((proj) => ({
                                      markup: <>{proj.title}</>,
                                      value: proj.title,
                                      disabled: false,
                                    }))}
                                  />
                                </Select>
                              </div>

                              <label
                                className="profile-invite-label"
                                htmlFor="profile-invite-role"
                              >
                                Role
                              </label>
                              <div id="profile-invite-role">
                                <Select>
                                  <SelectButton
                                    placeholder="Select a role"
                                    searchable={true}
                                    type="input"
                                  />
                                  <SelectOptions
                                    callback={(e) => {
                                      const value = (e.target as HTMLButtonElement)
                                        .value;
                                      const role = allRoles.find(
                                        (r) => r.label === value
                                      );
                                      setInviteRoleId(role?.roleId ?? null);
                                    }}
                                    options={allRoles.map((role) => ({
                                      markup: <>{role.label}</>,
                                      value: role.label,
                                      disabled: false,
                                    }))}
                                  />
                                </Select>
                              </div>

                              <label
                                className="profile-invite-label"
                                htmlFor="profile-invite-message"
                              >
                                Message
                              </label>
                              <textarea
                                id="profile-invite-message"
                                placeholder={`Optional note to ${displayedProfile?.firstName ?? "them"}...`}
                                value={inviteMessage}
                                onChange={(e) => setInviteMessage(e.target.value)}
                                maxLength={500}
                              />
                            </div>

                            {inviteError && (
                              <div className="error" id="profile-invite-error">
                                {inviteError}
                              </div>
                            )}

                            <div className="project-editor-button-pair">
                              <PopupButton
                                buttonId="profile-invite-send"
                                callback={handleSendInvite}
                                doNotClose={() => !inviteSuccess}
                                disabled={inviteSending}
                              >
                                {inviteSending ? "Sending..." : "Send Invite"}
                              </PopupButton>
                            </div>
                          </>
                        )}
                      </div>
                      {myOwnedProjects.length === 0 ? (
                        <div id="profile-invite-empty">
                          You don't own any projects yet. Create one to start
                          inviting people.
                        </div>
                      ) : inviteSuccess ? (
                        <div id="profile-invite-success">
                          Invite sent! {displayedProfile?.firstName} will get an
                          email to accept or decline.
                        </div>
                      ) : (
                        <>
                          <div id="profile-invite-form">
                            <label
                              className="profile-invite-label"
                              htmlFor="profile-invite-project"
                            >
                              Project
                            </label>
                            <div id="profile-invite-project">
                              <Select>
                                <SelectButton
                                  placeholder="Select a project"
                                  searchable={true}
                                  type="input"
                                />
                                <SelectOptions
                                  callback={(e) => {
                                    const value = (e.target as HTMLButtonElement)
                                      .value;
                                    const proj = myOwnedProjects.find(
                                      (p) => p.title === value
                                    );
                                    setInviteProjectId(proj?.projectId ?? null);
                                  }}
                                  options={myOwnedProjects.map((proj) => ({
                                    markup: <>{proj.title}</>,
                                    value: proj.title,
                                    disabled: false,
                                  }))}
                                />
                              </Select>
                            </div>

                            <label
                              className="profile-invite-label"
                              htmlFor="profile-invite-role"
                            >
                              Role
                            </label>
                            <div id="profile-invite-role">
                              <Select>
                                <SelectButton
                                  placeholder="Select a role"
                                  searchable={true}
                                  type="input"
                                />
                                <SelectOptions
                                  callback={(e) => {
                                    const value = (e.target as HTMLButtonElement)
                                      .value;
                                    const role = allRoles.find(
                                      (r) => r.label === value
                                    );
                                    setInviteRoleId(role?.roleId ?? null);
                                  }}
                                  options={allRoles.map((role) => ({
                                    markup: <>{role.label}</>,
                                    value: role.label,
                                    disabled: false,
                                  }))}
                                />
                              </Select>
                            </div>

                            <label
                              className="profile-invite-label"
                              htmlFor="profile-invite-message"
                            >
                              Message
                            </label>
                            <textarea
                              id="profile-invite-message"
                              placeholder={`Optional note to ${displayedProfile?.firstName ?? "them"}...`}
                              value={inviteMessage}
                              onChange={(e) => setInviteMessage(e.target.value)}
                              maxLength={500}
                            />
                          </div>

                          {inviteError && (
                            <div className="error" id="profile-invite-error">
                              {inviteError}
                            </div>
                          )}

                          <div className="project-editor-button-pair">
                            <PopupButton
                              buttonId="profile-invite-send"
                              callback={handleSendInvite}
                              doNotClose={() => !inviteSuccess}
                              disabled={inviteSending}
                            >
                              {inviteSending ? "Sending..." : "Send Invite"}
                            </PopupButton>
                          </div>
                        </>
                      )}
                    </PopupContent>
                  </Popup>
                )}
              </div>

              <div id="skills">
                <div className="contact-skills-edit-label-btn">
                  <h1 id="title">Skills</h1>
                  {isUsersProfile ? <ProfileEditPopup editSkills={true} />
                    : ""}</div>
                <div id="skill-block">
                  {displayedProfile?.skills !== undefined && (
                    /* Will take in a list of tags the user has selected, then */
                    /* use a map function to generate tags to fill this div */
                    displayedProfile?.skills.sort((a, b) => a.position - b.position).map((tag) => {
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
                    })
                  )}
                </div>
              </div>
            </div>
            {isUsersProfile ?
              <div id="profile-likes">
                <h1 id="title">Likes</h1>
                <div id="likes-block">
                  <div id="likes-tabs">
                    <button id="likes-projects" onClick={() => switchTab(true)}>Projects</button>
                    <button id="likes-profiles" onClick={() => switchTab(false)}>Users</button>

                  </div>
                  <div id="likes-container">
                    {isProjectLikesTab === true ?
                      (followedProjectsList.length > 0 ?

                        <PanelBox
                          category={"projects"}
                          itemList={followedProjectsList}
                          userId={userID as number}
                          followedProjectIds={followedProjectsIds}
                        />
                        : <p className="no-saved-items">You have no saved projects!</p>)
                      :
                      (followedProfilesList.length > 0 ?

                        <PanelBox
                          category={"profiles"}
                          itemList={followedProfilesList}
                          userId={userID as number}
                        />
                        : <p className="no-saved-items">You have no saved users!</p>)


                    }
                  </div>
                </div>
              </div> : ""}
          </div>

          {displayedProjects.length > 0 ?
            <div id="profile-projects">
              <h2>Projects</h2>
              <PanelBox
                category={"projects"}
                itemList={displayedProjects}
                userId={userID as number}
              />
            </div> : ""}
        </div>
      </main>
    </div >
  );
};

export default Profile;
