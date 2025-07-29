import React, { useEffect, useRef } from 'react';

interface NotificationsProps {
  show: boolean;
  onClose: () => void;
}

const Notifications: React.FC<NotificationsProps> = ({ show, onClose }) => {
  // Close the notifications modal when the user clicks anywhere outside of the modal
  // this is done by checking if the click event target is the modal itself or a child of the modal
  // if it is not, then the modal is closed
  const modalRef = useRef<HTMLDivElement>(null); // useRef is used to access the DOM element of the modal
  // HTMLDivElement is used to specify the type of the ref
  // null is the initial value of the ref

  // add an event listener to the document to listen for clicks
  const handleClickOutside = (event: MouseEvent) => {
    // if the modal is shown and the click event target is not the modal or a child of the modal, close the modal
    // event.target is the element that was clicked
    // as Node is used to specify the type of the event target
    // Node is the base class for all DOM nodes
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
      onClose();
    }
  };

  // add the event listener when the component mounts
  // remove the event listener when the component unmounts
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // render the notifications modal
  return (
    <div className={`notifications-container ${show ? 'show' : ''}`} ref={modalRef}>
      <div className="notifications-header">
        <button onClick={onClose}></button>
      </div>
      <div className="notifications-body">
        {/* add notifications here */}
        <p>No new notifications</p>
      </div>
    </div>
  );
};

export default Notifications;
