import { useState, useEffect } from 'react';

interface DiscoverButtonProps {
  children : React.ReactNode;
  isActive : boolean;
  onClick : React.MouseEventHandler;
}

/**
 * Button component used on the Discover page to toggle between
 * viewing "People" and "Projects." Its visual state changes based 
 * on whether it is currently active.
 *
 * @param children - The label or content displayed inside the button.
 * @param isActive - Determines whether the button should appear active.
 * @param onClick - Click handler for when the button is selected.
 * @returns A styled button whose appearance updates based on activity state.
 */
export const DiscoverButton : React.FC<DiscoverButtonProps> = ({ children, isActive, onClick }) => {
  // State to manage the button's CSS class
  const [buttonClassName, setButtonClassName] = useState(
    isActive ? 'discover-button-active' : 'discover-button-inactive'
  );

  // Update the button's class wehenever the active state changes
  useEffect(() => {
    if (isActive) {
      setButtonClassName('discover-button-active');
    } else {
      setButtonClassName('discover-button-inactive');
    }
  }, [onClick]);

  return (
    <button className={buttonClassName + ' discover-button'} onClick={onClick}>
      {children}
    </button>
  );
};
