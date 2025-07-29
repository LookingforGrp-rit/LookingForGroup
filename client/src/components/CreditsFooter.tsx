import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as paths from '../constants/routes';

//footer supposed to be at the bottom of every page
//put useful links here- for now just credits

const CreditsFooter = () => {
  // Hook for navigation
  const navigate = useNavigate();

  // State to manage whether or not the credits page is being shown
  const [isCredits, setIsCredits] = useState(false);

  // function to handle the toggling of the credits page
  const toggleCredits = (isShown, path) => {
    setIsCredits(isShown);
    navigate(path); // Navigate to the specified path
  };

  return (
    <div className="FooterContainer">
      <button
        className={isCredits === true ? 'shown' : ''}
        onClick={() => toggleCredits(true, paths.routes.CREDITS)}
      >
        Credits
      </button>
    </div>
  );
};

export default CreditsFooter;
