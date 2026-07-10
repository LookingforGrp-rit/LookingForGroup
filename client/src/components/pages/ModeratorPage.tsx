// Import statements
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PendingProjects from "../ModeratorTools/PendingProjects";
import ReportedProjects from "../ModeratorTools/ReportedProjects";
import ReportedUsers from "../ModeratorTools/ReportedUsers";
import { Header } from "../Header";
import "../../components/Styles/modPage.css";
import "../../components/Styles/projects.css";
import { getCurrentAccount } from "../../api/users";
import { getUserAccessLevel } from "../../api/mod-tools";
import * as paths from '../../constants/routes';
import type { UserAccessLevel } from "@looking-for-group/shared";

const ModeratorPage = () => {

// Components
    const [currentTab, setCurrentTab] = useState<number>(0);
    const [userId, setUserId] = useState<number>(-1);

    /* Page contents only viewable by mods*/
    const [userIsAdmin, setUserIsAdmin] = useState<boolean>(true);      /* FIX UPON FINAL IMPLEMENTATION */

// Helper Functions

    const navigate = useNavigate();

    const tabManagement = () => {
        const pendingProjectsTab = document.querySelector("#mod-pending-tab") as HTMLButtonElement;
        const reportedUsersTab = document.querySelector("#mod-users-tab") as HTMLButtonElement;
        const reportedProjectsTab = document.querySelector("#mod-projects-tab") as HTMLButtonElement;
        
        if (reportedUsersTab != null && reportedProjectsTab != null && pendingProjectsTab != null)
        {
            switch (currentTab)
            {
                case 0:
                    reportedUsersTab.style.opacity = String(.5);
                    reportedProjectsTab.style.opacity = String(.5);
                    pendingProjectsTab.style.opacity = String(1);
                    break;
                case 1:
                    reportedUsersTab.style.opacity = String(1);
                    reportedProjectsTab.style.opacity = String(.5);
                    pendingProjectsTab.style.opacity = String(.5);
                    break;
                case 2:
                    reportedUsersTab.style.opacity = String(.5);
                    reportedProjectsTab.style.opacity = String(1);
                    pendingProjectsTab.style.opacity = String(.5);
                    break;
            }
        }
    };

    // Gets the user's account and sets the user ID. Checks for mod permissions and redirects
    // user when necessary
    const getAccount = async() => {
        /* Ensures the user is logged in */
        const userAccount = await getCurrentAccount();
        if (userAccount.status === 200 && userAccount.data?.userId)
        {
            setUserId(userAccount.data?.userId);
            /* User must have mod permissions to access mod page */
            const accessLevel = await getUserAccessLevel(userAccount.data.userId);
            if (accessLevel.data?.toString() == 'Moderator' || accessLevel.data?.toString() == 'Administrator')
            {
                setUserIsAdmin(true);
            }
            else /* Redirect to home if not moderator or admin*/
            {
                navigate(paths.routes.HOME);
            }
        }
        else    /* Redirect to log in if not logged in */
        {
            navigate(paths.routes.LOGIN);
        }
    };

    // Renders the moderator page tab content based on what tab the user is on
    const renderTabContent = () => {
        switch (currentTab)
        {
            case 0:
                return(<PendingProjects currentUserId={userId}></PendingProjects>);
            case 1:
                return(<ReportedUsers currentUserId={userId}></ReportedUsers>);
            case 2:
                return(<ReportedProjects currentUserId={userId}></ReportedProjects>);
            default:
                return (<PendingProjects currentUserId={userId}></PendingProjects>);
        }
    };

    // Runs on initial render
    useEffect(() => {
        getAccount();
    }, []);

    // Manages tabs every time the current tab changes
    useEffect(() => {
        tabManagement();
    }, [currentTab]);

// Final Component
    return (
        <div className="page mod-page">
            <Header /* bypassing search bar */
                dataSets={[]}
                onSearch={() => {true
                }}
                value={""}
                hideSearchBar={true}
                hideBackButton={false}
            />
            <h1 className="page-title">Moderation</h1>
            <p>Manage pending project requests, handle user and project reports, and more!</p>
            <main id="main" tabIndex={-1} aria-label='main content'>
                {userIsAdmin ?
                <div id="mod-tools-block">
                    <div id="mod-tools-tabs">
                      <button id="mod-pending-tab" onClick={() => {setCurrentTab(0);}}>Pending Projects</button>
                      <button id="mod-users-tab" onClick={() => {setCurrentTab(1);}}>Reported Users</button>
                      <button id="mod-projects-tab" onClick={() => {setCurrentTab(2);}}>Reported Projects</button>
                    </div>
                    <div id="mod-content-container">{renderTabContent()}</div>
                </div> : "You are not a moderator!"} 
            </main> 
        </div>


        /* Sorting Options

        Display Switch
        
          <div
            className="my-projects-display-switch"
            onClick={() => {
              toggleDisplayMode();
            }}
          >
            <div className="display-switch-option list" id={displayMode === 'list' ? 'selected' : ''}>
              <i className="fa-solid fa-bars fa-lg"></i>
            </div>
            <div className="display-switch-option grid" id={displayMode === 'grid' ? 'selected' : ''}>
              <i className="fa-solid fa-border-all fa-xl"></i>
            </div>
          </div>*/
    );
};
export default ModeratorPage;