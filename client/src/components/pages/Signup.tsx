import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as paths from '../../constants/routes';
import CreateProfileRedirect from '../SignupProcess/CreateProfileRedirect';
// import MakeAvatarModal from '../AvatarCreation/MakeAvatarModal';
import ChooseSkills from '../SignupProcess/ChooseSkills';
// import ChooseProficiencies from "../SignupProcess/ChooseProficiencies";
// import ChooseInterests from '../SignupProcess/ChooseInterests';
import CompleteProfile from '../SignupProcess/CompleteProfile';
import TermsOfService from '../SignupProcess/TermsOfService';
import GetStarted from '../SignupProcess/GetStarted';
import { ThemeIcon, ThemeImage } from '../ThemeIcon';
//import passwordValidator from 'password-validator';
import { addUserSkill, createNewUser, getCurrentUsername, googleLogin, editUser, addUserMajor } from '../../api/users';
import { RITStatus, CreateUserInput, Major, SessionUserData, Skill } from '@looking-for-group/shared';
import { ThemeContext } from '../../contexts/ThemeContext';

interface SignUpProps {
  profileImage: File;
  setProfileImage: React.Dispatch<React.SetStateAction<File>>;
}
/**
 * Sign up page. Records user input, validates user-given information with server data, and records it to server if valid.
 * @param profileImage Uploaded profile image to use for user creation.
 * @param setProfileImage Sets the profile image variable
 * @returns JSX Element
 */
const SignUp: React.FC<SignUpProps> = ({ /*setAvatarImage, avatarImage,*/ profileImage, setProfileImage }) => {
  const navigate = useNavigate(); // Hook for navigation

  // State variables
  const [firstName, setFirstName] = useState(''); // User's first name
  const [lastName, setLastName] = useState(''); // User's last name
  const [preferredName, setPreferredName] = useState(''); // User's preferred name
  const [email, setEmail] = useState('');
  const [sessionData, setSessionData] = useState<SessionUserData>();
  // const [username, setUsername] = useState('');
  // const [password, setPassword] = useState('');
  // const [confirm, setConfirm] = useState(''); // Second password input to check if they match
  const [message, setMessage] = useState('');
  // const [passwordMessage, setPasswordMessage] = useState(''); // Password requirements
  // const [showPassword, setShowPassword] = useState(false);

  // State variables for modals
  // const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showCreateProfileRedirectModal, setShowCreateProfileRedirectModal] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  // const [showProficienciesModal, setShowProficienciesModal] = useState(false);
  // const [showInterestsModal, setShowInterestsModal] = useState(false);
  const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);
  const [showGetStartedModal, setShowGetStartedModal] = useState(false);
  const [showTOSModal, setShowTOSModal] = useState(false);

  // State variables for selected buttons
  // to remeber the user's choices when they go back and forth between modals
  // const [selectedProficiencies, setSelectedProficiencies] = useState<string[]>([]); // State variable for the selected proficiencies
  const [selectedSkills, setSelectedSkills] = useState<Skill[]>([]); // State variable for the selected skills
  const [selectedSkillIds, setSelectedSkillIds] = useState<number[]>([]); // State variable for the ids of the selected skills
  // const [selectedInterests, setSelectedInterests] = useState<string[]>([]); // State variable for the selected interests
  const [pronouns, setPronouns] = useState(''); // State variable for the user's pronouns
  const [bio, setBio] = useState(''); // State variable for the user's bio
  const [headline, setHeadline] = useState(''); // State variable for the user's headline
  const [phoneNumber, setPhoneNumber] = useState(''); // State variable for the user's Phone Number
  const [title, setTitle] = useState(''); // State variable for the user's current Job Title
  const [location, setLocation] = useState(''); // State variable for the user's Location
  const [funFact, setFunFact] = useState(''); // State variable for the user's bio
  const [majors, setMajors] = useState<Major[]>([]); // State variable for user's major //it's an array because it's stored as an array on the backend, to allow for multiple
  const [ritStatus, setRITStatus] = useState<RITStatus>()
  const { theme } = useContext(ThemeContext); //The theme value from ThemeContext.

  const [error, setError] = useState<string>(''); // Error message for missing or incorrect information

  // user info to be sent to the backend
  //we will add more to this once the frontend components can handle them
  const userInfo = {
    firstName: firstName,
    lastName: lastName,
    preferredName: preferredName, // default to first name for now
    ritEmail: email,
    googleId: sessionData?.googleId,
    username: '',
    pronouns: pronouns,
    ritStatus: ritStatus as RITStatus,
    bio: bio,
    headline: headline,
    phoneNumber: phoneNumber,
    title: title,
    location: location,
    funFact: funFact,
    mentor: false,
  } as CreateUserInput;

  // Redirect the user to the homepage if they are currently logged in
  useEffect(() => {
    const checkSessionAndRedirect = async () => {
      try {
        const res = await getCurrentUsername();
        if (res.data)
          navigate(paths.routes.HOME);
      } catch (err) {
        console.error("Session check failed:", err);
      }
    };

    checkSessionAndRedirect();

    const initialize = async () => {
      //Sets the string for the Google Sign Up button.
      let googleBtnTheme = new String("");

      //If we're in dark mode, we use filled_black.
      if (theme == 'dark') {
        googleBtnTheme = "filled_black";
      }
      //Light mode uses outline.
      else if (theme == 'light') {
        googleBtnTheme = "outline";
      }
      //The filled_blue option shows up in case something goes wrong.
      else {
        googleBtnTheme = "filled_blue";
      }

      //google things
      // @ts-expect-error google
      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogle,
      });

      // @ts-expect-error google
      google.accounts.id.renderButton(
        document.getElementById("googleBtn"),
        { theme: googleBtnTheme, size: "large", shape: 'pill', text: "signup_with" }
      );
    }
    async function handleGoogle(response: any) {
      const sessionData = await googleLogin({ credential: response.credential })
      if (sessionData.error) {
        setError(sessionData.error)
        return;
      }
      setError('');
      console.log(sessionData);
      setSessionData(sessionData.data);
      //now we display the message that corresponds to whatever happened
      //not even gonna bother reading the react one because react variables update whenever they feel like it and not right when you tell them to
      if (!sessionData.data.userExists) {
        setFirstName(sessionData.data.firstName);
        setLastName(sessionData.data.lastName);
        setPreferredName(sessionData.data.firstName);  // default preferred name to first name
        setEmail(sessionData.data.email);
        //setShowSkillsModal(true);
        setShowCreateProfileRedirectModal(true);
      }
      else {
        navigate(paths.routes.HOME);
      }
    }
    //for some browsers this works
    window.onload = initialize;
    try {
      //for other browsers telling the window to just shut up and do it works
      initialize();
    }
    catch {}
  }, [navigate]);


  /**
   * Goes through the various fields, verifies whether user input is valid, and sends it to the server.
   * @returns False if invalid
   */
  //we don't need any of this do we since literally all of it is gonna be through google...
  const handleSignup = async () => {
    if (!sessionData) {
      setMessage('No email entered')
    }
    else {
      setShowSkillsModal(true);
    }
    // Check if any of the fields are empty
    // if (
    //   email === '' ||
    //   firstName === '' ||
    //   lastName === ''
    // ) {
    //   setMessage('Please fill in all information');
    //   return false;
    // }

    //usernames are automatically set with your entered email, so checks are not needed
    // // check if username in use
    // const usernameCheck = await getUserByUsername(username);
    // // if there is a result, a match is found
    // if (usernameCheck) {
    //   setMessage('Username already in use');
    //   return false;
    // }

    // // check if username is valid
    // if (!(username.match(/^[a-zA-Z0-9_]+$/) != null)) {
    //   setMessage('Username can not include white space or special characters!');
    //   return false;
    // }

    //not needed! we already have this on the backend
    //you could replace this with something that checks for an error from the createUser thing
    // if (!email.includes('rit.edu')) {
    //   // check if email is valid
    //   setMessage('Not an RIT email');
    //   return false;
    // }

    // check if the email is in use
    //also not needed google handles this
    // const emailCheck = await getUserByEmail(email);
    // // if there is a result, a match is found
    // if (emailCheck.status === 200) {
    //   setMessage('Email already in use');
    //   return false;
    // }

    //no password self-storage so none of this is needed
    // Check if password meets the requirements
    // if (passwordMessage !== '') {
    //   setMessage('Password does not meet requirements');
    //   return false;
    // }

    // // check if the passwords match
    // if (password !== confirm) {
    //   setMessage('Passwords do not match');
    //   return false;
    // }

    //here we would call a POST to /users with all of our info in the body
    //and thus signups should work!
    // else {
    //   setMessage('Please wait...');
    //   // Send info to begin account activation
    //   /*
    //obsolete
    //   await signUp({
    //     email: email,
    //     password: password,
    //     confirm: confirm,
    //     firstName: firstName,
    //     lastName: lastName,
    //     username: username,
    //   });
    //   */
    //   await createNewUser({googleCredentials});
    //   //then redirect to... the home page? no we want to redirect to the login page but the login page is probably broken because it still wants a password
    //   //or we just SIGN THEM IN (NOT WORKING...) redirect to the home page after we've signed up to skip the step of logging in yet again
    //   //or we should redirect them to the other pieces of this signup page that allows them to make their stuff
    // }
  };

  /**
   * Checks password validity
   * @param pass Password
   * @returns String message of remaining requirements to be met
   */

  //oauth will handle this since we're logging in with rit emails
  //if google has all of our account auth info and we aren't storing our own
  //we don't need to store passwords ourselves at all, google will completely handle that right
  //i guess for the login page we can simply have a google oauth button there
  //or dress up google's oauth form in our lfg colors or smth... is that possible? no idea

  // const validatePassword = (pass : string) => {
  //   // Don't check password if there's nothing there
  //   if (pass === '') {
  //     return '';
  //   }

  //   const schema = new passwordValidator();
  //   schema
  //     .is()
  //     .min(8, 'be 8 or more characters')
  //     .is()
  //     .max(20, 'be 20 or less characters')
  //     .has()
  //     .uppercase(1, 'have an uppercase letter')
  //     .has()
  //     .lowercase(1, 'have a lowercase letter')
  //     .has()
  //     .digits(1, 'have a number')
  //     .has()
  //     .symbols(1, 'have a symbol')
  //     .has()
  //     .not()
  //     .spaces(1, 'have no spaces')
  //     .has()
  //     .not('[^\x00-\x7F]+', 'have no non-ASCII characters');

  //   const output : boolean | any[] = schema.validate(pass, { details: true });
  //   let passMsg = '';

  //   if (output == false) {
  //     return '';
  //   }

  //   const result : any[] = output as any[];

  //   if (result.length > 0) {
  //     passMsg += `Password must `;

  //     for (let i = 0; i < result.length - 1; i++) {
  //       passMsg += `${result[i].message}, `;
  //     }
  //     passMsg += `${result.length > 1 ? 'and ' : ''}${result[result.length - 1].message}.`;
  //   }

  //   console.log(passMsg);
  //   return passMsg;
  // };

  /**
   * Handles Enter key presses
   * @param e Keyboard Event
   */
  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      handleSignup();
    }
  };

  // Render the sign up page
  return (
    <div className="background-cover">
      <div className="login-signup-container" onKeyDown={handleKeyPress}>
        <ThemeIcon //Back button to return to the previous page
          id={'back'}
          width={70}
          height={25}
          className={'color-fill'}
          ariaLabel={'back'}
          onClick={() => navigate(-1)}
        />
        {/*************************************************************

          Signup Form inputs

        *************************************************************/}
        <div className="signup-form column">

          <h2>Sign Up</h2>
          <p>Sign up using your RIT email.</p>
          <div className="error" aria-live="assertive" role="alert">{error}</div>
          <div className="signup-form-inputs">
            {/* we wouldn't need any of the other fields either would we?? */}
            {/* <div className="row">
              <input
                id='main'
                className="signup-name-input"
                autoComplete="off"
                type="text"
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
              <input
                className="signup-name-input"
                autoComplete="off"
                type="text"
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <input
              className="signup-input"
              autoComplete="off"
              type="text"
              placeholder="School email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            /> */}

            <div id="googleBtn"></div>

            <span className="spacer"> </span>

            {/* <input
              className="signup-input"
              autoComplete="off"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            /> */}
            {/* <div id='password-wrapper'>
              <input
                className="signup-input"
                autoComplete="off"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  const passMsg = validatePassword(e.target.value);
                  setMessage(passMsg);
                  setPasswordMessage(passMsg);
                }}
              // onBlur={(e) => setPasswordMessage(validatePassword(e.target.value))}
              />
              <button id="show-password" onClick={() => setShowPassword((prevState) =>
                !prevState)}>
                {showPassword ? (
                  <ThemeIcon id={'eye-line'} width={18} height={13} className={'mono-fill'} ariaLabel={'Show password'}/>
                ) : (
                  <ThemeIcon id={'eye'} width={18} height={13} className={'mono-fill'} ariaLabel={'Hide password'}/>
                )}
              </button>
            </div> */}
            {/* {(passwordMessage !== '') ? (
                            <div className="error">{passwordMessage}</div>
                        ) : (
                            <></>
                        )} */}
            {/* <input
              className="signup-input"
              autoComplete="off"
              type="password"
              placeholder="Re-enter password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            /> */}
            <div className="mobile-login">
              <p>Already have an account? </p>
              <p id="login-btn-mobile" onClick={() => navigate(paths.routes.LOGIN)}>
                Log In
              </p>
            </div>
          </div>

          {/*************************************************************

            Modals for the sign up process

          *************************************************************/}

          {/* <ChooseProficiencies
            onNext={() => { setShowProficienciesModal(false); setShowSkillsModal(true); }}
            onBack={() => { setShowProficienciesModal(false); }}
            show={showProficienciesModal}
            selectedProficiencies={selectedProficiencies}
            setSelectedProficiencies={setSelectedProficiencies}
          /> */}
          <CreateProfileRedirect show={showCreateProfileRedirectModal}
            onNext={() => {
              setShowCreateProfileRedirectModal(false);
              setShowSkillsModal(true);
            }}
            onBack={() => {
              setShowCreateProfileRedirectModal(false);
            }} />
          <ChooseSkills
            onNext={() => {
              setShowSkillsModal(false);
              setShowCompleteProfileModal(true);
            }}
            onBack={() => {
              setShowSkillsModal(false);
              setShowCreateProfileRedirectModal(true);

            }} // if we are using the proficiencies modal, add setShowProficienciesModal(true); to the end
            show={showSkillsModal}
            selectedSkills={selectedSkills}
            setSelectedSkills={setSelectedSkills}
            selectedSkillIds={selectedSkillIds}
            setSelectedSkillIds={setSelectedSkillIds}
            mode="signup"
          />

          {/* <ChooseInterests
            onNext={() => {
              setShowInterestsModal(false);
              // setShowAvatarModal(true);
            }}
            onBack={() => {
              setShowInterestsModal(false);
              setShowSkillsModal(true);
            }}
            show={showInterestsModal}
            selectedInterests={selectedInterests}
            setSelectedInterests={setSelectedInterests}
            mode="signup"
            onClose={() => {
              setShowInterestsModal(false);
            }}
          /> */}

          {/* <MakeAvatarModal
            mode="signup"
            onBack={() => {
              setShowAvatarModal(false);
              setShowInterestsModal(true);
            }}
            onNext={() => {
              setShowAvatarModal(false);
              setShowCompleteProfileModal(true);
            }}
            show={showAvatarModal}
            onClose={() => {
              setShowAvatarModal(false);
            }}
            setAvatarImage={setAvatarImage}
          /> */}

          <CompleteProfile
            onNext={() => {
              setShowCompleteProfileModal(false);
              setShowTOSModal(true);
            }}
            onBack={() => {
              setShowCompleteProfileModal(false);
              setShowSkillsModal(true);
              // setShowAvatarModal(true);
            }}
            show={showCompleteProfileModal}
            // avatarImage={avatarImage}
            userInfo={userInfo}
            selectedSkills={selectedSkills}
            bio={bio}
            pronouns={pronouns}
            headline={headline}
            phoneNumber={phoneNumber}
            title={title}
            major={majors}
            ritStatus={ritStatus}
            location={location}
            funFact={funFact}
            setBio={setBio}
            setPronouns={setPronouns}
            setHeadline={setHeadline}
            setPhoneNumber={setPhoneNumber}
            setTitle={setTitle}
            setLocation={setLocation}
            setFunFact={setFunFact}
            setMajor={setMajors}
            setRITStatus={setRITStatus}
            profileImage={profileImage}
            setProfileImage={setProfileImage}
          />

          <TermsOfService
          show={showTOSModal}
          onNext={() => {
            setShowGetStartedModal(true);
            setShowTOSModal(false);
          }}
          onBack={() => {
            setShowCompleteProfileModal(true);
            setShowTOSModal(false);
          }}

          ></TermsOfService>

          <GetStarted
            show={showGetStartedModal}
            onBack={() => {
              setShowTOSModal(true);
              setShowGetStartedModal(false);
            }}
            onCreateProject={async () => {

              await createNewUser(userInfo); //populating this with all of the things we selected
              majors.map(async (m) => await addUserMajor({majorId: m.majorId})); //major route. i feel silly
              for (const id of selectedSkillIds) {
                await addUserSkill({ skillId: id, position: selectedSkillIds.indexOf(id), proficiency: 'Novice' })
              }
              await editUser({ profileImage: profileImage });
              setShowGetStartedModal(false);
              navigate(paths.routes.MYPROJECTS);
            }}
            onJoinProject={async () => {
              await createNewUser(userInfo); //populating this with all of the things we selected
              majors.map(async (m) => await addUserMajor({majorId: m.majorId})); //major route that has literally existed the ENTIRE time
              for (const id of selectedSkillIds) {
                await addUserSkill({ skillId: id, position: selectedSkillIds.indexOf(id), proficiency: 'Novice' })
              }
              await editUser({ profileImage: profileImage });
              setShowGetStartedModal(false);
              navigate(paths.routes.HOME);
            }}
          />
        </div>
        {/*************************************************************

          Welcome Directory

        *************************************************************/}
        <div className="directory column">
          {/* <h1>Welcome!</h1>
                    <p>Already have an account?</p> */}
          <ThemeImage
            lightSrc={'/assets/bannerImages/signup_light.png'}
            darkSrc={'/assets/bannerImages/signup_dark.png'}
          />
          <button onClick={() => navigate(paths.routes.LOGIN, { replace: true })}>Log In</button>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
