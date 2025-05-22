//Styles
import '../Styles/credits.css';
import '../Styles/discoverMeet.css';
import '../Styles/emailConfirmation.css';
import '../Styles/general.css';
import '../Styles/loginSignup.css';
import '../Styles/messages.css';
import '../Styles/notification.css';
import '../Styles/profile.css';
import '../Styles/projects.css';
import '../Styles/settings.css';
import '../Styles/pages.css';

import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as paths from '../../constants/routes';
//import * as fetch from "../../functions/fetch";

interface ResponseData {
  status?: number;
  error?: string;
}

interface EmailConfirmationProps {
  responseData?: ResponseData;
  reloadResponseData?: number | string | boolean;
}

const EmailConfirmation = (props: EmailConfirmationProps) => {
  // THINGS TO DO:
  // Add Page Components (info box stating email is confirmed) x
  // Style page to match Figma (both light and dark modes)
  // Auto redirect to discover page (as well as link to discover page if redirect doesn't work) x
  // Include token in link as (react search parameter or query parameter) and work with database to verify users email (grab token and fetch to /api/signup/[insert token here]) x
  const [responseData, setResponseData] = useState<ResponseData | undefined>(props.responseData);
  const [counter, setCounter] = useState(5);

  //Gets current location
  const location = useLocation();
  //Gets pathname from current location
  const path = location.pathname;

  // Function that fetches to the server so it can check if the authorization token is correct
  /*const getUserCreationStatusCode = async () => {
        const url = `/api/signup/${path.substring(path.lastIndexOf("/")+1, path.length)}`;

        try {
            let response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const responseJSON = await response.json();

            setResponseData(responseJSON);
            return;
        } catch (err) {
            console.error(err);
            setResponseData(undefined);
        }
    }*/

  useEffect(() => {
    const getUserCreationStatus = async () => {
      const url = `/api/signup/${path.substring(path.lastIndexOf('/') + 1, path.length)}`;
      try {
        const response = await fetch(url);
        const data: ResponseData = await response.json();
        console.log(`Status: ${data.status}`);
        if (data.error) {
          console.log(`Error: ${data.error}`);
        }
        setResponseData(data);
      } catch (err) {
        console.error(err);
      }
    };
    getUserCreationStatus();
  }, [props.reloadResponseData]);

  // Hook for navigation
  const navigate = useNavigate();

  //getUserCreationStatusCode();

  // Sets default h1Text and redirect destination
  let h1Text = 'Error Fetching';

  if (responseData != undefined) {
    // Changes h1Text and redirect destination dependent on the status code returned by server
    switch (responseData.status) {
      case 200:
        h1Text = 'Your LFG account is now activated!';
        break;
      case 400:
        h1Text = responseData.error || 'Bad Request';
        break;
    }
  }

  // Function to handle redirecting from the current page
  const redirect = () => {
    navigate(paths.routes.HOME); // Navigate to the home page
  };

  // Function that calls redirect after 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((prevCounter) => (prevCounter > 0 ? prevCounter - 1 : 0));
    }, 1000);

    const timeout = setTimeout(() => {
      redirect();
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div id="email-confirmation-page" className="background-cover">
      <div className="confirmation-container">
        <h1 id="confirmation-text">{h1Text}</h1>
        <br></br>
        <h2 id="auto-redirect-text">Redirecting to login in {counter}s</h2>
        <br></br>
        <h3 id="manual-redirect-text">
          If the page does not automatically redirect, click{' '}
          <span id="manual-redirect-link" onClick={() => redirect()}>
            here
          </span>
        </h3>
      </div>
    </div>
  );
};

export default EmailConfirmation;
