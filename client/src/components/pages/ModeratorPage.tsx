// Import statements
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import PendingProjects from "../ModeratorTools/PendingProjects";
import ReportedProjects from "../ModeratorTools/ReportedProjects";
import ReportedUsers from "../ModeratorTools/ReportedUsers";
import ReportedBugs from "../ModeratorTools/ReportedBugs";
import { Header } from "../Header";
import "../../components/Styles/modPage.css";
import "../../components/Styles/projects.css";
import { getCurrentAccount } from "../../api/users";
import { getUserAccessLevel, sendModeratorNotification } from "../../api/mod-tools";
import * as paths from '../../constants/routes';
import AllModerators from "../ModeratorTools/admin/AllModerators";

/**
 * The Moderator Page, only accessible by Moderators and Administrators
 * Found in User Profile dropdown and /moderation path
 */
const ModeratorPage = () => {
    // Variables ==============================================================
    const [currentTab, setCurrentTab] = useState<number>(0);
    const [userId, setUserId] = useState<number>(-1);
    const [error, setError] = useState<string>('');

    /* Page contents only viewable by mods*/
    const [userIsMod, setUserIsMod] = useState<boolean>(false);

    /* Admin content only viewable by admins */
    const [userIsAdmin, setUserIsAdmin] = useState<boolean>(false);

    /* Display mode - grid or list */
    const [displayMode, setDisplayMode] = useState<'grid' | 'list'>('list');

    // Message holders
    const subject = useRef<HTMLInputElement>(null);
    const message = useRef<HTMLTextAreaElement>(null);

    // Helper Methods =========================================================
    /**
     * Used for navigation to other pages
     */
    const navigate = useNavigate();

    /**
     * Toggles between grid and list display
     */
    const toggleDisplayMode = () => {
        if (displayMode === 'grid') {
            setDisplayMode('list');
        } else if (displayMode === 'list') {
            setDisplayMode('grid');
        }
    }

    /**
     * Handles tab styling when switching between moderation page tabs
     */
    const tabManagement = () => {
        const pendingProjectsTab = document.querySelector("#mod-pending-tab") as HTMLButtonElement;
        const reportedUsersTab = document.querySelector("#mod-users-tab") as HTMLButtonElement;
        const reportedProjectsTab = document.querySelector("#mod-projects-tab") as HTMLButtonElement;
        const reportedBugsTab = document.querySelector('#mod-bugs-tab') as HTMLButtonElement;
        const allModeratorsTab = document.querySelector("#admin-mods-tab") ? document.querySelector("#admin-mods-tab") as HTMLButtonElement : null;

        if (reportedUsersTab != null && reportedProjectsTab != null && pendingProjectsTab != null) {
            switch (currentTab) {
                case 0:
                    reportedUsersTab.style.opacity = String(.5);
                    reportedProjectsTab.style.opacity = String(.5);
                    pendingProjectsTab.style.opacity = String(1);
                    reportedBugsTab.style.opacity = String(.5);
                    if (userIsAdmin && allModeratorsTab != null) {
                        allModeratorsTab.style.opacity = String(.5);
                    }
                    break;
                case 1:
                    reportedUsersTab.style.opacity = String(1);
                    reportedProjectsTab.style.opacity = String(.5);
                    pendingProjectsTab.style.opacity = String(.5);
                    reportedBugsTab.style.opacity = String(.5);
                    if (userIsAdmin && allModeratorsTab != null) {
                        allModeratorsTab.style.opacity = String(.5);
                    }
                    break;
                case 2:
                    reportedUsersTab.style.opacity = String(.5);
                    reportedProjectsTab.style.opacity = String(1);
                    pendingProjectsTab.style.opacity = String(.5);
                    reportedBugsTab.style.opacity = String(.5);
                    if (userIsAdmin && allModeratorsTab != null) {
                        allModeratorsTab.style.opacity = String(.5);
                    }
                    break;
                case 3:
                        reportedUsersTab.style.opacity = String(.5);
                        reportedProjectsTab.style.opacity = String(.5);
                        pendingProjectsTab.style.opacity = String(.5);
                        reportedBugsTab.style.opacity = String(1);
                        if (userIsAdmin && allModeratorsTab != null) {
                        allModeratorsTab.style.opacity = String(.5);
                        }
                    break;
                case 4:
                    if (userIsAdmin && allModeratorsTab != null) {
                        reportedUsersTab.style.opacity = String(.5);
                        reportedProjectsTab.style.opacity = String(.5);
                        pendingProjectsTab.style.opacity = String(.5);
                        reportedBugsTab.style.opacity = String(.5);
                        allModeratorsTab.style.opacity = String(1);
                    }
                    break;
                default:
                    reportedUsersTab.style.opacity = String(.5);
                    reportedProjectsTab.style.opacity = String(.5);
                    pendingProjectsTab.style.opacity = String(1);
                    reportedBugsTab.style.opacity = String(.5);
                    if (userIsAdmin && allModeratorsTab != null) {
                        allModeratorsTab.style.opacity = String(.5);
                    }
                    break;
            }
        }
    };

    /**
     * Gets the user's account and sets the user ID. 
     * Checks for mod permissions and redirects user when necessary
     * @returns void
     */
    const getAccount = async () => {
        /* Ensures the user is logged in */
        const userAccount = await getCurrentAccount();
        if (userAccount.status === 200 && userAccount.data?.userId) {
            setUserId(userAccount.data?.userId);
            /* User must have mod permissions to access mod page */
            const accessLevel = await getUserAccessLevel(userAccount.data.userId);
            if (accessLevel.data?.toString() == 'Moderator' || accessLevel.data?.toString() == 'Administrator') {
                setUserIsMod(true);
            }
            else /* Redirect to home if not moderator or admin*/ {
                navigate(paths.routes.HOME);
                return;
            }

            if (accessLevel.data?.toString() == 'Administrator') {
                setUserIsAdmin(true);
            }
        }
        else    /* Redirect to log in if not logged in */ {
            navigate(paths.routes.LOGIN);
        }
    };

    /**
     * Renders the moderator page tab content based on what tab the user is on
     * @returns void
     */
    const renderTabContent = () => {
        switch (currentTab) {
            case 0:
                return (
                    <PendingProjects
                        currentUserId={userId}
                        currentTab={currentTab}
                        displayMode={displayMode}
                    ></PendingProjects>
                );
            case 1:
                return (
                    <ReportedUsers
                        currentUserId={userId}
                        currentTab={currentTab}
                        displayMode={displayMode}
                    ></ReportedUsers>
                );
            case 2:
                return (
                    <ReportedProjects
                        currentUserId={userId}
                        currentTab={currentTab}
                        displayMode={displayMode}
                    ></ReportedProjects>
                );
            case 3:
                return (    /* needs to hide list view option? */
                    <ReportedBugs
                        currentUserId={userId}
                        currentTab={currentTab}
                    ></ReportedBugs>
                );
            case 4:
                return (
                    <AllModerators
                        currentUserId={userId}
                        currentTab={currentTab}
                        displayMode={displayMode}
                    ></AllModerators>
                );
            default:
                return (
                    <PendingProjects
                        currentUserId={userId}
                        currentTab={currentTab}
                        displayMode={displayMode}
                    ></PendingProjects>
                );
        }
    };

    /**
     * Make a moderator announcement to all users on the site
     */
    const makeAnnouncement = async () => {
        if (!subject.current?.value || !message.current?.value) {
            setError("Subject and/or message of the announcement is empty. Please make sure both fields are filled out and then try again.")
            return;
        }

        try {
            const res = await sendModeratorNotification({
                modUserId: userId,
                receiverId: 0,
                subjectLine: subject.current.value,
                message: message.current.value,
                type: 'Announcement',
            });

            if (res.status === 201) {
                setError('');
                // refresh page
                window.location.reload();
            }
        } catch (e) {
            console.error('Error in makeAnnouncement:', e);
            setError('Uh-oh! Something happen on the server side. Please try again later.');
        }
    }

    // Runs on initial render
    useEffect(() => {
        getAccount();
    }, []);

    // Manages tabs every time the current tab changes
    useEffect(() => {
        tabManagement();
    }, [currentTab]);

    // Final Component ========================================================
    return (
        <div className="page mod-page">
            <Header /* bypassing search bar */
                dataSets={[]}
                onSearch={() => { true }}
                placeholderText="Search by Name"    /* change later */
                value={""}
                hideSearchBar={true}
                hideBackButton={false}
            />
            <h1 className="page-title">Moderation</h1>
            <p id="mod-page-description">Manage pending project requests, handle user and project reports, and more!</p>
            <main id="main" tabIndex={-1} aria-label='main content'>
                {userIsMod ? (
                    <>
                        <div id="mod-tools">
                            <div id="mod-actions-block">
                                <div className="display-switch" onClick={() => toggleDisplayMode()}>
                                    <div className="display-switch-option list" id={displayMode === 'list' ? 'selected' : ''}>
                                        <i className="fa-solid fa-bars fa-lg"></i>
                                    </div>
                                    <div className="display-switch-option grid" id={displayMode === 'grid' ? 'selected' : ''}>
                                        <i className="fa-solid fa-border-all fa-xl"></i>
                                    </div>
                                </div>
                                <div id="mod-actions-tabs">
                                    <button
                                        id="mod-pending-tab"
                                        style={{ opacity: String(1) }}
                                        onClick={() => { setCurrentTab(0); }}
                                    >
                                        Pending Projects
                                    </button>
                                    <button
                                        id="mod-users-tab"
                                        style={{ opacity: String(.5) }}
                                        onClick={() => { setCurrentTab(1); }}
                                    >
                                        Reported Users
                                    </button>
                                    <button
                                        id="mod-projects-tab"
                                        style={{ opacity: String(.5) }}
                                        onClick={() => { setCurrentTab(2); }}
                                    >
                                        Reported Projects
                                    </button>
                                    <button
                                        id="mod-bugs-tab"
                                        style={{ opacity: String(.5) }}
                                        onClick={() => { setCurrentTab(3); }}
                                    >
                                        Reported Bugs
                                    </button>
                                    {userIsAdmin && (
                                        <button
                                            id="admin-mods-tab"
                                            style={{ opacity: String(.5) }}
                                            onClick={() => { setCurrentTab(4); }}
                                        >
                                            All Moderators
                                        </button>
                                    )}
                                </div>
                                <div id="mod-content-container">{renderTabContent()}</div>
                            </div>
                            <div className="announcement-area">
                                <h2>Make an Announcement</h2>
                                <p>Make an announcement notificaion to all users on the site.</p>
                                {error && <p className="error">{error}</p>}
                                <input
                                    placeholder="Subject"
                                    className="input"
                                    ref={subject}
                                ></input>
                                <textarea
                                    placeholder="Write your message here..."
                                    className="input input-multiline"
                                    ref={message}
                                ></textarea>
                                <div className="message-actions">
                                    <button className="confirm-btn" onClick={() => makeAnnouncement()}>Send</button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : "You are not a moderator!"}
            </main>
        </div>
    );
};
export default ModeratorPage;