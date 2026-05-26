import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as paths from '../../constants/routes';
import { sendPost } from '../../functions/fetch.js';
import { ThemeIcon, ThemeImage } from '../ThemeIcon';
import { getUserByEmail, getUserByUsername } from '../../api/users.js';

type LoginResponse = {
  error?: string;
  message?: string;
};

/**
 * Login page to enter credentials and authenticate. Contains input for username,
 * email, and password and buttons for login and forgot password.
 * @returns JSX Element
 */
const Login: React.FC = () => {
  const navigate = useNavigate(); // Hook for navigation
  const location = useLocation(); // Hook to access the current location
  const from = location.state?.from; // Get the previous page from the location state, if available

  // State variables
  const [loginInput, setLoginInput] = useState<string>('');
  const [error, setError] = useState<string>(''); // Error message for missing or incorrect information

  //google things
  useEffect(() => {
    // @ts-expect-error google
    google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      callback: handleGoogle
    });

    // @ts-expect-error google
    google.accounts.id.renderButton(
      document.getElementById("googleBtn"),
      { theme: "filled_black", size: "large" , shape: 'pill'}
    );

  }, [])

  function handleGoogle(response: any){
    console.log("just seeing if this'll go through") //OH MY GOD IT JUST WORKS?
  }
  /**
   * Validates user inputs, sends login requests to the server API, and handles authentication
   * responses. Displays error messages for invalid inputs or failed authentication attempts.
   * @returns false if an error occurred.
   */
  const handleLogin = async () => {
    // Check if the loginInput and password are not empty
    if (loginInput === '') {
      setError('Please fill in your username or email');
      return false;
    }

    // Check if the login credentials are associated with an account
    let data;
    if (loginInput.includes('@') && loginInput.includes('.')) {
    // search input as email
        const resp = await getUserByEmail(loginInput);
        data = resp.data;
    } 
    else {
    // search input as username
      const resp = await getUserByUsername(loginInput);
      data = resp.data;
    }
      try {
        if (data) {
          // try login 
          try {
            //SEND THIS THROUGH TO AUTHENTICATE ROUTE (OR MAKE A /LOGIN THAT TAKES THIS)
            //the reason this doesn't work is it doesn't go anywhere
            sendPost('/api/login', { loginInput }, (response: LoginResponse) => {
              if (response.error) {
                setError(response.error);
                return false;
              }
              // Success message
              setError('Logging in');
            });
            return true; // Prevent executing additional code after login attempt
          } catch (err) {
            setError('An error occurred during login');
            console.log(err);
            return false;
          }
        }
      } catch (err) {
        setError('An error occurred during login');
        console.log(err);
        return false;
      }
    }
  

    // // Sends the user to the create project popup if they successfully logged in
    // if(error == 'Logging in')
    // {
    //   navigate(paths.routes.CREATEPROJECT);
    // }

  /**
   * Triggers the login function when the Enter key is pressed while focus is in the form.
   * @param e Event
   */
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
            id={'back'}
            width={70}
            height={25}
            className={'color-fill'}
            ariaLabel={'back'}
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
                navigate(paths.routes.HOME);
              }
            }}
          />
          <h2>Log In</h2>
          <div className="error">{error}</div>
          <div className="login-form-inputs">
            <input
              id='main'
              className="login-input"
              type="text"
              placeholder="Username or email"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
            />
            <div id="googleBtn"></div>
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
          <ThemeImage
            lightSrc={'/assets/bannerImages/login_light.png'}
            darkSrc={'/assets/bannerImages/login_dark.png'}
          />
          <button onClick={() => navigate(paths.routes.SIGNUP)}>Sign Up</button>
        </div>
      </div>
    </div>
  );
};

export default Login;