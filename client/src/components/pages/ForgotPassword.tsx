import '../Styles/pages.css';
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as paths from '../../constants/routes';
import { ThemeIcon } from '../ThemeIcon';
import { sendPost } from '../../functions/fetch.js';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate(); // Hook for navigation
  const location = useLocation();
  const from = location.state?.from;

  // State variables
  const [emailInput, setEmailInput] = useState('');
  const [error, setError] = useState(''); // Error message for missing or incorrect information

  // Function to handle the send button click
  const handleSend = async () => {
    // Check if the emailInput and password are not empty
    if (emailInput === '') {
      setError('Please fill in all information');
      return;
    }
    // if the email is not a valid email
    else if (!emailInput.includes('@')) {
      setError('Invalid email');
      return;
    }

    try {
      // if the email is not associated with an account
      const response = await fetch(`/api/users/search-email/${emailInput}`);
      const data = await response.json();

      if (!data) {
        setError('If that account exists, an email has been sent.');
        return;
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

  // Function to handle the forgot pass button click
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
          <ThemeIcon
            light={'assets/bannerImages/login_light.png'}
            dark={'assets/bannerImages/login_dark.png'}
          />
          <button onClick={() => navigate(paths.routes.SIGNUP)}>Sign Up</button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
