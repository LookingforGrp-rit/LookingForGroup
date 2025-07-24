import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as paths from "../constants/routes";
import { useSelector } from "react-redux";
import Notifications from "./pages/Notifications";
import { ThemeIcon } from "./ThemeIcon";
import { ProjectCreatorEditor } from "./ProjectCreatorEditor/ProjectCreatorEditor";
//user utils
import { getCurrentUsername } from "../api/users.ts";

export interface User {
  first_name: string;
  last_name: string;
  username: string;
  primary_email: string;
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

  const [activePage, setActivePage] = useState(startingPage); // State to manage the active page [Discover, Meet, My Projects, Messages, Profile, Settings]

  const [showNotifications, setShowNotifications] = useState(false); // State to manage the notifications modal

  // Error to handle if Create button opens project creator
  const [createError, setCreateError] = useState(true);

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

        const _userData = {
          first_name: res.data.first_name,
          last_name: res.data.last_name,
          username: res.data.username,
          primary_email: res.data.primary_email,
          userId: res.data.userId,
        };

        setUserData(_userData);
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
  const handleTextChange = (text, path) => {
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
                <ThemeIcon
                  light={"/assets/black/compass.png"}
                  dark={"/assets/white/compass.png"}
                  alt={"discover"}
                />
              </button>
              <button
                id={"meet-sidebar-btn"}
                className={
                  activePage === "Meet" ? "active sidebar-btn" : "sidebar-btn"
                }
                onClick={() => handleTextChange("Meet", paths.routes.MEET)}
              >
                <ThemeIcon
                  light={"/assets/black/meet.png"}
                  dark={"/assets/white/meet.png"}
                  alt={"meet users"}
                />
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
                <ThemeIcon
                  light={"/assets/black/folder.png"}
                  dark={"/assets/white/folder.png"}
                  alt={"my projects"}
                />
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
                <ThemeIcon
                  light={"/assets/black/profile.png"}
                  dark={"/assets/white/profile.png"}
                  alt={"my profile"}
                />
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
            <ThemeIcon
              light={"/assets/black/compass.png"}
              dark={"/assets/white/compass.png"}
              alt={"discover"}
            />
            Discover
          </button>
          <button
            id={"meet-sidebar-btn"}
            className={
              activePage === "Meet" ? "active sidebar-btn" : "sidebar-btn"
            }
            onClick={() => handleTextChange("Meet", paths.routes.MEET)}
          >
            <ThemeIcon
              light={"/assets/black/meet.png"}
              dark={"/assets/white/meet.png"}
              alt={"meet users"}
            />{" "}
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
            <ThemeIcon
              light={"/assets/black/folder.png"}
              dark={"/assets/white/folder.png"}
              alt={"my projects"}
            />{" "}
            My Projects
          </button>
          {/* <button className={activePage === 'Following' ? 'active' : ''} onClick={() => handleTextChange('Following', paths.routes.SETTINGS)}>
            <img
              className='theme-icon'
              src="assets/black/following.png"
              src-light="assets/black/following.png"
              src-dark="assets/white/following.png"
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
