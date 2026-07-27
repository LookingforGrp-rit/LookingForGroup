import { SearchBar, DataSet } from './SearchBar';
import { Dropdown, DropdownButton, DropdownContent } from './Dropdown';
import { NotificationsDropdown } from './NotificationsDropdown';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useContext, ChangeEvent, FocusEvent, /*KeyboardEvent,*/ SetStateAction } from 'react';
import * as paths from '../constants/routes';
import { ThemeIcon } from './ThemeIcon';
import { ThemeContext } from '../contexts/ThemeContext';
import { useLocation } from 'react-router-dom'; // Hook to access the current location
import profilePicture from '../images/lfrog.png';
import { getUserAccessLevel } from '../api/mod-tools.ts';

//user utils
import { getCurrentAccount, /*getCurrentUsername,*/ googleLogout } from '../api/users.ts';
import { AddBugReportInput, MePrivate } from '@looking-for-group/shared';
import { Popup, PopupButton, PopupContent, /*PopupContext*/ } from './Popup.tsx';
import { POST } from '../api/index.ts';

//Header component to be used in pages

//Track user login state globally
export let loggedIn = false;

//to-do: allow click function of searchbar to be re-defineable
//Add functions to buttons (profile/settings = navigate to those pages; light mode: toggle light/dark mode)
//(logout = logout the user and send them to home page or equivalent)

type HeaderProps = {
  dataSets: DataSet[];
  onSearch: (results: unknown[][]) => void;
  value?: string;
  setSearch?: React.Dispatch<SetStateAction<string>>;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  hideSearchBar?: boolean;
  hideBackButton?: boolean;
  pageTitle?: string;
  setCurrentUserId?: (data: MePrivate | undefined) => Promise<void>;
  searchOnFocus?: (e: FocusEvent<HTMLInputElement>) => void;
  placeholderText: string;
  mobilePlaceholderText?: string;
  searchBlocklist?: string[];
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
export const Header: React.FC<HeaderProps> = ({
  dataSets,
  onSearch,
  value = "",
  setSearch,
  onChange,
  hideSearchBar = false,
  hideBackButton = true,
  pageTitle = "",
  setCurrentUserId,
  searchOnFocus,
  placeholderText = "",
  mobilePlaceholderText,
  searchBlocklist = [] }) => {
  // User info state
  const [firstName, setFirstName] = useState<string | null>(null);
  const [lastName, setLastName] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [profileImg, setProfileImg] = useState<string>('');
  const [userId, setUserId] = useState<number>();
  const location = useLocation(); // Hook to access the current location

  /* Is user admin OR moderator? */
  const [isUserAdmin, setIsUserAdmin] = useState<boolean>(false);

  // Pull the theme and setTheme function from useState() via a context
  const theme = useContext(ThemeContext)['theme'];
  const setTheme = useContext(ThemeContext)['setTheme'];

  //Text for light mode toggle button should be opposite of current theme
  const [modeToggle, setModeToggle] = useState(theme === 'dark' ? 'Light Mode' : 'Dark Mode');

  const [active, setActive] = useState(false);

  const navigate = useNavigate(); // Hook for navigation

  let bugReportText: string = "";

  /**
   * Checks mod permissions for the user on render (in useEffect)
   */
  const getUserPermissions = async () => {
    /* Ensures the user is logged in */
    const userAccount = await getCurrentAccount();
    if (userAccount.status === 200 && userAccount.data?.userId) {
      setUserId(userAccount.data?.userId);
      /* User must have mod permissions to access mod page */
      const accessLevel = await getUserAccessLevel(userAccount.data.userId);
      if (accessLevel.data?.toString() == 'Moderator' || accessLevel.data?.toString() == 'Administrator') {
        setIsUserAdmin(true);
      }
    }
  };

  // Fetch current user info on mount
  useEffect(() => {
    const fetchUsername = async () => {
      try {
        if (userId === -1) return;
        const res = await getCurrentAccount();

        if (res.status == 200 && res.data?.username) {
          loggedIn = true;
          setFirstName(res.data.firstName);
          setLastName(res.data.lastName);
          setUserId(res.data.userId);
          if (setCurrentUserId) setCurrentUserId(res.data);
          setEmail(res.data.ritEmail);
          setProfileImg(res.data.profileImage ?? profilePicture);
        } else {
          loggedIn = false;
          setUserId(-1);
          if (setCurrentUserId) setCurrentUserId(undefined);
          setFirstName('Guest');
          setEmail('');
          setProfileImg('');
        }
      } catch (err) {
        console.log('Error fetching username: ' + err);
        loggedIn = false;
        setUserId(-1);
        if (setCurrentUserId) setCurrentUserId(undefined);
        setFirstName('Guest');
        setEmail('');
        setProfileImg('');
      }
    };

    fetchUsername();
    getUserPermissions();
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
  // const handlePageChange = (path: string) => {
  //   //Have code to update sidebar display (unsure of how to do this yet)
  //   //Navigate to desired page
  //   navigate(path);
  // };

  // // Navigate to the current user's profile
  // const handleProfileAccess = async () => {
  //   // navigate to Profile, attach userID
  //   const res = await getCurrentUsername();
  //   const userId = res.data?.userId;
  //   navigate(`${paths.routes.PROFILE}?userID=${userId}`);

  //   // Collapse the dropwdown if coming from another user's page
  //   if (window.location.href.includes("profile")) {
  //     window.location.reload();
  //   }
  // };

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

  useEffect(() => {
    if (theme === 'dark') {
      setModeToggle('Light Mode');
    }
    else {
      setModeToggle('Dark Mode');
    }
  }, [theme]);

  return (
    <header id="header" className={active ? 'active' : ''}>
      {/* Conditional rendering for search bar */}
      {(!hideSearchBar) && (
        <div id="header-searchbar">
          <SearchBar
            dataSets={dataSets}
            onSearch={onSearch}
            setValue={setSearch}
            value={value}
            onChange={onChange}
            onFocus={searchOnFocus}
            placeholderText={placeholderText}
            mobilePlaceholderText={mobilePlaceholderText}
            searchBlocks={searchBlocklist}
          />
        </div>
      )}

      {/* Conditional rendering for back button*/}
      {(!hideBackButton) && (<div className="project-back-btn-header">
        <ThemeIcon
          role="button"
          id={'back'}
          width={70}
          height={25}
          className={'color-fill project-back-btn'}
          ariaLabel={'back'}
          onClick={() => { navigate(-1); }}
        />
      </div>)}

      {hideSearchBar && pageTitle !== "" ?
        <div id='title'>
          <h1 className="page-title">{pageTitle}</h1>
        </div>
        : ""}

      <div id="header-buttons">
        {/* About button */}
        <Link aria-label="About" id="about-btn" to={paths.routes.ABOUT} title="About">
          <ThemeIcon id={'info'} width={30} height={30} className={'color-stroke'} ariaLabel={'about'} />
        </Link>

        {/* Notifications bell + dropdown. Only renders/polls when logged in. */}
        <NotificationsDropdown enabled={Boolean(userId && userId > 0)} theme={theme} />

        {/* This is the top-right dropdown menu. */}
        <Dropdown callback={() => setActive(false)}>
          {/* This is the button to open the dropdown menu */}
          <DropdownButton ariaLabel="Profile Dropdown" buttonId="profile-btn" callback={() => setActive(!active)}>
            {(loggedIn) ? (
              <img
                src={`${profileImg || profilePicture}`}
                id={'profile-img-icon'}
                className={'rounded'}
                title={'Profile picture'}
                alt='avatar'
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
                    <p id="header-profile-username">{firstName} {lastName}</p>
                    <p id="header-profile-email">{email}</p>
                  </div>
                </button>

                <hr />

                {/* Dark/Light Theme Switcher */}
                <button onClick={switchTheme}>
                  <ThemeIcon id={'mode'} width={25} height={25} className={'mono-stroke'} ariaLabel={'current mode'} />
                  {modeToggle}
                </button>{' '}

                {/* Single unified auth entry point (logs in existing users, signs up new ones) */}
                <button
                  onClick={() =>
                    navigate(paths.routes.LOGIN, {
                      state: { from: location.pathname + location.search }
                    })
                  }
                  className="header-login-btn"
                >
                  <ThemeIcon id={'login'} width={25} height={25} className={'mono-fill'} ariaLabel={'log in or sign up'} />
                  Log In / Sign Up
                </button>
              </div>

            ) : (
              <div id="header-profile-dropdown">

                {/* Profile Icon (if user has one) */}
                <Link to={`${returnProfileAccess()}`} id="header-profile-user">
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
                    <p id="header-profile-username">{firstName} {lastName}</p>
                    <p id="header-profile-email">{email}</p>
                  </div>
                </Link>

                <hr />
                {/* Moderation Page Link */}
                {/* TO DO: Change icon when a new icon is found */}
                {isUserAdmin ?
                  <a href={paths.routes.MODERATION}>
                    <ThemeIcon id={'moderation'} width={25} height={25} className={'mono-fill'} ariaLabel={'moderation'} />
                    Moderation
                  </a>
                  : ""}

                {/* Dark/Light Theme Switcher */}
                <button onClick={switchTheme}>
                  <ThemeIcon id={'mode'} width={25} height={25} className={'mono-stroke'} ariaLabel={'current mode'} />
                  {modeToggle}
                </button>{' '}

                {/* Settings Link */}
                <Link to={paths.routes.SETTINGS}>
                  <ThemeIcon id={'settings'} width={25} height={25} className={'mono-stroke'} ariaLabel={'settings'} />
                  Settings
                </Link>

                {/* Bug report popup */}
                <Popup>
                  {/* Report a Bug button */}
                  <PopupButton buttonId='btn-report-bug'>
                    <ThemeIcon id={'warning'} width={25} height={25} className={''} ariaLabel={'report a bug'} />
                    Report a Bug
                  </PopupButton>

                  <PopupContent>
                    {/* Using the editor styles temporarily because they look good for this menu */}
                    <div className="small-popup" id="report-popup">
                    <h3>Report a Bug</h3>
                    <p>Please explain what the bug is, and the steps leading up to it occuring.</p>

                    <textarea
                      id='input-bug-report'
                      name='input-bug-report'
                      placeholder="Write your reasoning here..."
                      className="input input-multiline"
                      required
                      minLength={1}
                      maxLength={200}
                      onChange={(e) => {
                        bugReportText = e.currentTarget.value;
                      }}></textarea> <span className='required-asterisk'>*</span>

                    <button type='submit' id="btn-bug-report-submit"
                      onClick={() => {
                        if (bugReportText.trim().length !== 0) {

                          POST(`/me/report-bug`, {
                            reportText: bugReportText ? bugReportText : "No info provided."
                          });
                          window.location.reload();
                        } else {
                          const errorReport = document.querySelector("#error-report");

                          if (errorReport) {
                            errorReport.textContent = "Please fill submit a description of the bug.";
                          }
                        }
                      }}>Submit</button>
                    </div>
                  </PopupContent>
                </Popup>

                {/* LOG OUT Button */}
                <button onClick={async () => {
                  if (userId) {
                    await googleLogout(userId);
                    navigate(paths.routes.HOME);
                    window.location.reload();
                  }
                }}>
                  <ThemeIcon id={'logout'} width={25} height={25} className={'mono-fill'} ariaLabel={'log out'} />
                  Log Out
                </button>
              </div>
            )}
          </DropdownContent>
        </Dropdown>
      </div>
    </header >
  );
};