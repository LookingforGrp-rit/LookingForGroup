import React, { useEffect, useState, useContext, useRef } from 'react';
import { DropdownContext } from '../contexts/DropdownContext';

//This is a reusable component that can be used to create dropdown menus and windows
//This article was used to help create this component:
//https://www.codemzy.com/blog/reactjs-dropdown-component

//To use this component, import all components that are exported in this file
//In your html, make a <Dropdown> component where you want your dropdown to be
//Inside this <Dropdown> component, add a <DropdownButton> and <DropdownContent> component
//Inside the <DropdownButton>, you can add any text you want to help signify what the dropdown will contain
//Additionally, you can set a buttonId attribute in the <DropdownButton> component if you want to add an id to the button
//Place the main content of the dropdown within the <DropdownContent> component; this can be anything you want
//Below is a full example of what a full <Dropdown> component should look like
/*
<Dropdown>
  <DropdownButton buttonId='custom-dropdown-button'>My dropdown menu</DropdownButton>
  <DropdownContent>
    Welcome to my dropdown menu! <button>Here's a button to use</button>
  </DropdownContent>
</Dropdown>
*/
//Classes for the <DropdownButton> component are not implemented yet, but can be if necessary (let Joseph Dunne know)
//If you want your dropdown to align with the right side of the element...
//add a 'rightAlign' prop to the <DropdownContent> component with a boolean value of 'true'
//This is meant to help prevent dropdowns from going off the screen, but it can just be used for styling too.
//I thought about making it do this dynamically, but chose this route as it:
//1. was easier to implement, 2. is less code intensive, and 3. I trust the team to know how to use it like this

// --------------------
// Type definitions
// --------------------
type DropdownButtonProps = {
  children: React.ReactNode; // Content inside the button
  buttonId?: string; // Optional HTML id
  callback?: Function; // Optional function executed before toggling
  className?: string; // Optional CSS class
  ariaLabel?: string; // Optional aria label
};

type DropdownContentProps = {
  children: React.ReactNode; // Content inside the dropdown panel
  rightAlign?: boolean; // Align dropdown to right edge if true
  openUpward?: boolean; // Align dropdown to top edge if true
};

type DropdownProps = {
  children: React.ReactNode; // Nested DropdownButton and DropdownContent
  callback?: Function;
};

/**
 * Button component used to open or close a dropdown. Intended to be placed
 * inside a parent <Dropdown> component, where it automatically interacts
 * with shared open-state via DropdownContext.
 *
 * @param children - Content to display inside the button.
 * @param buttonId - Optional HTML id applied to the button.
 * @param callback - Optional function invoked before toggling.
 * @param className - Optional CSS class for custom styling.
 * @returns A clickable button that toggles the dropdown open state.
 */
export const DropdownButton: React.FC<DropdownButtonProps> = ({
  children,
  buttonId = '',
  className = '',
  ariaLabel = '',
  callback = (_e: React.MouseEvent) => { }
}) => {
  const { open, setOpen, buttonRef } = useContext(DropdownContext); // Shared open/close state

  // Toggle the open state
  const toggleOpen = () => {
    setOpen(!open);
  };

  // useEffect(() => {
  //   if (open) {
  //     const theme = localStorage.getItem('theme') || 'dark'; // or your default
  //     updateThemeIcons(theme);
  //   }
  // }, [open]);

  return (
    <button
      ref={buttonRef}
      aria-label={ariaLabel}
      id={buttonId}
      className={className}
      onClick={(e) => {
        callback(e); // Run optional callback
        toggleOpen(); // Toggle dropdown open/close
      }}>
      {children}
    </button>
  );
};

/**
 * Helper hook to track the current window height, updating on resize. This is used
 * to determine whether the dropdown should open upward or downward based on available space.
 *
 * @returns The current window height in pixels.
 */
function useWindowHeight() {
  // initialize with undefined or 0 to support SSR (Next.js) safely
  const [height, setHeight] = useState<number>(
    typeof window !== 'undefined' ? window.innerHeight : 0
  );

  useEffect(() => {
    // handler to call on window resize
    const handleResize = () => {
      setHeight(window.innerHeight);
    };

    // add event listener
    window.addEventListener('resize', handleResize);

    // call handler right away so state gets updated with initial window size
    handleResize();

    // clean up listener on unmount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return height;
}

/**
 * Wrapper for the content displayed inside a dropdown. Visibility is controlled
 * by DropdownContext, and the content is only rendered when the dropdown is open.

 * @param children - The dropdown’s rendered content.
 * @param rightAlign - If true, aligns content to the right edge.
 * @returns  The dropdown panel, or an empty fragment when closed.
 */
export const DropdownContent: React.FC<DropdownContentProps> = ({
  children,
  rightAlign = false,
  openUpward = false
}) => {
  const { open, buttonRef } = useContext(DropdownContext); // Access open state
  const contentRef = useRef<HTMLDivElement>(null); // Ref to content for open up/down detection
  const height = useWindowHeight();

  // useEffect(() => {
  //   if (open) {
  //     const theme = localStorage.getItem('theme') || 'dark'; // or your default
  //     updateThemeIcons(theme);
  //   }
  // }, [open]);

  useEffect(() => {
    // return if the dropdown should not open upward
    if (!openUpward) return;
    if (!open || !contentRef.current || !buttonRef || !buttonRef.current) return;

    // get the dropdown and button elements
    const dropdown = contentRef.current;
    const button = buttonRef.current;

    // get the button's position and the dropdown's height
    const buttonRect = button.getBoundingClientRect();
    const dropdownHeight = dropdown.scrollHeight;

    // calculate available space above and below the button
    // additional 80 for mobile nav bar (can change if necessary)
    const spaceBelow = window.innerHeight - 80 - buttonRect.bottom;
    const spaceAbove = buttonRect.top;

    // if space below is less than the dropdown height and space above is enough, open upward
    if (spaceBelow < dropdownHeight && spaceAbove >= dropdownHeight) {
      // Open upward
      dropdown.style.top = `${button.offsetTop - dropdownHeight}px`;
      dropdown.style.bottom = 'auto';
    } else {
      // Open downward
      dropdown.style.bottom = 'auto';
      dropdown.style.top = `${button.offsetHeight}px`;
    }
  }, [open, openUpward, height]);

  // Conditional right alignment
  if (open) {
    if (!rightAlign) {
      return (
        <div
          className="dropdown"
          ref={contentRef}
        >
          {children}
        </div>
      );
    } else {
      return (
        <div
          className="dropdown"
          style={{ right: 0 }}
          ref={contentRef}
        >
          {children}
        </div>
      );
    }
  } else {
    return <></>;
  }
};

/**
 * Parent component that provides shared open/close state for a dropdown.
 * Wraps both a <DropdownButton> and <DropdownContent>, manages click-outside
 * closing behavior, and exposes state through DropdownContext.
 *
 * @param children - Nested DropdownButton and DropdownContent elements.
 * @returns A fully functional dropdown container with context provider.
 */
export const Dropdown: React.FC<DropdownProps> = ({ children, callback }) => {
  const [open, setOpen] = useState(false); // Local state to track open/close
  const dropdownRef = useRef<HTMLDivElement>(null); // Ref to container for click-outside detection
  const buttonRef = useRef<HTMLButtonElement | null>(null); // Ref to button for positioning

  // Close dropdown if clicked outside
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        if (callback) callback();
      }
    };

    if (open) {
      window.addEventListener('click', close);
    }

    return () => {
      window.removeEventListener('click', close);
    };
  }, [open]);

  return (
    <DropdownContext.Provider value={{ open, setOpen, buttonRef }}>
      <div className="dropdown-container" ref={dropdownRef}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
};
