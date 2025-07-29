import React from 'react';
import { profiles } from '../constants/fakeData'; // FIXME: use data in db
import { useNavigate } from 'react-router-dom';
import * as paths from '../constants/routes';

//Inferfaces 

interface Message {
  messageContent: string;
  sentDate: string;
}
interface MessageLineProps {
  msg: Message;
  username: string;
  type: string;
}

// Called in Message History to display usernames and message contents
export const MessageLine = ({ msg, username, type }: MessageLineProps) => {
  const navigate = useNavigate();
  let profile = profiles.find((p) => p.username === username);
  if (!profile) {
    console.error(`No profile found for username: ${username}`);
    return null;
  }
  // finds the profile associated with the usernames and stores it for use in the path
  for (const p of profiles) {
    if (username == p.username) {
      profile = p;
    }
  }
 const pathQuery = `?profID=${profile._id}`;

  return (
    <div className={type}>
      <p
        className="message-line-user"
        onClick={() =>
          // onClick navigates to the appropriate profile page
          navigate(paths.routes.PROFILE + pathQuery)
        }
      >
        <b>{username}</b>
      </p>
      <p>{msg.messageContent}</p>
      <p className="date-stamp">
        <i>{msg.sentDate}</i>
      </p>
    </div>
  );
};
