//Styles
import '../Styles/credits.css';
import '../Styles/discoverMeet.css';
import '../Styles/emailConfirmation.css';
import '../Styles/general.css';
import '../Styles/loginSignup.css';
import '../Styles/messages.css';
import '../Styles/notification.css';
import '../Styles/profile.css';
import '../Styles/projects.css';
import '../Styles/settings.css';
import '../Styles/pages.css';

// Utilities and React functions
import { useState, useEffect } from 'react';
import { sendPut, sendFile } from '../../functions/fetch';

// Components
import { Popup, PopupButton, PopupContent } from '../Popup';

// Tabs
import { AboutTab } from './tabs/AboutTab';
import { LinksTab, getSocials } from './tabs/LinksTab';
import { ProjectsTab } from './tabs/ProjectsTab';
import { SkillsTab } from './tabs/SkillsTab';
import { InterestTab } from './tabs/InterestTab';
import { interests } from '../../constants/interests';
import { getCurrentUsername, getUsersById, updateProfilePicture } from '../../api/users';

import { MeDetail, MySkill, UserSocial } from '@looking-for-group/shared';

// The profile to view is independent upon the site's state changes
const [profile, setProfile] = useState<MeDetail | null>(null);
const pageTabs = ['About', 'Projects', 'Skills', 'Interests', 'Links'];

export const ProfileEditPopup = () => {
  // Holds new profile image if one is selected
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  // Send selected image to server for save
  const saveImage = async (userID: number) => {
  if (!selectedImageFile) return;

  await updateProfilePicture(userID, selectedImageFile);
};

const onSaveClicked = async (e : Event) => {
  e.preventDefault(); // prevents any default calls
  // Receive all inputted values
  const getInputValue = (input: string) => {
    const element = document.getElementById(`profile-editor-${input}`) as HTMLInputElement;
    return element?.value?.trim() || ''; // null
  };

  // required fields: ensure not just empty/spaces
  const firstName = getInputValue('firstName');
  const lastName = getInputValue('lastName');
  const bio = getInputValue('bio');

  // pop up error text if fields invalid
  if (!firstName || !lastName || !bio) {
    const errorText = document.getElementById('invalid-input-error');
    if (errorText) {
      errorText.style.display = 'block';
    }
    return;
  }

  // Prepare these values for a POST/PUT request
  const dataToStore: MeDetail = {
    ...profile!,
    firstName,
    lastName,
    headline: getInputValue('headline'),
    pronouns: getInputValue('pronouns'),
    title: getInputValue('jobTitle'),
    majors: profile?.majors ?? [],
    academicYear: getInputValue('academicYear'),
    location: getInputValue('location'),
    funFact: getInputValue('funFact'),
    bio,
    skills: profile?.skills || [],
    socials: profile?.socials || [],
  };
  // console.log('Saving data...');
  // console.log(dataToStore);

  const userID = await getCurrentUsername();
  await sendPut(`/api/users/${userID}`, dataToStore);
  await saveImage(userID);

  window.location.reload(); // reload page
};

  // In your ProfileEditPopup.tsx file

  // useEffect to initialize the tabs
  useEffect(() => {

    setTimeout(() => {
      // Initialize all tabs to be hidden except the first one
      pageTabs.forEach((tab, idx) => {
        const tabElement = document.querySelector(`#profile-editor-${tab.toLowerCase()}`);
        if (tabElement) {
          if (idx === 0) {
            tabElement.classList.remove('hidden');
          } else {
            tabElement.classList.add('hidden');
          }
        }
      },);


    }, []);

    // Highlight the first tab button
    const firstTab = document.querySelector(`#profile-tab-${pageTabs[0]}`);
    if (firstTab) {
      firstTab.classList.add('project-editor-tab-active');
    }
  }, []);

  // Fix the switchTab function
  const [currentTab, setCurrentTab] = useState(0);
  const switchTab = (index: number) => setCurrentTab(index);

  // Profile should be set up on intialization
  useEffect(() => {
    const setUpProfileData = async () => {
      // Pick which socials to use based on type
      // fetch for profile on ID
      const userID = await getCurrentUsername();
      const response = await getUsersById(userID);

      console.log('ProfileEditPopup - Raw API response:', response.data);
      console.log('ProfileEditPopup - User profile data:', response.data[0]);
      console.log('ProfileEditPopup - User interests from API:', response.data[0]?.interests);


      setProfile(response.data[0]);
    };
    setUpProfileData();
  }, []);

  // Component to organize the main tab content
  const TabContent = () => {
    if (!profile) return null;
    return (
      <div id="profile-editor-content">
        {currentTab === 0 && <AboutTab profile={profile} selectedImageFile={selectedImageFile} setSelectedImageFile={setSelectedImageFile} />}
        {currentTab === 1 && <ProjectsTab profile={profile} />}
        {currentTab === 2 && <SkillsTab profile={profile} />}
        {currentTab === 3 && <InterestTab profile={profile} />}
        {currentTab === 4 && <LinksTab profile={profile} type="profile" />}
      </div>
    );
  };

  // Method to switch between tabs
  /*const switchTab = (tabIndex: number) => {
    // This method toggles the visibility for the previous tab and then the selected tab
    // First toggle visibility for the previous tab
    const previousTabIndex = pageTabs[currentTab].toLowerCase();
    const prevElement = document.querySelector(`#profile-editor-${previousTabIndex}`);
    const prevTab = document.querySelector(`#profile-tab-${pageTabs[currentTab]}`);
    if (prevElement) {
      prevElement.classList.toggle('hidden');
    }
    if (prevTab) {
      prevTab.classList.toggle('project-editor-tab-active');
    }

    // Update Current Tab
    currentTab = tabIndex;

    // Get current tab
    let currentElement;
    const currTab = document.querySelector(`#profile-tab-${pageTabs[currentTab]}`);
    switch (pageTabs[currentTab]) {
      case 'About':
        currentElement = document.querySelector(`#profile-editor-about`);
        break;
      case 'Projects':
        currentElement = document.querySelector(`#profile-editor-projects`);
        break;
      case 'Skills':
        currentElement = document.querySelector(`#profile-editor-skills`);
        break;
      case 'Interests':
        currentElement = document.querySelector(`#profile-editor-interests`);
        break;
      case 'Links':
        currentElement = document.querySelector(`#profile-editor-links`);
        break;
      default:
        currentElement = document.querySelector(`#profile-editor-about`);
        break;
    }
    // Toggle current tab's visibility
    if (currentElement) {
      currentElement.classList.toggle('hidden');
    }
    if (currTab) {
      currTab.classList.toggle('project-editor-tab-active');
    }
  };*/



  // Maps the pageTabs into interactable page tabs, to switch between the Tab Content
  const editorTabs = pageTabs.map((tag, i) => {
    return (
      <button
        key={tag}
        onClick={(e) => {
          e.preventDefault();
          switchTab(i);
        }}
        id={`profile-tab-${tag}`}
        className={`project-editor-tab ${currentTab === i ? 'project-editor-tab-active' : ''}`}
      >
        {tag}
      </button>
    );
  });

  return (
    <Popup>
      <PopupButton buttonId="project-info-edit">Edit</PopupButton>
      <PopupContent
      profilePopup={true}
        callback={() => setCurrentTab(0)}
      >
        <form id="profile-creator-editor" encType="multipart/form-data">
          <div id="profile-editor-tabs">{editorTabs}</div>
          <TabContent />
          <input
            type="submit"
            id="profile-editor-save"
            onClick={onSaveClicked}
            value={'Save Changes'}
          />
          <div id="invalid-input-error" className="error-message">
            <p>*Fill out all required fields before saving!*</p>
          </div>
        </form>
      </PopupContent>
    </Popup>
  );
};