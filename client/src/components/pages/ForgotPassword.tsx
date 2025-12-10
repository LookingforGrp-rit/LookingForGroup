import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as paths from '../../constants/routes';
import { ThemeImage } from '../ThemeIcon';
import { sendPost } from '../../functions/fetch.js';
import { getUserByEmail } from '../../api/users.js';

/**
 * Forgot Password page. Creates a page that the user can go to when they have forgotten their password for their account
 * @returns JSX Element
 */
const ForgotPassword: React.FC = () => {
  // Hooks for navigation
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  // State variables
  const [emailInput, setEmailInput] = useState('');

  // Error message for missing or incorrect information
  const [error, setError] = useState('');

  /**
   * Handles sending to and verifying emails with the server
   * @returns false if unsuccessful, otherwise redirects to login page
   */
  const handleSend = async () => {
    // Check if the emailInput and password are not empty
    if (emailInput === '') {
      setError('Please fill in all information');
      return false;
    }
    // if the email is not a valid email
    else if (!emailInput.includes('@')) {
      setError('Invalid email');
      return false;
    }

    try {
      // if the email is not associated with an account
      const data = await getUserByEmail(emailInput);

      if (!data) {
        setError('If that account exists, an email has been sent.');
        return false;
      } else {
        // Success message
        setError('Sending email...');

        // All checks passed, issue a password change request
        const response = await sendPost('/api/resets/password', { email: emailInput }) as unknown as { error?: string; message?: string };
        if (response && response.error) {
          setError(response.error);
        } else {
          setError('Email sent');
        }

        // Navigate back to LOGIN
        navigate(paths.routes.LOGIN);
      }
    } catch (err) {
      console.log('Something went wrong....');
      console.log(err);
      return false;
    }
  };

  /**
   * Navigates page to login
   */
  const handleBackToLogin = () => {
    // Navigate to the Forgot Password Page
    navigate(paths.routes.LOGIN, { state: { from } });
  };

  // render the login page
  return (
    <div className="background-cover">
      <div className="login-signup-container">
        {/*************************************************************

                    Forgot Password Form inputs

                *************************************************************/}
        <div className="login-form column">
          <h2>Forgot password?</h2>
          <p>No worries! We'll send you reset instructions.</p>
          <div className="login-form-inputs">
            <div className="error">{error}</div>
            <span id="errorMessage"></span>
            <input
              className="login-input"
              type="text"
              placeholder="Enter your email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
            />

            <button id="forgot-password" onClick={handleBackToLogin}>
              Back to Login
            </button>
          </div>
          <button id="main-loginsignup-btn" onClick={handleSend}>
            Send
          </button>
        </div>
        {/*************************************************************

                    Welcome Directory

                *************************************************************/}
        <div className="directory column">
          {/* <h1>Welcome!</h1>
                    <p>Don't have an account?</p> */}
          <ThemeImage
            lightSrc={'assets/bannerImages/login_light.png'}
            darkSrc={'assets/bannerImages/login_dark.png'}
          />
          <button onClick={() => navigate(paths.routes.SIGNUP)}>Sign Up</button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
