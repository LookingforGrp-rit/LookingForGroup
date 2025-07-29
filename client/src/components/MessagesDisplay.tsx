import React from 'react';
import { MessageCard } from './MessageCard';
import { messages, profiles } from '../constants/fakeData'; // FIXME: use data in db
import { SearchBar } from './SearchBar';
import { useState, useCallback } from 'react';

interface MessagesDisplayProps {
  userID: number;
}
interface Message {
  _id: number;
  senderID: number;
  recipientID: number;
  messageContent: string;
  sentDate: string;
}

interface Profile {
  _id: number;
  username: string;
  name: string;
  // add more if needed
}

// used on the messages page to contain the conversations are displayed to the user to click into
export const MessagesDisplay = ({ userID }: MessagesDisplayProps) => {
  // --- Searching ---
  const searchList: Array<Message | Profile> = [];

  const [filteredMessages, setFilteredMessages] = useState<Message[]>(messages);

  // takes the search results and filters them into a new array to be properly displayed
  const HandleSearch = useCallback((results: (string | object)[][]) => {
    const filteredBlocks: Message[] = [];
    let isMessage = false;
    let alreadyFiltered = false;

    for (const r of results[0]) {
      const rAsMsg = r as Message;

      for (const m of messages) {
        if (r === m) {
          if (filteredBlocks.includes(rAsMsg)) {
            alreadyFiltered = true;
          }
          if (!alreadyFiltered) {
            filteredBlocks.push(rAsMsg);
            isMessage = true;
          }
        }
      }

      if (!isMessage) {
        for (const p of profiles) {
          if (r === p) {
            for (const m of messages) {
              if (p._id === m.senderID) {
                if (filteredBlocks.includes(m)) {
                  alreadyFiltered = true;
                }
                if (!alreadyFiltered) {
                  filteredBlocks.push(m);
                }
              }
            }
          }
        }
      }

      alreadyFiltered = false;
      isMessage = false;
    }

    setFilteredMessages(filteredBlocks);
  }, []);

  // adds all the messages received by the user, and all the profiles >
  // the user has recieved messages from into an array to be searched
  for (const m of messages) {
    if (m.recipientID === userID) {
      for (const p of profiles) {
        if (m.senderID === p._id) {
          searchList.push(p);
        }
      }
      searchList.push(m);
    }
  }

  return (
    <div>
      <SearchBar dataSets={[{ data: searchList }]} onSearch={HandleSearch}></SearchBar>
      {filteredMessages.map((msg) => {
        if (msg.recipientID === userID) {
          return <MessageCard key={msg._id} msg={msg} />;
        }
      })}
    </div>
  );
};
