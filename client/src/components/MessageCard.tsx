import React from 'react';
import { profiles } from '../constants/fakeData'; // FIXME: use data in db
import profilePicture from '../images/blue_frog.png';

interface Message {
  senderID: number;
  messageContent: string;
  sentDate: string;
}

//used on the Messages page to show the user's individual dms
export const MessageCard = ({ msg }: { msg: Message }) => {
  if (!msg) return null;

  // Grab profile object from sender ID
  const getS = () => {
    for (const p of profiles) {
      if (p._id == msg.senderID) {
        return p;
      }
    }
    console.log('ERROR: invalid sender ID');
    return;
  };
  const sender = getS();
  if (!sender) return;

  return (
    <div className="discover-card" id="message-card">
      <img src={profilePicture} id="discover-card-profile-picture" />
      <div id="discover-card-body">
        <h2 id="discover-card-name" onClick={() => (window.location.href = 'messageHistory')}>
          {sender.name}
        </h2>
        <div id="discover-card-description">
          <p>{msg.messageContent}</p>
          <p>
            <i>{msg.sentDate}</i>
          </p>
        </div>
      </div>
    </div>
  );
};
