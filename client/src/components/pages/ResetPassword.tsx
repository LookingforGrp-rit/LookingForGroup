import '../Styles/pages.css';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as paths from '../../constants/routes';
import { handleError, sendPost, sendGet, hideError } from '../../functions/fetch';
import passwordValidator from 'password-validator';

const ResetPassword = ({}) => {
  const navigate = useNavigate(); // Hook for navigation
  const location = useLocation();

  // State variables
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmInput, setConfirmInput] = useState('');
  const [error, setError] = useState(''); // Error message for missing or incorrect information
  const [passwordMsg, setPasswordMsg] = useState('');

  // Function to handle the Set button click
  const handleResetPassword = async () => {
    // Check if the loginInput and password are not empty
    if (passwordInput === '' || confirmInput === '') {
      setError('Please fill in all information');
      return;
    }

    // Check if the password meets all requirements
    else if (passwordMsg !== '') {
      setError('Password must meet all requirements');
    }

    // Check if the passwords match
    else if (passwordInput !== confirmInput) {
      setError('The passwords do not match');
      return;
    } else {
      // Success message
      setError('Updating password...');
      // Login for the user
      const path = location.pathname;
      const token = path.substring(path.lastIndexOf('/') + 1, path.length);
      const data = { password: passwordInput, confirm: confirmInput };
      console.log(data);
      const response = await sendPost(`/api/resets/password/${token}`, data);
      if (response.error) {
        setError(response.error);
      } else {
        // Success message
        setError('Logging in');
      }

      // Navigate to the home page
      // navigate(paths.routes.HOME);
    }
  };

    // Don't check password if there's nothing there
  const validatePassword = (pass) => {
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

  // Function to handle the forgot pass button click
  /*const handleBackToLogin = () => {
    // Navigate to the Forgot Password Page
    navigate(-1);
  };*/

  // render the login page
  return (
    <div className="background-cover">
      <div className="login-form column">
        <h2>Set new password</h2>
        <div className="login-form-inputs">
          <div className="error">{error}</div>
          <span id="errorMessage"></span>
          <input
            className="login-input"
            type="password"
            placeholder="New password"
            value={passwordInput}
            onChange={(e) => {
              setPasswordInput(e.target.value);
              const passMsg = validatePassword(e.target.value);
              setError(passMsg);
              setPasswordMsg(passMsg);
            }}
          />
          <input
            className="login-input"
            type="password"
            placeholder="Confirm password"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
          />
          <button id="forgot-password" onClick={() => navigate(-1)}>
            Back to Login
          </button>
        </div>
        <button id="main-loginsignup-btn" onClick={handleResetPassword}>
          Set
        </button>
      </div>
    </div>
  );
};

export default ResetPassword;
