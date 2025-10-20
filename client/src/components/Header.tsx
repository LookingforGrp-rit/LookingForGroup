import { SearchBar } from './SearchBar';
import { Dropdown, DropdownButton, DropdownContent } from './Dropdown';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext } from 'react';
import * as paths from '../constants/routes';
import { sendPost } from '../functions/fetch';
import { ThemeIcon } from './ThemeIcon';
import { ThemeContext } from '../contexts/ThemeContext';
import { useLocation } from 'react-router-dom'; // Hook to access the current location
import profilePicture from '../images/blue_frog.png';

//user utils
import { getCurrentUsername } from '../api/users.ts';

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
          setProfileImg(res.data.profileImage ?? '');
        } else {
          loggedIn = false;
          setUsername('Guest');
          setEmail(null);
          setProfileImg('');
        }
      } catch (err) {
        console.log('Error fetching username: ' + err);
        loggedIn = false;
        setUsername('Guest');
        setEmail(null);
        setProfileImg('');
      }
    };

    fetchUsername();
  }, []);

  const handlePageChange = (path: string) => {
    //Have code to update sidebar display (unsure of how to do this yet)
    //Navigate to desired page
    navigate(path);
  };

  const handleProfileAccess = async () => {
    // navigate to Profile, attach userID
    const res = await getCurrentUsername();
    const userId = res.data.userId;
    navigate(`${paths.routes.PROFILE}?userID=${userId}`);

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
            // If implementing, use SVG sprite sheet instead of hard-coded pngs
            <img
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
                src={`images/profiles/${profileImg}`}
                id={'profile-img-icon'}
                className={'rounded'}
                title={'Profile picture'}
                // Cannot use usePreloadedImage function because this is in a callback
                onLoad={(e) => {
                  const profileImg = e.target as HTMLImageElement;
                  profileImg.src = `images/profiles/${profileImg}`;
                }}
                onError={(e) => {
                  const profileImg = e.target as HTMLImageElement;
                  profileImg.src = profilePicture;
                }}
              />
            ) : (
              <ThemeIcon id={'profile'} width={32} height={32} className={'color-fill'} ariaLabel={'profile'}/>
            )}
            <ThemeIcon
              id={'dropdown-arrow'}
              width={15}
              height={12}
              className={'color-fill'}
              ariaLabel={'dropdown arrow'}/>
          </DropdownButton>

          {/* These are its elements once opened (unique for logged out/in) */}
          <DropdownContent rightAlign={true}>
            {!loggedIn ? (
              <div id="header-profile-dropdown" style={{ height: 150 }}>

                {/* (Blank) Profile Icon */}
                <button id="header-profile-user">
                  <ThemeIcon id={'profile'} width={32} height={32} className={'color-fill'} ariaLabel={'profile'}/>
                  <div>
                    {username}
                    <br />
                    <span id="header-profile-email">{email}</span>
                  </div>
                </button>

                <hr />

                {/* Dark/Light Theme Switcher */}
                <button onClick={switchTheme}>
                  <ThemeIcon id={'mode'} width={25} height={25} className={'mono-stroke'} ariaLabel={'current mode'}/>
                  {modeToggle}
                </button>{' '}

                {/* LOG IN Button */}
                <button onClick={() => navigate(paths.routes.LOGIN, { state: { from: location.pathname } })}>
                  <ThemeIcon id={'login'} width={25} height={25} className={'mono-fill'} ariaLabel={'log in'}/>
                  Log In
                </button>
              </div>

            ) : (
              <div id="header-profile-dropdown" style={{ height: 200 }}>

                {/* Profile Icon (if user has one) */}
                <button onClick={() => handleProfileAccess()} id="header-profile-user">
                  {(profileImg) ? (
                    <img
                      src={`images/profiles/${profileImg}`}
                      className={'rounded'}
                      alt={'profile'}
                      // Cannot use usePreloadedImage function because this is in a callback
                      onLoad={(e) => {
                        const profileImg = e.target as HTMLImageElement;
                        profileImg.src = `images/profiles/${profileImg}`;
                      }}
                      onError={(e) => {
                        const profileImg = e.target as HTMLImageElement;
                        profileImg.src = profilePicture;
                      }}
                    />
                  ) : (
                    <ThemeIcon id={'profile'} width={32} height={32} className={'color-fill'} ariaLabel={'profile'}/>
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
                  <ThemeIcon id={'mode'} width={25} height={25} className={'mono-stroke'} ariaLabel={'current mode'}/>
                  {modeToggle}
                </button>{' '}

                {/* Settings Link */}
                <button onClick={() => handlePageChange(paths.routes.SETTINGS)}>
                  <ThemeIcon id={'settings'} width={25} height={25} className={'mono-stroke'} ariaLabel={'settings'}/>
                  Settings
                </button>

                {/* LOG OUT Button */}
                <button onClick={() => sendPost('/api/logout')}>
                  <ThemeIcon id={'logout'} width={25} height={25} className={'mono-fill'} ariaLabel={'log out'}/>
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