import '../Styles/pages.css';

import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import * as paths from '../../constants/routes';
import MakeAvatarModal from '../AvatarCreation/MakeAvatarModal';
import VolumeSettings from '../SettingsPageComponents/VolumeSetting';
import NotificationSettings from '../SettingsPageComponents/NotificationSetting';
import ProfileVisibilitySetting from '../SettingsPageComponents/ProfileVisibilitySetting';
import ToTopButton from '../ToTopButton';
import CreditsFooter from '../CreditsFooter';
import { ThemeContext } from '../../contexts/ThemeContext';

const Settings = () => {
  // state variables
  const [activeTab, setActiveTab] = useState('general');
  const navigate = useNavigate(); // Hook for navigation

  // Pull the theme and setTheme function from useState() via a context
  const theme = useContext(ThemeContext)['theme'];
  const setTheme = useContext(ThemeContext)['setTheme'];

  return (
    <div className="page">
      {/* <div id="containerId"><NotifButton></NotifButton></div> */}
      <h1 className="page-title">Settings</h1>

      <div id="settings-page">
        {/*************************************************************

          Tabs 

          *************************************************************/}
        <div className="settings-page-tabs">
          <div
            className={`settings-page-tab-links ${activeTab === 'general' ? 'settings-page-active-link' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </div>
          <div
            className={`settings-page-tab-links ${activeTab === 'privacy' ? 'settings-page-active-link' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            Privacy
          </div>
          <div
            className={`settings-page-tab-links ${activeTab === 'syncing' ? 'settings-page-active-link' : ''}`}
            onClick={() => setActiveTab('syncing')}
          >
            Syncing
          </div>
          <div
            className={`settings-page-tab-links ${activeTab === 'account' ? 'settings-page-active-link' : ''}`}
            onClick={() => setActiveTab('account')}
          >
            Account
          </div>
        </div>

        {/*************************************************************

          General settings 

          *************************************************************/}
        <div
          className={`settings-page-tab-contents ${activeTab === 'general' ? 'settings-page-active-tab' : ''}`}
          id="general"
        >
          <div className="setting-in-page">
            <h3>My Avatar</h3>
            <div className="setting-content">
              {/* <div className="displayProfilePic">
                <img src={avatarImage} alt="Profile Pic" />
              </div> */}
              {/* <button className="settingsBtns" onClick={() => { setShowAvatarModal(true); }}>Edit Avatar</button>
              <MakeAvatarModal
                show={showAvatarModal}
                onClose={() => { setShowAvatarModal(false); }}
                setAvatarImage={setAvatarImage}
                mode="edit"
                onBack
                onNext
              /> */}
              <div id="testing-tag-styles-container">
                <div className={`skill-tag-label label-red`}>Designer Skills</div>
                <div className={`skill-tag-label label-orange`}>Major</div>
                <div className={`skill-tag-label label-yellow`}>Developer Skills</div>
                <div className={`skill-tag-label label-green`}>Genre</div>
                <div className={`skill-tag-label label-blue`}>Project Type</div>
                <div className={`skill-tag-label label-purple`}>Soft Skills</div>
                <div className={`skill-tag-label label-grey`}>Other</div>

                <div className={`tag-button tag-button-red-selected`}>Designer Skills</div>
                <div className={`tag-button tag-button-orange-selected`}>Major</div>
                <div className={`tag-button tag-button-yellow-selected`}>Developer Skills</div>
                <div className={`tag-button tag-button-green-selected`}>Genre</div>
                <div className={`tag-button tag-button-blue-selected`}>Project Type</div>
                <div className={`tag-button tag-button-purple-selected`}>Soft Skills</div>
                <div className={`tag-button tag-button-grey-selected`}>Other</div>

                <div className={`tag-button tag-button-red-unselected`}>Designer Skills</div>
                <div className={`tag-button tag-button-orange-unselected`}>Major</div>
                <div className={`tag-button tag-button-yellow-unselected`}>Developer Skills</div>
                <div className={`tag-button tag-button-green-unselected`}>Genre</div>
                <div className={`tag-button tag-button-blue-unselected`}>Project Type</div>
                <div className={`tag-button tag-button-purple-unselected`}>Soft Skills</div>
                <div className={`tag-button tag-button-grey-unselected`}>Other</div>
              </div>
            </div>
          </div>

          {/* Not sure if this is possible
              Looks like we would need to translate everything ourselves/have 
              different versions of the site in different languages and switch between them

              unless it's possible to use a library that does this for us?
              would need to look into this more
          */}
          <div className="setting-in-page">
            <h3>Language</h3>
            <div className="setting-content">
              <select id="language-select">
                <option value="english">English</option>
                <option value="spanish">Spanish</option>
                <option value="french">French</option>
                <option value="german">German</option>
              </select>
            </div>
          </div>

          <NotificationSettings />

          <div className="setting-in-page">
            <h3>
              Dark Mode
              <br></br>
              <span>Change the theme of the page</span>
            </h3>
            <div className="setting-content">
              <label className="switch">
                <input
                  type="checkbox"
                  checked={theme === 'dark'}
                  onChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                />
                <span className="slider round"></span>
              </label>
            </div>
          </div>

          <div className="setting-in-page">
            <h3>
              Autoplay
              <br></br>
              <span>Videos will play automatically</span>
            </h3>
            <div className="setting-content">
              <label className="switch">
                <input type="checkbox" />
                <span className="slider round"></span>
              </label>
            </div>
          </div>

          <VolumeSettings />

          <div id="setting-spacer"></div>
        </div>

        {/*************************************************************

          Privacy settings 

          *************************************************************/}
        <div
          className={`settings-page-tab-contents ${activeTab === 'privacy' ? 'settings-page-active-tab' : ''}`}
          id="privacy"
        >
          {/* <div>privacy settings go here</div> */}

          <ProfileVisibilitySetting />

          <div className="setting-in-page">
            <h3>
              Data
              <br></br>
              <span>What data can be collected</span>
            </h3>
            <div className="setting-content">
              <div className="row">
                <p className="text">Data Collection</p>
                <label className="switch">
                  <input type="checkbox" />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="setting-in-page">
            <h3>
              Blocked Accounts
              <br></br>
              <span></span>
            </h3>
            <div className="setting-content"></div>
          </div>

          <div id="setting-spacer"></div>
        </div>

        {/*************************************************************

          Syncing options

          *************************************************************/}
        <div
          className={`settings-page-tab-contents ${activeTab === 'syncing' ? 'settings-page-active-tab' : ''}`}
          id="syncing"
        >
          {/* <div>syncing options go here</div> */}
          <div className="setting-in-page">
            <h3></h3>
            <div className="setting-content"></div>
          </div>

          <div id="setting-spacer"></div>
        </div>

        {/*************************************************************

          Account settings 

          *************************************************************/}
        <div
          className={`settings-page-tab-contents ${activeTab === 'account' ? 'settings-page-active-tab' : ''}`}
          id="account"
        >
          {/* <div>account settings go here</div> */}

          {/* logout */}
          <div className="setting-in-page">
            <h3>
              Logout
              <br></br>
              <span>Are you sure you want to logout?</span>
            </h3>
            <div className="setting-content">
              <button
                className="settingsBtns"
                onClick={() => {
                  navigate(paths.routes.LOGIN);
                }}
              >
                Log Out
              </button>
            </div>
          </div>

          {/* display name */}
          <div className="setting-in-page">
            <h3>Display Name</h3>
            <div className="setting-content">
              <div className="row displayName">
                <input type="text" placeholder="myDisplayedName" value="" />
                <img src="images/icons/pencil.png" alt="pencil icon" />
              </div>
            </div>
          </div>

          {/* username */}
          <div className="setting-in-page">
            <h3>Username</h3>
            <div className="setting-content">
              <div className="column">
                <input className="textInput" type="text" value="myusername" disabled />
                <button className="settingsBtns">Change</button>
              </div>
            </div>
          </div>

          {/* email */}
          <div className="setting-in-page">
            <h3>Email</h3>
            <div className="setting-content">
              <div className="column">
                <input className="textInput" type="email" value="myemail@gmail.com" disabled />
                <button className="settingsBtns">Change</button>
              </div>
            </div>
          </div>

          {/* password */}
          <div className="setting-in-page">
            <h3>Change Password</h3>
            <div className="setting-content">
              <div className="column">
                <input className="textInput" type="password" value="userpassword123" disabled />
                <button className="settingsBtns">Change</button>
              </div>
            </div>
          </div>

          {/* delete account */}
          <div className="setting-in-page">
            <h3>
              Delete Account
              <br></br>
              <span>Permanently delete your account</span>
            </h3>
            <div className="setting-content">
              <button className="settingsBtns">Delete Account</button>
            </div>
          </div>

          {/* Space at the bottom of the page
              mostly for mobile so the last setting isn't hidden by the nav bar
          */}
          <div id="setting-spacer"></div>
        </div>
      </div>

      {/* Scroll To Top button */}
      <CreditsFooter />
      <ToTopButton />
    </div>
  );
};

export default Settings;
