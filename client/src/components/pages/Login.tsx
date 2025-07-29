import '../Styles/pages.css';
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as paths from '../../constants/routes';
import { sendPost } from '../../functions/fetch.js';
import { ThemeIcon } from '../ThemeIcon';
import { getUserByEmail } from '../../api/users.js';

type LoginResponse = {
  error?: string;
  message?: string;
};

const Login: React.FC = () => {
  const navigate = useNavigate(); // Hook for navigation
  const location = useLocation(); // Hook to access the current location
  const from = location.state?.from; // Get the previous page from the location state, if available

  // State variables
  const [loginInput, setLoginInput] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>(''); // Error message for missing or incorrect information

  // Function to handle the login button click
  const handleLogin = async () => {
    // Check if the loginInput and password are not empty
    if (loginInput === '' || password === '') {
      setError('Please fill in all information');
      return;
    }

    // Check if the login credentials are associated with an account
    // search input as email
    if (loginInput.includes('@') && loginInput.includes('.')) {
      try {
        const data = await getUserByEmail(loginInput);
        if (data) {
          // try login
          try {
            sendPost('/api/login', { loginInput, password }, (response: LoginResponse) => {
              if (response.error) {
                setError(response.error);
                return;
              }
              // Success message
              setError('Logging in');
            });
            return; // Prevent executing additional code after login attempt
          } catch (err) {
            setError('An error occurred during login');
            console.log(err);
            return;
          }
        }
      } catch (err) {
        setError('An error occurred during login');
        console.log(err);
        return false;
      }
    }
    // search input as username
    try {
      const response = await fetch(`/api/users/search-username/${loginInput}`);
      const data = await response.json();
      if (data) {
        // try login
        try {
          sendPost('/api/login', { loginInput, password }, (response: LoginResponse) => {
            if (response.error) {
              setError(response.error);
              return;
            }
            // Success message
            setError('Logging in');
          });
          return; // Prevent executing additional code after login attempt
        } catch (err) {
          setError('An error occurred during login');
          console.log(err);
          return;
        }
      }
    } catch (err) {
      setError('An error occurred during login');
      console.log(err);
      return false;
    }

    // no errors, send login request
    try {
      // Success message
      setError('Trying to log in');
      sendPost('/api/login', { loginInput, password }, (response: LoginResponse) => {
        if (response.error) {
          setError(response.error);
        } else {
          // Success message
          setError('Logging in');
        }
      });
    } catch (err) {
      setError('An error occurred during login');
      console.log(err);
      return false;
    }

    // // Sends the user to the create project popup if they successfully logged in
    // if(error == 'Logging in')
    // {
    //   navigate(paths.routes.CREATEPROJECT);
    // }
  };

  // Function to handle the forgot pass button click
  const handleForgotPass = () => {
    // remove error message
    setError('');
    // Navigate to the Forgot Password Page
    // Pass the 'from' state to remember where to return after going back to login
    // If 'from' is not defined, it will default to the home page 
    navigate(paths.routes.FORGOTPASSWORD, { state: { from } });
  };

  // Function to handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  // render the login page
  return (
    <div className="background-cover">
      <div className="login-signup-container" onKeyDown={handleKeyPress}>
        {/*************************************************************

                    Login Form inputs

                *************************************************************/}
        <div className="login-form column">
          <ThemeIcon //Back button to return to the previous page
            light={'/assets/back_light.png'}
            dark={'/assets/back_dark.png'}
            alt="Back Button"
            id="backPage-arrow"
            onClick={() => {
              console.log(from)
              // Return to previous page (unless it is the forgot password page, or the settings page)
              // Settings page is included for logged out users to be properly brought to the home page instead of stuck on the login page
              // (Settings redirects logged out users to login)
              if (from != paths.routes.FORGOTPASSWORD && from != paths.routes.RESETPASSWORD && from != paths.routes.SETTINGS) {
                console.log("window.history.back() called")
                window.history.back(); // This line is a temp implementation, because navigate(from) does not always work
                // navigate(from);
              } else { // Go to home (Discover) otherwise
                console.log("defaulting to home")
                navigate(paths.routes.HOME);
              }
            }}
          />
          <h2>Log In</h2>
          <div className="error">{error}</div>
          <div className="login-form-inputs">
            <input
              className="login-input"
              type="text"
              placeholder="Username or email"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
            />
            <div id='password-wrapper'>
              <input
                className="login-input"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button id="show-password" onClick={() => setShowPassword((prevState) =>
                !prevState)}>
                {showPassword ? (
                  <ThemeIcon
                    id='eye-icon'
                    light={'/assets/black/password_shown.png'}
                    dark={'/assets/open_dark.png'}
                  />) :
                  (
                    <ThemeIcon
                      id='eye-icon'
                      light={'/assets/black/password_hidden.png'}
                      dark={'/assets/hide_dark.png'}
                    />
                  )}
              </button>
            </div>
            <button id="forgot-password" onClick={handleForgotPass}>
              Forgot Password
            </button>

            <div className="mobile-signup">
              <p>No account? </p>
              <p id="signup-btn-mobile" onClick={() => navigate(paths.routes.SIGNUP)}>
                Sign Up
              </p>
            </div>
          </div>
          <button id="main-loginsignup-btn" onClick={handleLogin}>
            Log In
          </button>
        </div>
        {/*************************************************************

                    Welcome Directory

                *************************************************************/}
        <div className="directory column">
          {/* <h1>Welcome!</h1>
                    <p>Don't have an account?</p> */}
          <ThemeIcon
            light={'/assets/bannerImages/login_light.png'}
            dark={'/assets/bannerImages/login_dark.png'}
          />
          <button onClick={() => navigate(paths.routes.SIGNUP)}>Sign Up</button>
        </div>
      </div>
    </div>
  );
};

export default Login;