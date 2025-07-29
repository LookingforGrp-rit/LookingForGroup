import pfp from '../../icons/profile-user.png';
import discordImg from '../../icons/discord.png';
//import twitterImg from '../../icons/x.png';
import messageImg from '../../icons/message.png';
import resumeImg from '../../icons/resume.png';
import { PagePopup, openClosePopup } from '../PagePopup';
import { useState } from 'react';
import { ThemeIcon } from '../ThemeIcon';

{
  /* toggle the popup for the menu that appears next to a users name*/
}
const toggleUserOptions = () => {
  const popup = document.getElementById('user-options-popup');
  popup ? popup.classList.toggle('show') : console.log('element not found');
};

export const ProfileHeader = ({ user }) => {
  /* usestate for the resume popup window */
  const [showPopup, setShowPopup] = useState(false);

  return (
    <div id="profile-header-wrapper">
      <div id="profile-header">
        <img id="profile-pfp" src={pfp} width="100" height="100"></img>
        <div id="profile-info">
          {/*div containing the user's name and the user options button*/}
          {/*together for styling purposes*/}
          <div className="profile-name-button">
            <h2 id="profile-name">{user.name}</h2>
            <button className="icon-button" onClick={toggleUserOptions}>
              <ThemeIcon
                src={'assets/menu_light.svg'}
                darkSrc={'assets/menu_dark.svg'}
                alt={'More Options'}
              />
            </button>
            {/*div for the popup window for user options*/}
            <div id="user-options-popup" className="hide">
              <button className="white-button">Share Profile</button>
              <button className="white-button">Favorite</button>
              <button className="white-button">Block</button>
              <button className="white-button">Report</button>
            </div>
          </div>
          <h3 id="profile-username">@{user.username}</h3>
          <h3 id="profile-pronouns">{user.pronouns[0] + '/' + user.pronouns[1]}</h3>
          <div className="profile-list" id="profile-links">
            {/*TODO: allow user to set their own links and icons for links- not just discord/twitter*/}
            {/*right now just uses 4 set icons/links*/}

            <button
              className="icon-button"
              onClick={() => (window.location.href = 'https://discord.com')}
            >
              <img src={discordImg}></img>
            </button>
            <button
              className="icon-button"
              onClick={() => (window.location.href = 'https://twitter.com')}
            >
              {/* <img src={twitterImg}></img> */}
            </button>
            <button className="icon-button" onClick={() => (window.location.href = 'messages')}>
              <img src={messageImg}></img>
            </button>
            <button className="icon-button" onClick={() => openClosePopup(showPopup, setShowPopup)}>
              <img src={resumeImg}></img>
            </button>

            {/*popup window to display the user's resume*/}
            <PagePopup
              width={'80vw'}
              height={'80vh'}
              popupId={0}
              zIndex={3}
              show={showPopup}
              setShow={setShowPopup}
            >
              <div id="profile-resume-window">
                {/*TODO: have user's resume show up here*/}
                <p>resume goes here</p>
              </div>
            </PagePopup>
          </div>
        </div>
      </div>
      <p id="profile-bio">
        <b>About Me:</b>
        <br />
        {user.bio}
      </p>
    </div>
  );
};
