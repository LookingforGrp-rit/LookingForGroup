import { SearchBar, DataSet } from './SearchBar';
import { Dropdown, DropdownButton, DropdownContent } from './Dropdown';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext, ChangeEvent } from 'react';
import * as paths from '../constants/routes';
import { ThemeIcon } from './ThemeIcon';
import { ThemeContext } from '../contexts/ThemeContext';
import { useLocation } from 'react-router-dom'; // Hook to access the current location
import profilePicture from '../images/blue_frog.png';

//user utils
import { getCurrentAccount, getCurrentUsername, googleLogout } from '../api/users.ts';
import { MePrivate } from '@looking-for-group/shared';

//Header component to be used in pages

//Track user login state globally
export let loggedIn = false;

//to-do: allow click function of searchbar to be re-defineable
//Add functions to buttons (profile/settings = navigate to those pages; light mode: toggle light/dark mode)
//(logout = logout the user and send them to home page or equivalent)

type HeaderProps = {
  dataSets : DataSet[];
  onSearch : (results : unknown[][]) => void;
  value? : string;
  onChange? : (e: ChangeEvent<HTMLInputElement>) => void;
  hideSearchBar? : boolean;
  hideBackButton? : boolean;
  setCurrentUserId?: (data: MePrivate | undefined) => Promise<void>;
};

/**
 * Top-level navigation and utility bar displayed across pages. 
 * Provides search functionality, profile access, theme switching, 
 * and user-specific dropdown actions. When authenticated, the header 
 * displays the user’s profile image, username, and navigation options; 
 * otherwise it shows guest controls and a login button.
 *
 * @param dataSets - Data passed into the search bar for filtering and suggestions.
 * @param onSearch - Executed when the search bar submits a query.
 * @param value - Current search bar input value.
 * @param onChange - Change handler for updating the search input value.
 * @param props.hideSearchBar- If true, disables rendering of the search bar.
 * @returns A fully featured header containing the search bar, 
 * user dropdown menu, theme toggle, and navigation controls.
 */
export const Header : React.FC<HeaderProps> = ({ dataSets, onSearch, value = "", onChange, hideSearchBar = false, hideBackButton = true, setCurrentUserId}) => {
  // User info state
  const [username, setUsername] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [profileImg, setProfileImg] = useState<string>('');
  const [userId, setUserId] = useState<number>();
  const location = useLocation(); // Hook to access the current location

  // Pull the theme and setTheme function from useState() via a context
  const theme = useContext(ThemeContext)['theme'];
  const setTheme = useContext(ThemeContext)['setTheme'];

  //Text for light mode toggle button should be opposite of current theme
  const [modeToggle, setModeToggle] = useState(theme === 'dark' ? 'Light Mode' : 'Dark Mode');

  const navigate = useNavigate(); // Hook for navigation

  // Fetch current user info on mount
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        if(userId === -1) return;
        const res = await getCurrentAccount();

        if (res.status == 200 && res.data?.username) {
          loggedIn = true;
          setUsername(res.data.username);
          setUserId(res.data.userId);
          if (setCurrentUserId) setCurrentUserId(res.data);
          setEmail(res.data.ritEmail);
          setProfileImg(res.data.profileImage ?? profilePicture);
        } else {
          loggedIn = false;
          setUserId(-1);
          if (setCurrentUserId) setCurrentUserId(undefined);
          setUsername('Guest');
          setEmail('');
          setProfileImg('');
        }
      } catch (err) {
        console.log('Error fetching username: ' + err);
        loggedIn = false;
        setUserId(-1);
          if (setCurrentUserId) setCurrentUserId(undefined);
        setUsername('Guest');
        setEmail('');
        setProfileImg('');
      }
    };

    fetchUsername();
  }, []);

  //loads in the data for the header
  // useEffect(() => {
  //   console.log(userProfile);
  //   if (userProfile.username !== '') {
  //     loggedIn = true
  //     setUsername(userProfile.username);
  //     setEmail(userProfile.ritEmail);
  //     setProfileImg(userProfile.profileImage ?? '');
  //   } else {
  //     loggedIn = false
  //     setUsername('Guest');
  //     setEmail('');
  //     setProfileImg('');
  //   }
  // },[]);

  // Navigate to a page and optionally update sidebar (if implemented)
  const handlePageChange = (path: string) => {
    //Have code to update sidebar display (unsure of how to do this yet)
    //Navigate to desired page
    navigate(path);
  };

  // Navigate to the current user's profile
  const handleProfileAccess = async () => {
    // navigate to Profile, attach userID
    const res = await getCurrentUsername();
    const userId = res.data?.userId;
    navigate(`${paths.routes.PROFILE}?userID=${userId}`);

    // Collapse the dropwdown if coming from another user's page
    if (window.location.href.includes("profile")) {
      window.location.reload();
    }
  };
  const returnProfileAccess = () => {
    // navigate to Profile, attach userID
    if (userId) return (`${paths.routes.PROFILE}?userID=${userId}`);
    return paths.routes.LOGIN;
    

    // Collapse the dropwdown if coming from another user's page
    if (window.location.href.includes("profile")) {
      window.location.reload();
    }
  };

  // Toggle between light and dark mode
  const switchTheme = () => {
    setModeToggle(theme === 'dark' ? 'Dark Mode' : 'Light Mode');
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(()=>{
    if(theme === 'dark') {
      setModeToggle('Light Mode');
     } 
     else {
      setModeToggle('Dark Mode'); 
    }
  },[theme]);

  return (
    <div id="header">
      {/* Conditional rendering for search bar */}
      {(!hideSearchBar) && (
        <div id="header-searchbar">
          <SearchBar
            dataSets={dataSets}
            onSearch={onSearch}
            value={value}
            onChange={onChange}
          />
        </div>
      )}

      {/* Conditional rendering for back button*/}
      {(!hideBackButton) && (<div className="project-back-btn-header">
        <ThemeIcon id={'back'} width={70} height={25} className={'color-fill project-back-btn'} ariaLabel={'back'} onClick={() => { navigate(-1); }} />
      </div>)}

      <div id="header-buttons">
        {/* Notififcations not being used rn */}
        {/* <Dropdown>
          <DropdownButton buttonId="notif-btn">
            // If implementing, use SVG sprite sheet instead of hard-coded pngs
            <img
              src="/assets/bell_dark.png"
              src-light="/assets/bell_light.png"
              src-dark="/assets/bell_dark.png"
              alt="" />
          </DropdownButton>
          <DropdownContent rightAlign={true}>This is where notification stuff will be</DropdownContent>
        </Dropdown> */}

        {/* This is the top-right dropdown menu. */}
        <Dropdown>
          {/* This is the button to open the dropdown menu */}
          <DropdownButton buttonId="profile-btn">
            {(loggedIn) ? (
              <img
                src={`${profileImg || profilePicture}`}
                id={'profile-img-icon'}
                className={'rounded'}
                title={'Profile picture'}
                // Cannot use usePreloadedImage function because this is in a callback
                onError={() => {
                  setProfileImg(profilePicture);
                }}
              />
            ) : (
              <ThemeIcon id={'profile'} width={32} height={32} className={'color-fill'} ariaLabel={'profile'} />
            )}
            <ThemeIcon
              id={'dropdown-arrow'}
              width={15}
              height={12}
              className={'color-fill'}
              ariaLabel={'dropdown arrow'} />
          </DropdownButton>

          {/* These are its elements once opened (unique for logged out/in) */}
          <DropdownContent rightAlign={true}>
            {!loggedIn ? (
              <div id="header-profile-dropdown">

                {/* (Blank) Profile Icon */}
                <button id="header-profile-user">
                  <ThemeIcon id={'profile'} width={32} height={32} className={'color-fill'} ariaLabel={'profile'} />
                  <div id="header-profile-user-info">
                    <p id="header-profile-username">{username}</p>
                    <p id="header-profile-email">{email}</p>
                  </div>
                </button>

                <hr />

                {/* Dark/Light Theme Switcher */}
                <button onClick={switchTheme}>
                  <ThemeIcon id={'mode'} width={25} height={25} className={'mono-stroke'} ariaLabel={'current mode'} />
                  {modeToggle}
                </button>{' '}

                {/* LOG IN Button */}
                <a href={paths.routes.LOGIN}>
                  <ThemeIcon id={'login'} width={25} height={25} className={'mono-fill'} ariaLabel={'log in'}/>
                  Log In
                </a>

                {/* SIGN UP Button */}
                <a href={paths.routes.SIGNUP}>
                  <ThemeIcon id={'login'} width={25} height={25} className={'mono-fill'} ariaLabel={'log in'}/>
                  Sign Up
                </a>
              </div>

            ) : (
              <div id="header-profile-dropdown" style={{ height: 200 }}>

                {/* Profile Icon (if user has one) */}
                <a href={`${returnProfileAccess()}`} id="header-profile-user">
                  {
                    <img
                      src={`${profileImg || profilePicture}`}
                      className={'rounded'}
                      alt={'profile'}
                      onError={() => {
                        setProfileImg(profilePicture);
                      }}
                    />}
                  <div id="header-profile-user-info">
                    <p id="header-profile-username">{username}</p>
                    <p id="header-profile-email">{email}</p>
                  </div>
                </a>

                <hr />

                {/* Dark/Light Theme Switcher */}
                <button onClick={switchTheme}>
                  <ThemeIcon id={'mode'} width={25} height={25} className={'mono-stroke'} ariaLabel={'current mode'} />
                  {modeToggle}
                </button>{' '}

                {/* Settings Link */}
                <a href={paths.routes.SETTINGS}>
                  <ThemeIcon id={'settings'} width={25} height={25} className={'mono-stroke'} ariaLabel={'settings'}/>
                  Settings
                </a>

                {/* LOG OUT Button */}
                <button onClick={async () => {
                  if(userId) {
                    await googleLogout(userId);
                    navigate(paths.routes.HOME);
                    window.location.reload();
                  }
                  }}>
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