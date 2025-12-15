import { Dropdown, DropdownButton, DropdownContent } from '../Dropdown';
//import { sendPost, sendDelete, sendPut } from '../../functions/fetch';
import { Popup, PopupButton, PopupContent } from '../Popup';
import { ThemeContext } from '../../contexts/ThemeContext';
import { ThemeIcon } from '../ThemeIcon';
import { useNavigate } from 'react-router-dom';
import { useState, useContext, SetStateAction } from 'react';
import { Header } from '../Header';
import CreditsFooter from '../CreditsFooter';
//import PasswordValidator from 'password-validator';
import ToTopButton from '../ToTopButton';
import * as paths from '../../constants/routes';
import { getUserByEmail, getUserByUsername, getCurrentAccount, deleteUser, editUser } from '../../api/users';
import { MePrivate, UpdateUserInput } from '@looking-for-group/shared';
type JsonData = Record<string, unknown>;

// Take the user ID and delete it
const deleteAccountPressed = async () => {
  await deleteUser();
};

/**
 * Settings page. Renders the settings page interface with options for updating user account information, appearance preferences, and account settings
 * @returns JSX Element
 */
const Settings = () => {
  // --------------------
  // Global variables
  // --------------------
  // Variables regarding pulling user data
  const [dataLoaded, setDataLoaded] = useState(false);
  const [userInfo, setUserInfo] = useState<MePrivate>();

  const navigate = useNavigate();

  // Pull stateful theme variable and setter via context
  const theme = useContext(ThemeContext)['theme'];
  const setTheme = useContext(ThemeContext)['setTheme'];

  // Stateful variables responsible for displaying settings
  const [themeOption, setThemeOption] = useState(theme === 'dark' ? 'Dark Mode' : 'Light Mode');
  // const [visibilityOption, setVisibilityOption] = useState('Public Account');

  // --------------------
  // Helper functions
  // --------------------

  // TODO: Function needed to check password!
  // TODO: Function needed to check field validity (e.g. is this actually an email?)

  /**
   * Checks if user is logged in and pulls all relevant data
   */
  const getUserData = async () => {
    // authentication
    const acc = await getCurrentAccount();
    if ( !acc.error && acc.data) {
      setUserInfo(acc.data);
    }

    // Don't call API again even if user isn't logged in
    setDataLoaded(true);
  };

  // Uses stateful variable to only run once at initial render
  if (!dataLoaded) {
    getUserData();
  }

  // If user is not logged in, redirect to login page
  if (userInfo === undefined) {
    navigate(paths.routes.LOGIN, { state: { from: location.pathname } })
  }

  // --------------------
  // Components:
  // --------------------
  /**
   * Component that displays confirmation dialog when changing username, email, or password
   * @param type Indicated what is bring changed: username, primary email, or password.
   * @param prev Previous value
   * @param cur New value
   * @param apiParams Objects with parameters for API call
   * @param setError Function to set error message in parent component
   * @param setSuccess Function to set success message in parent component
   * @returns 
   */
  const ConfirmChange = ({ type, prev = '', cur = '', apiParams, setError, setSuccess } : 
    {type: string, prev: string, cur: string, apiParams: JsonData, setError: React.Dispatch<SetStateAction<string>>, setSuccess: React.Dispatch<SetStateAction<string>>}) => {
    //const [password, setPassword] = useState('');

    // git merge 07/24/2025: Yevhenii Shyshko
    // possible last three lines need to be deleted
    return (
      <div className="small-popup">
        <h3>Confirm {type}{type === 'Phone' ? ' Number' : ''} Change</h3>
        <p className="confirm-msg">
          Are you sure you want to change your {type.toLowerCase()}
          {type === 'Phone' ? (<span> number</span>) : (<></>)}
          {prev !== '' ? (
            <span>
              &#32;{' '}from{' '}
              <span className="confirm-change-item">{type === 'Username' ? `@${prev}` : prev}</span>
            </span>
          ) : (<></>)}
          {cur !== '' ? (
            <span>
              &#32;{' '}to{' '}
              <span className="confirm-change-item">{type === 'Username' ? `@${cur}` : cur}</span>
            </span>
          ) : (<></>)}
          ?
        </p>

        {/* Password confirmation input (we don't have passwords) */}
        {/* <div className="input-group">
          <label htmlFor="password">Enter your password to confirm:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="confirm-password-input"
            placeholder="Password"
          />
        </div> */}

        <div className="confirm-deny-btns">
          <PopupButton
            className="confirm-btn"
            callback={async () => {
              // If password is empty, show error and abort submission
              // if (!password.trim()) {
              //   setError('Password is required to confirm this change.');
              //   return;
              // }

              const onSuccess = () => {
                setSuccess(`Your ${type.toLowerCase()} has been updated!`);
                location.reload();
              };

              //this sendPut is only being annoying tbh
              const response = await editUser(apiParams);

              // If it returns back with an error, display it on parent popup
              if (response !== undefined && response.error) {
                setError(response.error);
              }
              else if(response.data) onSuccess();
            }}
          >
            Submit
          </PopupButton>

          <PopupButton className="deny-btn">Cancel</PopupButton>
        </div>
      </div>
    );
  };

  /**
   * Form component for editing account information based on the provided type
   * @param type Indicates which form to display: username, primary email, or password.
   * @returns JSX Element
   */
  // User form for changing username/password/email
  const ChangeForm = ({ type } : {type: string}) => {
    // Variables
    const [errorMsg, setError] = useState('');
    const [successMsg, setSuccess] = useState('');

    // Name of first param changes based on type for API request.
    // Latter two fields do not change in name
    const [firstParam, setFirstParam] = useState('');
    const [confirm, setConfirm] = useState('');
    //const [password, setPassword] = useState('');

    // Check password qualtiy, if attempting to change password
    //no passwords
    // const PasswordChecker = ({ pass }) => {
    //   const [missingReqs, setMissingReqs] = useState([]);

    //   const schema = new PasswordValidator();
    //   schema
    //     .is()
    //     .min(8, '8 or more characters')
    //     .is()
    //     .max(20, 'Must be 20 characters or fewer')
    //     .has()
    //     .uppercase(1, 'An uppercase letter')
    //     .has()
    //     .lowercase(1, 'A lowercase letter')
    //     .has()
    //     .digits(1, 'A number')
    //     .has()
    //     .symbols(1, 'A symbol')
    //     .has()
    //     .not()
    //     .spaces(1, 'May not contain any spaces')
    //     .has()
    //     .not('[^\x00-\x7F]+', 'May only use ASCII characters');

    //   useLayoutEffect(() => {
    //     const output = schema.validate(pass, { details: true });
    //     setMissingReqs(output);
    //   }, [pass]);

    //   if (missingReqs.length === 0) {
    //     return <></>;
    //   } else {
    //     return (
    //       <div className="pass-reqs">
    //         <h4>Password Requirements</h4>
    //         <ul>
    //           {missingReqs.map((req) => {
    //             return <li>{req.message}</li>;
    //           })}
    //         </ul>
    //       </div>
    //     );
    //   }
    // };

    // Set up params to be correctly passed into API
    const apiParams: UpdateUserInput = {} as UpdateUserInput;
    switch (type) {
      // case 'Username':
      //   apiParams['username'] = firstParam;
      //   break;
      // case 'Primary Email':
      //   apiParams['email'] = firstParam;
      //   break;
      // case 'Password':
      //   apiParams['newPassword'] = firstParam;
      //   break;
      case 'Phone':
        apiParams['phoneNumber'] = firstParam;
    }

    return (
      <div
        className="small-popup"
        onClick={() => {
          if (successMsg !== '') {
            setSuccess('');

            // Update userInfo properly
            if (type !== 'Password') {
              // Create deep copy of object, make changes, then call state update
              const tempInfo = { ...userInfo };
              
              tempInfo[type.replace(' ').toLowerCase() as string] = firstParam;
              

              setUserInfo(tempInfo);
              //this isn't really needed but i'm gonna leave it anyway
            }
          }
        }}
      >
        <h3>Edit {type}{type === 'Phone' ? ' Number' : ''}</h3>
        {/*type === 'Password' ? <PasswordChecker pass={firstParam} /> : <></>*/}
        <div className="error">{errorMsg}</div>
        {errorMsg === '' && successMsg !== '' ? <div className="success">{successMsg}</div> : <></>}
        <hr />
        <div className="input-fields">
          <div className="input-container">
            {/* autoComplete to prevent browser autofill */}
            <form autoComplete="off">
              <input
                placeholder={`Enter new ${type.toLowerCase()}${type === 'Phone' ? ' number' : ''}`}
                type={type !== 'Password' ? 'text' : 'password'}
                onChange={(e) => {
                  const value = e.target.value;
                  setFirstParam(value);

                  // Checks if input matches other box, returns error if not
                  if (value !== confirm) {
                    setError(`*${type}s must match.`);
                    return;
                  }

                  // Email format validation
                  // if (type === 'Primary Email') {
                  //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  //   if (!emailRegex.test(value)) {
                  //     setError('*Please enter a valid email address.');
                  //     return;
                  //   }
                  // }

                  // Username format validation
                  //we don't have usernames anymore
                  // if (type === 'Username') {
                  //   const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
                  //   if (!usernameRegex.test(value)) {
                  //     setError('*Username must be 3-20 characters, letters, numbers, or underscores only.');
                  //     return;
                  //   }
                  // }

                  // Phone number format validation
                  if (type === 'Phone') {
                    const phoneRegex = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
                    if (!phoneRegex.test(value)) {
                      setError('*Please enter a valid phone number.');
                      return;
                    }
                  }

                  setError('');
                }}
                onBlur={async () => {
                  // TO-DO: Check if already in use if username
                  // or primary email address. Excludes password
                  //don't actually todo this these are not used anymore
                  
                    // if (type === 'Primary Email') {
                    //   const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    //   if (!emailRegex.test(firstParam)) {
                    //     setError('*Please enter a valid email address.');
                    //     return;
                    //   }
                    // }
                    // if (type === 'Username') {
                    //   const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
                    //   if (!usernameRegex.test(firstParam)) {
                    //     setError('*Username must be 3-20 characters, letters, numbers, or underscores only.');
                    //     return;
                    //   }
                    // }
                    if (type === 'Phone') {
                      const phoneRegex = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
                      if (!phoneRegex.test(firstParam)) {
                        setError('*Please enter a valid phone number.');
                        return;
                      }
                    }

                    if (type !== 'Password') {
                    let data;
                    if (type ==='Username')   data = await getUserByUsername(firstParam);
                    if(type === 'Email')      data = await getUserByEmail(firstParam);

                    if (data?.data) {
                      setError(`*${type} is already in use.`);
                    }
                  }
                }}
              />
            </form>
          </div>
          <div className="input-container">
            {/* autoComplete to prevent browser autofill */}
            <form autoComplete="off">
              <input
                className="input-container-confirm"
                placeholder={`Confirm new ${type.toLowerCase()}${type === 'Phone' ? ' number' : ''}`}
                type={type !== 'Password' ? 'text' : 'password'}
                onChange={(e) => {
                  setConfirm(e.target.value);

                  // Checks if input matches other box, returns error if not
                  if (e.target.value !== firstParam) {
                    setError(`*${type}s must match.`);
                  } else {
                    setError('');
                  }
                }}
              />
            </form>
          </div>
          {/* <div className="input-container">
            { autoComplete to prevent browser autofill }
            <form autoComplete="off">
              <input
                placeholder="Current password"
                type="password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </form>
          </div> */}
        </div>
        <div className="confirm-deny-btns">
          {/*Enabling the confirmation button:*/}
          {/*No errors (fields match), no missing reqs for changing password, input exists */}

          {/*Needs to confirm the password!*/}
          {/*Needs validation for fields! Make sure emails are emails! Etc*/}
          {/*Both of these will need valid feedback! "Please enter a valid email", "Incorrect password", etc! (Let bugfixing do this)*/}
          {(() => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
            const phoneRegex = /^\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;

            if (errorMsg !== '') return false;
            if (document.getElementsByClassName("pass-reqs")[0] != null) return false;
            if (firstParam === '') return false;

            if (type === 'Primary Email' && !emailRegex.test(firstParam)) {
              return false;
            }

            if (type === 'Username' && !usernameRegex.test(firstParam)) {
              return false;
            }

            if (type === 'Phone' && !phoneRegex.test(firstParam)) {
              return false;
            }

            return true;
          })() ?
            <Popup>
              <PopupButton className="confirm-btn">Submit</PopupButton>
              <PopupContent>
                <ConfirmChange
                  type={type}
                  prev={type === 'Username' ? userInfo!.username : ''}
                  cur={type !== 'Password' ? firstParam : ''}
                  apiParams={apiParams}
                  setError={setError}
                  setSuccess={setSuccess}
                />
              </PopupContent>
            </Popup> :
            <Popup><PopupButton doNotClose={() => true} className="confirm-btn confirm-btn-disabled">Submit</PopupButton></Popup>}
          <PopupButton className="deny-btn">Cancel</PopupButton>
        </div>
      </div>
    );
  };

  /**
   * Updates account visibility setting.
   * @param visibilityNum Visibilty setting: 0 for private, 1 for public.
   */
  // const updateVisibility = async (visibilityNum) => {
  //   // Don't run if the value hasn't changed
  //   if (visibilityNum !== userInfo.visibility) {
  //     const url = `/api/users/${userInfo.userId}/visibility`;
  //     const response = await sendPut(url, { newVisibility: visibilityNum });

  //     if (response !== undefined && response.error) {
  //       console.log(response.error);
  //     } else {
  //       // Update userInfo with newly updated visibility value
  //       const tempInfo = { ...userInfo };
  //       tempInfo.visibility = visibilityNum;
  //       setUserInfo(tempInfo);
  //     }
  //   }
  // };

  return (
    <div className="page" style={{ position: 'relative' }}>
      {/* Top-right profile dropdown */}
      <div
        style={{
          position: 'absolute',
          top: 20,
          right: 30,
          zIndex: 1000,
        }}
      ></div>

      {/* Search bar is not used in settings */}
      <div id="settings-page">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 className="page-title">Settings</h1>
          <Header dataSets={[]} onSearch={() => {}} hideSearchBar />
        </div>
        <hr />
        {userInfo === undefined ? (
          <p>You aren't logged in!</p>
        ) : (
          <div>
            {/* Top Row: Personal and Email Settings */}
            <div className="settings-row">
              {/* Personal Settings 
              <div className="settings-column">
                <h2 className="settings-header">Personal</h2>
                <div className="subsection">
                  <label htmlFor="option-username">Username</label>
                  <div className="input-container">
                    <input
                      id="option-username"
                      placeholder={`@${userInfo.username}`}
                      type="text"
                      disabled
                    />
                    <Popup>
                      <PopupButton className="interact-option">Edit</PopupButton>
                      <PopupContent>
                        <ChangeForm type={'Username'} />
                      </PopupContent>
                    </Popup>
                  </div>
                </div>
                <div className="subsection">
                  <label htmlFor="option-password">Password</label>
                  <div className="input-container">
                    <input
                      id="option-password"
                      placeholder="●●●●●●●●●●●●●●●●●●●●"
                      type="password"
                      disabled
                    />
                    <Popup>
                      <PopupButton className="interact-option">Edit</PopupButton>
                      <PopupContent>
                        <ChangeForm type={'Password'} />
                      </PopupContent>
                    </Popup>
                  </div>
                </div>
              </div> */}
              {/* Email Settings */}
              <div className="settings-column">
                <h2 className="settings-header">Email</h2>
                <div className="subsection">
                  <label htmlFor="option-rit-email">RIT Email</label>
                  <div className="input-container disabled">
                    <input
                      id="option-rit-email"
                      placeholder={userInfo.ritEmail}
                      type="text"
                      disabled
                    />
                  </div>
                </div>
              </div>

              {/* Phone Settings */}
              <div className="settings-column">
                <h2 className="settings-header">Contact</h2>
                <div className="subsection">
                  <label htmlFor="option-primary-phone">Phone Number</label>
                  <div className="input-container">
                    <input
                      id="option-primary-phone"
                      placeholder={'111-111-1111'}
                      type="text"
                      disabled
                    />
                    <Popup>
                      <PopupButton className="interact-option">Edit</PopupButton>
                      <PopupContent>
                        <ChangeForm type={'Phone'} />
                      </PopupContent>
                    </Popup>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom row: Appearance and Account Visibility */}
            <div className="settings-row">
              {/* Appearance */}
              <div className="settings-column">
                <h2 className="settings-header">Appearance</h2>
                <div className="subsection">
                  <label htmlFor="option-theme">Current Theme</label>
                  <Dropdown>
                    <DropdownButton buttonId="options-theme-btn">
                      <div className="input-container">
                        <input id="option-theme" placeholder={themeOption} type="text" disabled />
                        <ThemeIcon
                          id={'dropdown-arrow'}
                          width={15}
                          height={12}
                          className={'color-fill options-dropdown-parent-btn'}
                          ariaLabel={'current theme'}
                        />
                      </div>
                    </DropdownButton>
                    <DropdownContent>
                      <div id="options-theme-dropdown">
                        <DropdownButton
                          className="options-dropdown-button start"
                          callback={(e: { target: { innerText: SetStateAction<string>; }; }) => {
                            setTheme('light');
                            setThemeOption(e.target.innerText);
                          }}
                        >
                          <i className="fa-solid fa-sun"></i>
                          Light Mode
                        </DropdownButton>
                        <DropdownButton
                          className="options-dropdown-button"
                          callback={(e: { target: { innerText: SetStateAction<string>; }; }) => {
                            setTheme('dark');
                            setThemeOption(e.target.innerText);
                          }}
                        >
                          <i className="fa-solid fa-moon"></i>
                          Dark Mode
                        </DropdownButton>
                        <DropdownButton
                          className="options-dropdown-button end"
                          callback={(e: { target: { innerText: SetStateAction<string>; }; }) => {
                            // Checks for system theme preference
                            if (
                              window.matchMedia &&
                              window.matchMedia('(prefers-color-scheme: dark)').matches
                            ) {
                              setTheme('dark');
                            } else if (
                              window.matchMedia &&
                              window.matchMedia('(prefers-color-scheme: light)').matches
                            ) {
                              setTheme('light');
                            }
                            setThemeOption(e.target.innerText);
                          }}
                        >
                          <i className="fa-solid fa-gear"></i>
                          System Preference
                        </DropdownButton>
                      </div>
                    </DropdownContent>
                  </Dropdown>
                </div>
              </div>
              {/* Account Visibility */}
              <div className="settings-column">
                {/* <h2 className="settings-header">Account Visibility</h2>
                <div className="subsection">
                  <label htmlFor="option-theme">Who can view you</label>
                  <Dropdown>
                    <DropdownButton buttonId="options-visibility-btn">
                      <div className="input-container">
                        <input
                          id="option-theme"
                          placeholder={
                            userInfo.visibility === 1 ? 'Public Account' : 'Private Account'
                          }
                          type="text"
                          disabled
                        />
                        <ThemeIcon
                          src={'assets/dropdown_light.svg'}
                          darkSrc={'assets/dropdown_dark.svg'}
                          alt={'Visibility'}
                          addClass={'options-dropdown-parent-btn'}
                        />
                      </div>
                    </DropdownButton>
                    <DropdownContent>
                      <div id="options-visibility-dropdown">
                        <DropdownButton
                          className="options-dropdown-button start"
                          callback={(e) => {
                            updateVisibility(1);
                          }}
                        >
                          <i className="fa-solid fa-eye"></i>
                          Public Account
                        </DropdownButton>
                        <DropdownButton
                          className="options-dropdown-button end"
                          callback={(e) => {
                            updateVisibility(0);
                          }}
                        >
                          <i className="fa-solid fa-user"></i>
                          Private Account
                        </DropdownButton>
                      </div>
                    </DropdownContent>
                  </Dropdown>
                </div> */}
              </div>
            </div>
              <div className="settings-row">
                {/* Account Deletion */}
                <div className="subsection">
                  <Popup>
                    <PopupButton className="delete-button">Delete Account</PopupButton>
                    <PopupContent>
                      <div className="delete-user-title">Delete Account</div>
                      <div className="delete-user-extra-info">
                        Are you sure you want to delete your account? This action cannot be undone.
                      </div>
                      <div className="delete-user-button-pair">
                        <button className="delete-button" onClick={deleteAccountPressed}>
                          Delete
                        </button>
                        <PopupButton buttonId="cancel-button" className="button-reset">
                          Cancel
                        </PopupButton>
                      </div>
                    </PopupContent>
                  </Popup>
                </div>
              </div>
          </div>
        )}
      </div>
      <CreditsFooter />
      <ToTopButton />
    </div>
  );
};

export default Settings;