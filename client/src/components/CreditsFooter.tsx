import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as paths from '../constants/routes';

//footer supposed to be at the bottom of every page
//put useful links here- for now just credits

/**
 * Footer component intended to appear at the bottom of every page.
 * Provides a button to navigate to the Credits view and visually
 * indicates when the Credits page is active.
 *
 * @returns A footer container with a Credits navigation button.
 */
const CreditsFooter = () => {
  // Hook for navigating programmatically
  const navigate = useNavigate();

  // State to track if the Credits page is ative, used for button highlight
  const [isCredits, setIsCredits] = useState(false);

  // Function to toggle Crdits page visibility and navigate to it
  const toggleCredits = (isShown, path) => {
    setIsCredits(isShown);
    navigate(path); // Navigate to the specified path
  };

  return (
    <div className="FooterContainer">
      <button
        className={isCredits === true ? 'shown' : ''} //Highlight if active
        onClick={() => toggleCredits(true, paths.routes.CREDITS)}
      >
        Credits
      </button>
    </div>
  );
};

export default CreditsFooter;
