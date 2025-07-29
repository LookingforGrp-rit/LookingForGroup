import { useEffect, useState, createContext, useContext, useRef, Dispatch,ReactNode, SetStateAction } from 'react';

//This component is meant to be reusable in any area of the site, acting as an element that can be
//  opened or closed after performing certain actions.
//Size is fully adjustable through props, and it's content can be anything that is necessary
//When a popup is open, any scrolling of the page behind it is locked until the popup is closed
//Specific buttons can be made within the popup to close it, but it will always contain a close button
//  in the upper right corner of the popup.

// !!! UPDATED FUNCTIONALITY (8/8/2024) !!!
//     popups now utilize useState variables as part of their functionality,
//     which requires some changes on the pages using them

// How to use:
// 1. import component with 'import { PagePopup, openClosePopup } from "../PagePopup";'
// 2. choose a location where the popup would be relevant & choose parameters
//    Additionally, create a useState variable holding a boolean set to false within the same component to be used with the popup
//    Along with an array containing it and any other useState variables being used for popups
//      - An example would be '<PagePopup width={x} height={y} popupId={z} z-index={q} show={p} setShow={setP}>  </PagePopup>'
//      - x & y = popup width/height, respectively; z = number ID to identify this popup; q = the z-index layer of the popup
//      - p = the state variable of the created useState; setP = the function that sets the useState variable
//      - b = the array of useStates being used for popups
// 3. Place whatever content you want within the popup (including elements, components, etc.);
// 4. Have somewhere for the user to trigger the 'openClosePopup' function to open the popup (it can't open itself!)
//      - Use the relevant useState variable, its set function, and the array of all popup useState variables
//        as the parameters for this function to indicate which popup to open
//      - Example: <button onClick={() => openClosePopup(p, setP, b)}>Click me!</button>;
//        Where p & setP = the useState variable & the function that sets it, and b = the array of useState variables

// Created by Joseph Dunne, if there is an issue you cannot solve regarding popups, let me know

//A bool used to check whether or not we should lock scrolling on the page
//currently unused due to issues with sidebar layering
// let scrollLock = false;

//A function used to open and/or close a popup
//Must be able to call within the page itself for the user to access the popup

//state & setState - useState variable & its set function holding a boolean controlling the visibility of the popup
export const openClosePopup = (
  state: boolean,
  setState: Dispatch<SetStateAction<boolean>>
) => {
  setState(!state);
};

interface PagePopupProps {
  children: ReactNode;
  width: string | number;
  height: string | number;
  popupId: number | string;
  zIndex: number;
  show: boolean;
  setShow: Dispatch<SetStateAction<boolean>>;
  onClose?: () => void;
}

//Main component of PagePopup, which is exported from this file
//Passes in 8 values: children, width, height, popupId, zIndex, show, setShow

//children - the actual content of the popup, passed in as if it were acting as the content of an element
//  ( ex. <PagePopup>This would be passed in as 'children' in the popup!</PagePopup> )
//width - the width of the popup window; numbers passed in will serve as pixel measurements
//  To pass in specific css values, use a string with the appropriate unit (ex. '80vw', '50%')
//height - the height of the popup window; functions similarly to width ^
//popupId - the ID of a specific instance of a popup, should ideally be set as a number for easier coding
//  Used when calling openClosePopup to identify which specific popup to interact with
//zIndex - the zIndex layer of the popup, used to tell which layer the popup should appear on
//  Should be at least 2 to ensure it overlays the side menu
//  If multiple popups are being used on a page, use this to differentiate their layers
//show - the useState variable determining whether the popup is visible or not
//setShow - the function that sets the previously mentioned useState variable
export const PagePopup = ({
  children,
  width,
  height,
  popupId,
  zIndex,
  show,
  setShow,
  onClose = () => {},
}: PagePopupProps) => {
  if (!show) return null;

  return (
    <>
      <div id={`popup-cover-${popupId}`} className="popup-cover" style={{ zIndex }} />
      <div id={`popup-container-${popupId}`} className="popup-container">
        <div
          id={`popup-${popupId}`}
          className="popup"
          style={{
            width,
            height,
            top: `clamp(2.5vh, calc((100% - ${height}) / 2), 100%)`,
            left: `clamp(2.5vw, calc((100% - ${width}) / 2), 100%)`,
            zIndex,
          }}
        >
          <button
            className="popup-close"
            onClick={() => {
              onClose();
              openClosePopup(show, setShow);
            }}
          >
            <img src="images/icons/cancel.png" alt="cancel" />
          </button>
          {children}
        </div>
      </div>
    </>
  );
};