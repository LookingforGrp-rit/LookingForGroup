import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as paths from '../constants/routes';
import { useSelector } from 'react-redux';
import Notifications from './pages/Notifications';
import { ThemeIcon } from './ThemeIcon';
import { ProjectCreatorEditor } from './ProjectCreatorEditor/ProjectCreatorEditor';

export interface User {
  first_name: string,
  last_name: string,
  username: string,
  primary_email: string,
  userId: number
}

// Tells ProjectCreatorEditor buttons to either show the popup or not
// Used to prevent the user from using the popup when they aren't logged in
export let showPopup: boolean 


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

  // Check to see what page we are on
  switch (window.location.pathname) {
    case '/discover':
      startingPage = 'Discover';
      break;
    case '/meet':
      startingPage = 'Meet';
      break;
    case '/myProjects':
      startingPage = 'My Projects';
      break;
    case '/messages':
      startingPage = 'Messages';
      break;
    case '/profile':
      startingPage = 'Profile';
      break;
    case '/settings':
      startingPage = 'Settings';
      break;
    default:
      startingPage = 'Discover';
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
      const response = await fetch('/api/auth');

      // Set error accordingly
      if (response.status !== 401) {
        // Authenticated
        setCreateError(false);
        // Save user id
        const { data } = await response.json();
        const id = data;

        // Get and save user data
        const getUserData = async () => {
          const userResponse = await fetch('/api/users/get-username-session');
          const { data } = await userResponse.json();
          const _userData = {
            first_name: data.first_name,
            last_name: data.last_name,
            username: data.username,
            primary_email: data.primary_email,
            userId: id
          }
          setUserData(_userData);
        }
        getUserData();

      } else {
        // If there is any issue authenticating the user's account, 
        // immediatly send the user to the login screen
        navigate(paths.routes.LOGIN);
        setCreateError(true);
      }
      
    } catch (err) {
      console.error(err);
    }
    
    // Sets the global variable whenever the local one is changed
    // Prevents the popup from showing up whenever you back out of the log in screen
    showPopup = !createError;
    //console.log(createError, showPopup);
  };

  // Function to handle the button clicks and update the h1 text
  const handleTextChange = (text, path) => {
    // setHeaderText(text);
    setActivePage(text);
    navigate(path); // Navigate to the specified path
  };

  React.useEffect(() => {
    window.addEventListener('resize', () => setWidth(window.innerWidth));
  });

  // Mobile layout
  if (width < breakpoint) {
    return (
      <div>
        <div className="sideBarContainer">
          <div className="containerButtonSideBar">
            <div className="containerButtonSideBar">
              <button
                className={activePage === 'Discover' ? 'active' : ''}
                onClick={() => handleTextChange('Discover', paths.routes.HOME)}
              >
                <ThemeIcon src={'assets/white/compass.svg'}  lightModeColor={'black'} alt={'discover'} />
              </button>
              <button
                className={activePage === 'Meet' ? 'active' : ''}
                onClick={() => handleTextChange('Meet', paths.routes.MEET)}
              >
                <ThemeIcon src={'assets/white/meet.svg'} lightModeColor={'black'} alt={'meet users'} />
              </button>
              <button
                className={activePage === 'My Projects' ? 'active' : ''}
                onClick={() => handleTextChange('My Projects', paths.routes.MYPROJECTS)}
              >
                <ThemeIcon src={'assets/white/folder.svg'} lightModeColor={'black'} alt={'my projects'} />
              </button>
              <button
                className={activePage === 'My Profile' ? 'active' : ''}
                onClick={() => handleTextChange('My Profile', paths.routes.NEWPROFILE)}
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
          <h1 style={{ cursor: 'pointer' }} onClick={() => handleTextChange('Discover', paths.routes.HOME)}>
            lfg.
          </h1>
        </div>

        <div className="containerButtonSideBar">
          <button
            className={activePage === 'Discover' ? 'active' : ''}
            onClick={() => handleTextChange('Discover', paths.routes.HOME)}
          >
            <ThemeIcon src={'assets/white/compass.svg'} lightModeColor={'black'} alt={'discover'}/>
            Discover
          </button>
          <button
            className={activePage === 'Meet' ? 'active' : ''}
            onClick={() => handleTextChange('Meet', paths.routes.MEET)}
          >
            <ThemeIcon src={'assets/white/meet.svg'}  lightModeColor={'black'} alt={'meet users'} /> Meet
          </button>
          <button
            className={activePage === 'My Projects' ? 'active' : ''}
            onClick={() => handleTextChange('My Projects', paths.routes.MYPROJECTS)}
          >
            <ThemeIcon src={'assets/white/folder.svg'} lightModeColor={'black'} alt={'my projects'} /> My
            Projects
          </button>
          {/* <button className={activePage === 'Following' ? 'active' : ''} onClick={() => handleTextChange('Following', paths.routes.SETTINGS)}>
            <img
              className='theme-icon'
              src="assets/white/following.png"
              src-light="assets/white/following.png"
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
          <ProjectCreatorEditor newProject={createError} buttonCallback={getAuth} user={userData} />
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
