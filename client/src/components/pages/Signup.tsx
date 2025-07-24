import '../Styles/pages.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as paths from '../../constants/routes';
import MakeAvatarModal from '../AvatarCreation/MakeAvatarModal';
import ChooseSkills from '../SignupProcess/ChooseSkills';
// import ChooseProficiencies from "../SignupProcess/ChooseProficiencies";
import ChooseInterests from '../SignupProcess/ChooseInterests';
import CompleteProfile from '../SignupProcess/CompleteProfile';
import GetStarted from '../SignupProcess/GetStarted';
import { sendPost } from '../../functions/fetch';
import { ThemeIcon } from '../ThemeIcon';
import passwordValidator from 'password-validator';

const SignUp = ({ setAvatarImage, avatarImage, profileImage, setProfileImage }) => {
  const navigate = useNavigate(); // Hook for navigation

  // State variables
  const [firstName, setFirstName] = useState(''); // State variable for the user's first name
  const [lastName, setLastName] = useState(''); // State variable for the user's last
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState(''); // second password input to check if they match
  const [message, setMessage] = useState(''); // State variable for messages
  const [passwordMessage, setPasswordMessage] = useState(''); // State variable for password requirements
  const [showPassword, setShowPassword] = useState(false);

  // State variables for modals
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  // const [showProficienciesModal, setShowProficienciesModal] = useState(false);
  const [showInterestsModal, setShowInterestsModal] = useState(false);
  const [showCompleteProfileModal, setShowCompleteProfileModal] = useState(false);
  const [showGetStartedModal, setShowGetStartedModal] = useState(false);

  // State variables for selected buttons
  // to remeber the user's choices when they go back and forth between modals
  // const [selectedProficiencies, setSelectedProficiencies] = useState<string[]>([]); // State variable for the selected proficiencies
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]); // State variable for the selected skills
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]); // State variable for the selected interests
  const [pronouns, setPronouns] = useState(''); // State variable for the user's pronouns
  const [bio, setBio] = useState(''); // State variable for the user's bio

  // user info to be sent to the backend
  const userInfo = {
    firstName: firstName,
    lastName: lastName,
    email: email,
    username: username,
    password: password,
    // proficiencies: selectedProficiencies,
    skills: selectedSkills,
    interests: selectedInterests,
    pronouns: pronouns,
    bio: bio,
    avatarImage: avatarImage,
    profileImage: profileImage, // if they upload their own image
  };

  // Function to handle the login button click
  const handleSignup = async () => {
    // Check if any of the fields are empty
    if (
      email === '' ||
      password === '' ||
      confirm === '' ||
      firstName === '' ||
      lastName === '' ||
      username === ''
    ) {
      setMessage('Please fill in all information');
      return false;
    }

    // check if username in use
    try {
      const response = await fetch(`/api/users/search-username/${username}`);
      const data = await response.json();
      // if there is a result, a match is found
      if (data.data.length > 0) {
        setMessage('Username already in use');
        return false;
      }
    } catch (err) {
      console.log(err);
      return false;
    }

    // check if username is valid
    if (!(username.match(/^[a-zA-Z0-9_]+$/) != null)) {
      setMessage('Username can not include white space or special characters!');
      return false;
    }

    if (!email.includes('rit.edu')) {
      // check if email is valid
      setMessage('Not an RIT email');
      return false;
    }

    // check if the email is in use
    try {
      const response = await fetch(`/api/users/search-email/${email}`);
      const data = await response.json();
      // if there is a result, a match is found
      if (data.data.length > 0) {
        setMessage('Email already in use');
        return false;
      }
    } catch (err) {
      console.log(err);
      return false;
    }

    // Check if password meets the requirements
    if (passwordMessage !== '') {
      setMessage('Password does not meet requirements');
      return false;
    }

    // check if the passwords match
    if (password !== confirm) {
      setMessage('Passwords do not match');
      return false;
    }

    // no errors, send email
    else {
      setMessage('Please wait...');
      // Send info to begin account activation
      await fetch('/api/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          confirm: confirm,
          firstName: firstName,
          lastName: lastName,
          username: username,
        }),
      });
      setMessage('An account activation email has been sent');
    }
  };

  // Function to handle password validation
  const validatePassword = (pass) => {
    // Don't check password if there's nothing there
    if (pass === '') {
      return '';
    }

    const schema = new passwordValidator();
    schema
      .is()
      .min(8, 'be 8 or more characters')
      .is()
      .max(20, 'be 20 or less characters')
      .has()
      .uppercase(1, 'have an uppercase letter')
      .has()
      .lowercase(1, 'have a lowercase letter')
      .has()
      .digits(1, 'have a number')
      .has()
      .symbols(1, 'have a symbol')
      .has()
      .not()
      .spaces(1, 'have no spaces')
      .has()
      .not('[^\x00-\x7F]+', 'have no non-ASCII characters');

    const output = schema.validate(pass, { details: true });
    let passMsg = '';

    if (output.length > 0) {
      passMsg += `Password must `;

      for (let i = 0; i < output.length - 1; i++) {
        passMsg += `${output[i].message}, `;
      }
      passMsg += `${output.length > 1 ? 'and ' : ''}${output[output.length - 1].message}.`;
    }

    console.log(passMsg);
    return passMsg;
  };

  // Function to handle Enter key press
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
          light={'/assets/back_light.png'}
          dark={'/assets/back_dark.png'}
          alt="Back Button"
          id="backPage-arrow"
          onClick={() => navigate(-1)}
        />
        {/*************************************************************

                    Signup Form inputs

                *************************************************************/}
        <div className="signup-form column">

          <h2>Sign Up</h2>

          <div className="error">{message}</div>
          <div className="signup-form-inputs">
            <div className="row">
              <input
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
            />

            <span className="spacer"> </span>

            <input
              className="signup-input"
              autoComplete="off"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <div id='password-wrapper'>
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
                  <ThemeIcon
                    id='eye-icon'
                    light={'/assets/black/password_shown.png'}
                    dark={'/assets/white/password_shown.png'}
                  />) :
                  (
                    <ThemeIcon
                      id='eye-icon'
                      light={'/assets/black/password_hidden.png'}
                      dark={'/assets/white/password_hidden.png'}
                    />
                  )}
              </button>
            </div>
            {/* {(passwordMessage !== '') ? (
                            <div className="error">{passwordMessage}</div>
                        ) : (
                            <></>
                        )} */}
            <input
              className="signup-input"
              autoComplete="off"
              type="password"
              placeholder="Re-enter password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <div className="mobile-login">
              <p>Already have an account? </p>
              <p id="login-btn-mobile" onClick={() => navigate(paths.routes.LOGIN)}>
                Log In
              </p>
            </div>
          </div>

          <button id="main-loginsignup-btn" onClick={handleSignup}>
            Sign Up
          </button>

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

          <ChooseSkills
            onNext={() => {
              setShowSkillsModal(false);
              setShowInterestsModal(true);
            }}
            onBack={() => {
              setShowSkillsModal(false);
            }} // if we are using the proficiencies modal, add setShowProficienciesModal(true); to the end
            show={showSkillsModal}
            selectedSkills={selectedSkills}
            setSelectedSkills={setSelectedSkills}
            mode="signup"
            onClose={() => {
              setShowSkillsModal(false);
            }}
          />

          <ChooseInterests
            onNext={() => {
              setShowInterestsModal(false);
              setShowAvatarModal(true);
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
          />

          <MakeAvatarModal
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
          />

          <CompleteProfile
            onNext={() => {
              setShowCompleteProfileModal(false);
              setShowGetStartedModal(true);
            }}
            onBack={() => {
              setShowCompleteProfileModal(false);
              setShowAvatarModal(true);
            }}
            show={showCompleteProfileModal}
            avatarImage={avatarImage}
            userInfo={userInfo}
            bio={bio}
            pronouns={pronouns}
            setBio={setBio}
            setPronouns={setPronouns}
            profileImage={profileImage}
            setProfileImage={setProfileImage}
          />

          <GetStarted
            show={showGetStartedModal}
            onBack={() => {
              setShowGetStartedModal(false);
              setShowCompleteProfileModal(true);
            }}
            onCreateProject={() => {
              setShowGetStartedModal(false);
              navigate(paths.routes.MYPROJECTS);
            }}
            onJoinProject={() => {
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
          <ThemeIcon
            light={'/assets/bannerImages/signup_light.png'}
            dark={'/assets/bannerImages/signup_dark.png'}
          />
          <button onClick={() => navigate(paths.routes.LOGIN)}>Log In</button>
        </div>
      </div>
    </div>
  );
};

// helper function to check for existing username

export default SignUp;
