import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as paths from "../constants/routes";
import { useSelector } from "react-redux";
import Notifications from "./pages/Notifications";
import { ThemeIcon } from "./ThemeIcon";
import { ProjectCreatorEditor } from "./ProjectCreatorEditor/ProjectCreatorEditor";
//user utils
import { getCurrentUsername } from "../api/users.ts";
import { ThemeIconNew } from "./ThemeIconNew.tsx";

export interface User {
  firstName: string;
  lastName: string;
  username: string;
  primaryEmail: string;
  userId: number;
}

//Style changes to do:
//Remove blue background image, replace with single color (or gradient?)
//Change shape of active buttons to be more rounded
//Remove notification button

const SideBar = ({ avatarImage, setAvatarImage, theme }) => {
  const [width, setWidth] = React.useState(window.innerWidth);
  const breakpoint = useSelector((state: any) => state.page.MOBILE_BREAKPOINT);

  // const [headerText, setHeaderText] = useState('Group'); // State to manage the h1 text
  const navigate = useNavigate(); // Hook for navigation

  let startingPage: string;

  const sidebarBtns = document.getElementsByClassName("sidebar-btn");

  // Code to manage sidebar button selection
  // Here, the sidebar buttons are updated on page load (so that they work with browser back/forward)
  // BOTH manual class managing lines & startingPage lines are necessary for the buttons to work with site features AND browser features
  switch (window.location.pathname) {
    case "/discover":
    case "/":
      startingPage = "Discover";
      for (const i of sidebarBtns) {
        i.classList.remove("active");
      }
      document.querySelector("#discover-sidebar-btn")?.classList.add("active");
      break;
    case "/meet":
      startingPage = "Meet";
      for (const i of sidebarBtns) {
        i.classList.remove("active");
      }
      document.querySelector("#meet-sidebar-btn")?.classList.add("active");
      break;
    case "/myProjects":
      startingPage = "My Projects";
      for (const i of sidebarBtns) {
        i.classList.remove("active");
      }
      document
        .querySelector("#my-projects-sidebar-btn")
        ?.classList.add("active");
      break;
    case "/newProfile":
      // Only the mobile layout specifically displays the "own profile" sidebar button
      // Default "newProfile" brings you to your own page
      if (width < breakpoint && !window.location.href.includes("?")) {
        // Is it the mobile layout, and is it DEFINITELY your own page?
        startingPage = "My Profile";
        for (const i of sidebarBtns) {
          i.classList.remove("active");
        }
        document
          .querySelector("#my-profile-sidebar-btn")
          ?.classList.add("active");
      } else {
        // Otherwise, default to MEET
        // This behavior is not ideal! The desktop layout should likely also feature a "MY PROFILE" button, and one's own profile should have a unique URL.
        // That way, going to one's own profile would display as such, rather than as selecting MEET.
        startingPage = "Meet";
        for (const i of sidebarBtns) {
          i.classList.remove("active");
        }
        document.querySelector("#meet-sidebar-btn")?.classList.add("active");
      }
      break;
    case "/settings":
      startingPage = "Settings";
      localStorage.setItem("lastActiveTab", startingPage);
      for (const i of sidebarBtns) {
        i.classList.remove("active");
      }
      break;
    // case '/messages':
    //   startingPage = 'Messages';
    //   break;
    default:
      startingPage = localStorage.getItem("lastActiveTab") || "Discover";
      for (const i of sidebarBtns) {
        i.classList.remove("active");
      }
      if (startingPage === "Discover")
        document
          .querySelector("#discover-sidebar-btn")
          ?.classList.add("active");
      else if (startingPage === "Meet")
        document.querySelector("#meet-sidebar-btn")?.classList.add("active");
      else if (startingPage === "My Projects")
        document
          .querySelector("#my-projects-sidebar-btn")
          ?.classList.add("active");
      else if (startingPage === "My Profile")
        document
          .querySelector("#my-profile-sidebar-btn")
          ?.classList.add("active");
  }

  const [activePage, setActivePage] = useState<string>(startingPage); // State to manage the active page [Discover, Meet, My Projects, Messages, Profile, Settings]

  const [showNotifications, setShowNotifications] = useState<boolean>(false); // State to manage the notifications modal

  // Error to handle if Create button opens project creator
  const [createError, setCreateError] = useState<boolean>(true);

  // Store user data, if authenticated
  const [userData, setUserData] = useState<User>();

  const getAuth = async () => {
    // Is user authenticated?
    // Get auth
    try {
      const res = await getCurrentUsername();

      if (res.status === 200 && res.data?.username) {
        // Authenticated
        setCreateError(false);

        const userInfo = {
          firstName: res.data.firstName,
          lastName: res.data.lastName,
          username: res.data.username,
          primaryEmail: res.data.primaryEmail,
          userId: res.data.userId,
        };

        setUserData(userInfo);
      } else {
        // If there is any issue authenticating the user's account,
        // immediatly send the user to the login screen
        navigate(paths.routes.LOGIN);
        setCreateError(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Function to handle the button clicks and update the h1 text
  const handleTextChange = (text: string, path: string) => {
    // setHeaderText(text);
    setActivePage(text);
    navigate(path); // Navigate to the specified path
  };

  React.useEffect(() => {
    window.addEventListener("resize", () => setWidth(window.innerWidth));
  });

  // Mobile layout
  if (width < breakpoint) {
    return (
      <div>
        <div className="sideBarContainer">
          <div className="containerButtonSideBar">
            <div className="containerButtonSideBar">
              <button
                id={"discover-sidebar-btn"}
                className={
                  activePage === "Discover"
                    ? "active sidebar-btn"
                    : "sidebar-btn"
                }
                onClick={() => handleTextChange("Discover", paths.routes.HOME)}
              >
                <ThemeIcon id={'compass'} width={30} height={28.85} className={'sidebar-icon mono-stroke'} ariaLabel={'discover'}/>
              </button>
              <button
                id={"meet-sidebar-btn"}
                className={
                  activePage === "Meet" ? "active sidebar-btn" : "sidebar-btn"
                }
                onClick={() => handleTextChange("Meet", paths.routes.MEET)}
              >
                <ThemeIcon id={'meet'} width={30} height={28.85} className={'sidebar-icon mono-stroke'} ariaLabel={'meet'}/>
              </button>
              <button
                id={"my-projects-sidebar-btn"}
                className={
                  activePage === "My Projects"
                    ? "active sidebar-btn"
                    : "sidebar-btn"
                }
                onClick={() =>
                  handleTextChange("My Projects", paths.routes.MYPROJECTS)
                }
              >
                <ThemeIcon id={'folder'} width={30} height={28.85} className={'sidebar-icon mono-stroke'} ariaLabel={'my projects'}/>
              </button>
              <button
                id={"my-profile-sidebar-btn"}
                className={
                  activePage === "My Profile"
                    ? "active sidebar-btn"
                    : "sidebar-btn"
                }
                onClick={() =>
                  handleTextChange("My Profile", paths.routes.NEWPROFILE)
                }
              >
                <ThemeIcon src={'assets/white/profile.png'} lightModeColor={'black'} alt={'my profile'} />
              </button>
            </div>
          </div>
        </div>

        {/* <Notifications show={showNotifications} onClose={() => { setShowNotifications(!showNotifications); }} /> */}
      </div>
    );
  }

  // Desktop layout
  return (
    <div>
      <div className="SideBarContainer">
        <div className="headerContainer">
          <h1
            style={{ cursor: "pointer" }}
            onClick={() => handleTextChange("Discover", paths.routes.HOME)}
          >
            lfg.
          </h1>
        </div>

        <div className="containerButtonSideBar">
          <button
            id={"discover-sidebar-btn"}
            className={
              activePage === "Discover" ? "active sidebar-btn" : "sidebar-btn"
            }
            onClick={() => handleTextChange("Discover", paths.routes.HOME)}
          >
            <ThemeIcon id={'compass'} width={30} height={28.85} className={'sidebar-icon mono-stroke'} ariaLabel={'discover'}/>
            Discover 
          </button>
          <button
            id={"meet-sidebar-btn"}
            className={
              activePage === "Meet" ? "active sidebar-btn" : "sidebar-btn"
            }
            onClick={() => handleTextChange("Meet", paths.routes.MEET)}
          >
            <ThemeIcon id={'meet'} width={30} height={28.85} className={'sidebar-icon mono-stroke'} ariaLabel={'meet'}/>
            Meet
          </button>
          <button
            id={"my-projects-sidebar-btn"}
            className={
              activePage === "My Projects"
                ? "active sidebar-btn"
                : "sidebar-btn"
            }
            onClick={() =>
              handleTextChange("My Projects", paths.routes.MYPROJECTS)
            }
          >
            <ThemeIcon id={'folder'} width={30} height={28.85} className={'sidebar-icon mono-stroke'} ariaLabel={'my projects'}/>
            My Projects
          </button>
          {/* <button className={activePage === 'Following' ? 'active' : ''} onClick={() => handleTextChange('Following', paths.routes.SETTINGS)}>
            // If implementing, use SVG sprite sheet instead of hard-coded png
            <img
              src="assets/following.png"
              src-light="assets/following.png"
              src-dark="assets/following.png"
              alt="" /> Following
          </button> */}

          {/* <button onClick={() => { setShowNotifications(!showNotifications); }}>
          <img src={bell} className="navIcon" alt="Notifications" />
          </button> */}

          {/*           {/* <button className={activePage === 'Messages' ? 'active' : ''} onClick={() => handleTextChange('Messages', paths.routes.MESSAGES)}>
          <img src="images/icons/nav/msg-nav.png" className="navIcon" alt="Messages" /> Messages
          </button> */}
        </div>

        {/* "Create" button in bottom left, made by ProjectCreatorManager */}
        {/* Sends the user to the log in page if they aren't logged in, otherwise allows them to create and edit a project */}

        <div className="Create">
          <ProjectCreatorEditor
            newProject={createError}
            buttonCallback={getAuth}
            user={userData}
          />
        </div>
      </div>

      <Notifications
        show={showNotifications}
        onClose={() => {
          setShowNotifications(false);
        }}
      />
    </div>
  );
};

export default SideBar;
