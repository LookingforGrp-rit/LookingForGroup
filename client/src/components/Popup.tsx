import { useState, createContext, useContext, ReactNode, useRef, useEffect } from 'react';
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
const PopupContext = createContext<PopupContextType>({
  open: false,
  setOpen: () => { },
});

//Button component that will open/close the popup
export const PopupButton = ({
  children,
  buttonId = '',
  className = '',
  callback = () => { },
  doNotClose = () => false,
}: {
  children: ReactNode;
  buttonId?: string;
  className?: string;
  callback?: () => void;
  doNotClose?: () => boolean;
}) => {
  const { open, setOpen } = useContext(PopupContext);

  const toggleOpen = () => {
    callback();
    setOpen(!open);
  };

  if (doNotClose()) {
    return (
      <button id={buttonId} className={className} onClick={callback}>
        {children}
      </button>
    );
  }

  return (
    <button id={buttonId} className={className} onClick={toggleOpen}>
      {children}
    </button>
  );
};

//Main content of the popup
export const PopupContent = ({
  children,
  useClose = true,
  callback = () => { },
  profilePopup = false,
}: {
  children: ReactNode;
  useClose?: boolean;
  callback?: () => void;
  profilePopup?: false | true;
}) => {
  const { open, setOpen } = useContext(PopupContext);
  const popupRef = useRef(null);

  const closePopup = () => {
    callback();
    setOpen(false);
  };

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePopup();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const refNode = popupRef.current as Node | null;
      if (refNode && e.target instanceof Node && !refNode.contains(e.target) && e.button !== 2) {
        closePopup();
      }
    };
    document.addEventListener('mouseup', handleClickOutside);
    return () => document.removeEventListener('mouseup', handleClickOutside);
  }, []);

  // Close on browser button click
  useEffect(() => {
    if (open) {
      // Push new browser history if no popup state yet
      if (!history.state.popup) {
        history.pushState({ popup: true }, '', '');
      }
    };
    const handlePopState = (event: PopStateEvent) => {
      // Close popup 
      if (open && !event.state.popup) {
        closePopup();
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [open]);

  if (!open) return null;

  if (open && useClose) {
    return (
      <>
        {/* {document.getElementsByClassName("popup-cover").length < 1 ? <div className="popup-cover" /> : <></>} */}
        <div className="popup-cover" />
        <div className="popup-container">
          <div className="popup" ref={popupRef}>
            <button className={`popup-close ${profilePopup === true ? 'popup-close-edit' : ''}`} onClick={closePopup}>
              <img src={close} alt="close" />
            </button>
            {children}
          </div>
        </div>
      </>
    );
  } else if (open) {
    return (
      <>
        {/* {document.getElementsByClassName("popup-cover").length < 1 ? <div className="popup-cover" /> : <></>} */}
        <div className="popup-cover" />
        <div className="popup-container">
          <div className="popup" ref={popupRef}>{children}</div>
        </div>
      </>
    );
  } else {
    return <></>;
  }
};

//Full popup component
export const Popup = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);

  return (
    <PopupContext.Provider value={{ open, setOpen }}>
      {children}
    </PopupContext.Provider>
  );
};
