//Styles
import './Styles/credits.css';
import './Styles/discoverMeet.css';
import './Styles/emailConfirmation.css';
import './Styles/general.css';
import './Styles/loginSignup.css';
import './Styles/messages.css';
import './Styles/notification.css';
import './Styles/profile.css';
import './Styles/projects.css';
import './Styles/settings.css';
import './Styles/pages.css';

import { SearchBar } from './SearchBar';
import { Dropdown, DropdownButton, DropdownContent } from './Dropdown';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import * as paths from '../constants/routes';
import { sendPost } from '../functions/fetch';
import { ThemeIcon } from './ThemeIcon';
import { ThemeContext } from '../contexts/ThemeContext';
import { useLocation } from 'react-router-dom'; // Hook to access the current location

//user utils
import { getCurrentUsername } from '../api/users.ts';

//backend base url for getting images
const API_BASE = `http://localhost:8081`;

//Header component to be used in pages

export let loggedIn = false;

//dataSets - list of data for the searchbar to use
//onSearch - function for the searchbar to run when searching
//These are directly used in the searchbar of this component, and funciton identically so

//to-do: allow click function of searchbar to be re-defineable
//Add functions to buttons (profile/settings = navigate to those pages; light mode: toggle light/dark mode)
//(logout = logout the user and send them to home page or equivalent)

export const Header = ({ dataSets, onSearch, hideSearchBar = false }) => {
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState(null);
  const [profileImg, setProfileImg] = useState<string>('');
  const location = useLocation(); // Hook to access the current location

  // Pull the theme and setTheme function from useState() via a context
  const theme = useContext(ThemeContext)['theme'];
  const setTheme = useContext(ThemeContext)['setTheme'];

  //Text for light mode toggle button should be opposite of current theme
  const [modeToggle, setModeToggle] = useState(theme === 'dark' ? 'Light Mode' : 'Dark Mode');

  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const res = await getCurrentUsername();

        if (res.status == 200 && res.data?.username) {
          loggedIn = true;
          setUsername(res.data.username);
          setEmail(res.data.email ?? null);
          setProfileImg(res.data.profile_image ?? '');
        } else {
          loggedIn == false;
          setUsername('Guest');
          setEmail(null);
          setProfileImg('');
        }
      } catch (err) {
        console.log('Error fetching username: ' + err);
        loggedIn == false;
        setUsername('Guest');
        setEmail(null);
        setProfileImg('');
      }
    };

    fetchUsername();
  }, []);

  const handlePageChange = (path) => {
    //Have code to update sidebar display (unsure of how to do this yet)
    //Navigate to desired page
    navigate(path);
  };

  const handleProfileAccess = async () => {
    // navigate to Profile, attach userID
    const res = await getCurrentUsername();
    const username = res.data.username;
    navigate(`${paths.routes.NEWPROFILE}?userID=${username}`);

    // Collapse the dropwdown if coming from another user's page
    if (window.location.href.includes("profile")) {
      window.location.reload();
    }
  };

  const switchTheme = () => {
    setModeToggle(theme === 'dark' ? 'Dark Mode' : 'Light Mode');
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div id="header">
      {/* Conditional rendering for search bar */}
      {(!hideSearchBar) && (
        <div id="header-searchbar">
          <SearchBar dataSets={dataSets} onSearch={onSearch} />
        </div>
      )}
      <div id="header-buttons">
        {/* Notififcations not being used rn */}
        {/* <Dropdown>
          <DropdownButton buttonId="notif-btn">
            <img
              className="theme-icon"
              src="assets/bell_dark.png"
              src-light="assets/bell_light.png"
              src-dark="assets/bell_dark.png"
              alt="" />
          </DropdownButton>
          <DropdownContent rightAlign={true}>This is where notification stuff will be</DropdownContent>
        </Dropdown> */}

        {/* This is the top-right dropdown menu. */}
        <Dropdown>
          {/* This is the button to open the dropdown menu */}
          <DropdownButton buttonId="profile-btn">
            {(profileImg) ? (
              <img
                src={`${API_BASE}/images/profiles/${profileImg}`}
                id={'profile-img-icon'}
                className={'rounded'}
              />
            ) : (
              <ThemeIcon
                light={'/assets/profile_light.png'}
                dark={'/assets/profile_dark.png'}
                id={'profile-img-icon'}
              />
            )}
            <ThemeIcon
              light={'/assets/dropdown_light.png'}
              dark={'/assets/dropdown_dark.png'}
              id="dropdown-arrow"
            />
          </DropdownButton>

          {/* These are its elements once opened (unique for logged out/in) */}
          <DropdownContent rightAlign={true}>
            {!loggedIn ? (
              <div id="header-profile-dropdown" style={{ height: 150 }}>

                {/* (Blank) Profile Icon */}
                <button id="header-profile-user">
                  <ThemeIcon
                    light={'/assets/profile_light.png'}
                    dark={'/assets/profile_dark.png'}
                    alt={'profile'}
                  />
                  <div>
                    {username}
                    <br />
                    <span id="header-profile-email">{email}</span>
                  </div>
                </button>

                <hr />

                {/* Dark/Light Theme Switcher */}
                <button onClick={switchTheme}>
                  <ThemeIcon
                    light={'/assets/black/mode.png'}
                    dark={'/assets/white/mode.png'}
                    alt={'current mode'}
                  />
                  {modeToggle}
                </button>{' '}

                {/* LOG IN Button */}
                <button onClick={() => navigate(paths.routes.LOGIN, { state: { from: location.pathname } })}>
                  <ThemeIcon
                    light={'/assets/black/logout.png'}
                    dark={'/assets/white/logout.png'}
                    alt={'log in'}
                  />
                  Log In
                </button>
              </div>

            ) : (
              <div id="header-profile-dropdown" style={{ height: 200 }}>

                {/* Profile Icon (if user has one) */}
                <button onClick={() => handleProfileAccess()} id="header-profile-user">
                  {(profileImg) ? (
                    <img
                      src={`${API_BASE}/images/profiles/${profileImg}`}
                      className={'rounded'}
                      alt={'profile'}
                    />
                  ) : (
                    <ThemeIcon
                      light={'/assets/profile_light.png'}
                      dark={'/assets/profile_dark.png'}
                      alt={'profile'}
                    />
                  )}
                  <div>
                    {username}
                    <br />
                    <span id="header-profile-email">{email}</span>
                  </div>
                </button>

                <hr />

                {/* Dark/Light Theme Switcher */}
                <button onClick={switchTheme}>
                  <ThemeIcon
                    light={'/assets/black/mode.png'}
                    dark={'/assets/white/mode.png'}
                    alt={'current mode'}
                  />
                  {modeToggle}
                </button>{' '}

                {/* Settings Link */}
                <button onClick={() => handlePageChange(paths.routes.SETTINGS)}>
                  <ThemeIcon
                    light={'/assets/black/settings.png'}
                    dark={'/assets/white/settings.png'}
                    alt={'settings'}
                  />
                  Settings
                </button>

                {/* LOG OUT Button */}
                <button onClick={() => sendPost('/api/logout')}>
                  <ThemeIcon
                    light={'/assets/black/logout.png'}
                    dark={'/assets/white/logout.png'}
                    alt={'log out'}
                  />
                  Log Out
                </button>
              </div>
            )}
          </DropdownContent>
        </Dropdown>
      </div>
    </div >
  );
};