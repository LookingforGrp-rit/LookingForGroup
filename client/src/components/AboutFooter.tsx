import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as paths from '../constants/routes';

//footer supposed to be at the bottom of every page

/**
 * Footer component intended to appear at the bottom of every page.
 * Provides a button to navigate to the About view and visually
 * indicates when the About page is active.
 *
 * @returns A footer container with am About navigation button.
 */
const AboutFooter = () => {
  // Hook for navigating programmatically
  const navigate = useNavigate();

  // State to track if the Credits page is ative, used for button highlight
  const [isAbout, setIsAbout] = useState(false);

  // Function to toggle Crdits page visibility and navigate to it
  const toggleCredits = (isShown : boolean, path : string) => {
    setIsAbout(isShown);
    navigate(path); // Navigate to the specified path
  };

  return (
    <div className="FooterContainer">
      <a
        className={isAbout === true ? 'shown about-left' : 'about-left'}
        href={paths.routes.ABOUT}
      >
        About
      </a>
    </div>
  );
};

export default AboutFooter;
