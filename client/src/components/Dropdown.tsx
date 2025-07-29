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
type DropdownButtonProps = {
  children: React.ReactNode;
  buttonId?: string;
  callback?: Function;
  className?: string;
};

type DropdownContentProps = {
  children: React.ReactNode;
  rightAlign?: boolean;
};

type DropdownProps = {
  children: React.ReactNode;
};

//Button component that will open/close dropdown
export const DropdownButton: React.FC<DropdownButtonProps> = ({ 
  children, 
  buttonId = '', 
  className = '', 
  callback = (e) => {} 
}) => {
  const { open, setOpen } = useContext(DropdownContext);

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
    <button id={buttonId} className={className} onClick={(e) => {
      callback(e);
      toggleOpen();
    }}>
      {children}
    </button>
  );
};

export const DropdownContent: React.FC<DropdownContentProps> = ({
  children,
  rightAlign = false,
}) => {
  const { open } = useContext(DropdownContext);

  // useEffect(() => {
  //   if (open) {
  //     const theme = localStorage.getItem('theme') || 'dark'; // or your default
  //     updateThemeIcons(theme);
  //   }
  // }, [open]);

  if (open) {
    if (!rightAlign) {
      return <div className="dropdown">{children}</div>;
    } else {
      return (
        <div className="dropdown" style={{ right: 0 }}>
          {children}
        </div>
      );
    }
  } else {
    return <></>;
  }
};

//Full dropdown component
export const Dropdown: React.FC<DropdownProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
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
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div className="dropdown-container" ref={dropdownRef}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
};
