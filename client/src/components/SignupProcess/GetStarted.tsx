import { MouseEventHandler } from 'react';

interface GetStartedProps {
  show : boolean;
  onBack : MouseEventHandler<HTMLButtonElement>;
  onCreateProject : MouseEventHandler<HTMLButtonElement>;
  onJoinProject : MouseEventHandler<HTMLButtonElement>;
}

/**
 * Interface for users getting started providing a simple user interface for 
 * signing up and getting started with making projects on the website.
 * @param show Boolean for modal display (get)
 * @param onBack Callback for back button
 * @param onCreateProject Callback for create button
 * @param onJoinProject Callback for join button
 * @returns modal markup render if show is true
 */
const GetStarted : React.FC<GetStartedProps> = ({ show, onBack, onCreateProject, onJoinProject }) => {
  // Returns modal markup when true, null if not true
  if (!show) {
    return null;
  }

  // render the page
  return (
    <div className="signupProcess-background">
      <div className="signupProcess-modal">
        <div className="GetStarted">
          <h1 id="signupProcess-title">Let's Get Started</h1>
          <p>Choose one</p>

          <div id="getStarted-select">
            <button id="new-project-btn" onClick={onCreateProject}>
              Create Project
              <img src="images/icons/nav/projects.png" alt="folder" />
            </button>
            <button id="join-project-btn" onClick={onJoinProject}>
              Join Project
              <img src="images/icons/nav/discover.png" alt="compass" />
            </button>
          </div>

          <div id="signupProcess-btns">
            <button id="signup-backBtn" onClick={onBack}>
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GetStarted;
