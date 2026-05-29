import { useState, createContext, useContext, ReactNode, useRef, useEffect, useCallback } from 'react';
import close from '../icons/cancel.png';
//This is a reusable component that can be used to make popup windows on pages

//To use this component, import all components that are exported in this file
//In your html, make a <Popup> component where you want it to be accessed from
//Inside this <Popup> component, add a <PopupButton> and <PopupContent> component
//Inside the <PopupButton>, you can add any text you want to help signify what the popup will contain
//Additionally, you can set a buttonId attribute in the <PopupButton> component if you want to add an id to the button
//You can also choose to include a function as a 'callback' prop in <PopupButton> if you wish to have it do something else
//Finally, you can even include extra <PopupButton> components inside your <PopupContent> component!
//This can be useful if you want a button that closes your popup & does something else too.
//Place the main content of the popup within the <PopupContent> component; this can be anything you want
//Below is a full example of what a full <Popup> component should look like
/*
<Popup>
  <PopupButton buttonId='custom-popup-button'>My popup</PopupButton>
  <PopupContent>
    Welcome to my popup! <button>Here's a button to use</button>
  </PopupContent>
</Popup>
*/
//Classes for the <PopupButton> component are not implemented yet, but can be if necessary (let Joseph Dunne know)
//Should you wish, you can place a second popup inside an already existing one
//Note that popups can only be closed one at a time currently without some sort of manipulation

//Create context to be used throughout component on popup's visibility state
interface PopupContextType {
  open: boolean;
  setOpen: (value: boolean) => void;
}

//Create context to be used throughout component on popup's visibility state
export const PopupContext = createContext<PopupContextType>({
  open: false,
  setOpen: () => { },
});

/**
 * PopupButton
 * Button component to open/close a popup or run a custom callback.
 *
 * @param children — content of the button
 * @param buttonId — optional id for the button
 * @param className — optional CSS class
 * @param callback — function to run on click
 * @param doNotClose — if true, button does not toggle popup
 * @param closeParent — optional function to close parent popup
 * @returns JSX.Element button
 */
export const 
PopupButton = ({
  children,
  buttonId = '',
  className = '',
  callback = async () => { },
  doNotClose = () => false,
  closeParent,
  disabled = false,
  ref = undefined,
}: {
  children: ReactNode;
  buttonId?: string;
  className?: string;
  callback?: () => void;
  doNotClose?: () => boolean;
  closeParent?: (value : boolean) => void;
  disabled?: boolean;
  ref?: (React.RefObject<HTMLButtonElement | null>);
}) => {
  const { open, setOpen } = useContext(PopupContext);

  const toggleOpen = () => {
    setOpen(!open);
    callback();

    if (ref) {
      console.log(`Save ref: ${ref.current}`);
    }

    if (closeParent) closeParent(false);
  };

  // If button should not close the popup, just execute callback 
  if (doNotClose()) {
    return (
      <button id={buttonId} className={className} tabIndex={0} onClick={callback} disabled={disabled} ref={ref}>
        {children}
      </button>
    );
  }

  return (
    <button id={buttonId} className={className} tabIndex={0} onClick={toggleOpen} disabled={disabled} ref={ref}>
      {children}
    </button>
  );
};

/**
 * PopupContent
 * Container for the popup's main content.
 * Handles closing on Escape key, clicking outside, or browser back navigation.
 *
 * @param children — popup content
 * @param useClose — show close button (default true)
 * @param callback — function to run on closing
 * @param profilePopup — variant style for profile popups
 * @param confirmation — if true, does not disable popup but still runs callback (default false)
 * @returns JSX.Element | null popup overlay and content
 */
export const PopupContent = ({
  children,
  useClose = true,
  callback = async () => { },
  profilePopup = false,
  closeButtonRef = undefined,
  confirmation = false,
}: {
  children: ReactNode;
  useClose?: boolean;
  callback?: () => void;
  profilePopup?: false | true;
  closeButtonRef?: React.RefObject<null>;
  confirmation?: boolean;
}) => {
  const { open, setOpen } = useContext(PopupContext);
  const popupRef = useRef(null);
  const pushedHistoryState = useRef(false);

  // Close the popup and execute optional callback
  const closePopup = useCallback(() => {
    if (!open) return;
    callback();
    if (!confirmation) {
      setOpen(false);
      if (pushedHistoryState.current && (history.state as { popup?: boolean } | null)?.popup) {
        pushedHistoryState.current = false;
        history.back();
      }
    }
  }, [callback, confirmation, open, setOpen]);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePopup();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closePopup]);

  // Close on clicking outside of popup
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const refNode = popupRef.current as Node | null;
      if (refNode && e.target instanceof Node && !refNode.contains(e.target) && e.button !== 2) {
        closePopup();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closePopup]);

  // Close on browser button click
  useEffect(() => {
    if (open) {
      // Push new browser history if no popup state yet
      if (!(history.state as { popup?: boolean } | null)?.popup) {
        history.pushState({ popup: true }, '', '');
        pushedHistoryState.current = true;
      }
    }
    const handlePopState = (event: PopStateEvent) => {
      // Close popup 
      if (open && !((event.state as { popup?: boolean } | null)?.popup)) {
        closePopup();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [closePopup, open]);

  return (
    <>
      {/* {document.getElementsByClassName("popup-cover").length < 1 ? <div className="popup-cover" /> : <></>} */}
      <div className={"popup-cover" + (open ? "" : " hidden")} />
      <div className={"popup-container" + (open ? "" : " hidden")}>
        <div className="popup" ref={popupRef}>
          {useClose ? (
            <button className={`popup-close ${profilePopup === true ? 'popup-close-edit' : ''}`}
                onClick={closePopup} ref={closeButtonRef}>
              <img src={close} alt="close" />
            </button>) : <></>}
          {children}
        </div>
      </div>
    </>
  );
};

/**
 * Popup
 * Wraps the popup system and provides context for open/close state.
 *
 * @param children— the content inside the popup context
 * @returns JSX.Element that provides popup context to children
 */
export const Popup = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);

  return (
    <PopupContext.Provider value={{ open, setOpen }}>
      {children}
    </PopupContext.Provider>
  );
};
