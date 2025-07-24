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
import { sendPut, sendFile, fetchUserID } from '../../functions/fetch';

// Components
import { Popup, PopupButton, PopupContent } from '../Popup';

// Tabs
import { AboutTab } from './tabs/AboutTab';
import { LinksTab, getSocials } from './tabs/LinksTab';
import { ProjectsTab } from './tabs/ProjectsTab';
import { SkillsTab } from './tabs/SkillsTab';
import { InterestTab } from './tabs/InterestTab';
import { interests } from '../../constants/interests';

// exportable interface for TypeScript errors
export interface ProfileData {
  first_name: string;
  last_name: string;
  job_title: string;
  pronouns: string;
  role: string;
  major: string;
  academic_year: string;
  location: string;
  fun_fact: string;
  headline: string;
  bio: string;
  profile_image: string;
  skills: { id: number; skill: string, type: string, tag: string }[];
  interests: { id: number; interest: string, type: string, tag: string }[];
  socials: { id: number; url: string }[];
}

// The profile to view is independent upon the site's state changes
let profile: ProfileData;
const pageTabs = ['About', 'Projects', 'Skills', 'Interests', 'Links'];

export const ProfileEditPopup = () => {
  // Keeps track of what tab we are in
  let currentTab = 0;
  // Holds new profile image if one is selected
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  // Send selected image to server for save
  const saveImage = async (userID) => {
  if (!selectedImageFile) return;
  // saves the profile pic if there has been a change
  const formData = new FormData();
  formData.append('image', selectedImageFile);

  await fetch(`/api/users/${userID}/profile-picture`, {
    method: 'PUT',
    body: formData,
  });
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
  const dataToStore = {
    firstName,
    lastName,
    headline: getInputValue('headline'),
    pronouns: getInputValue('pronouns'),
    jobTitleId: parseInt(getInputValue('jobTitle')),
    majorId: parseInt(getInputValue('major')),
    academicYear: getInputValue('academicYear'),
    location: getInputValue('location'),
    funFact: getInputValue('funFact'),
    bio,
    skills: getInputValue('skills'),
    interests: getInputValue('interests'),
    socials: getSocials(),
  };
  // console.log('Saving data...');
  // console.log(dataToStore);

  const userID = await fetchUserID();
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
  const switchTab = (tabIndex: number) => {
    if (currentTab === tabIndex) return;

    // Hide all tabs and deactivate all buttons
    pageTabs.forEach((tab, idx) => {
      const tabId = tab.toLowerCase();
      const tabElement = document.getElementById(`profile-editor-${tabId}`);
      const tabButton = document.getElementById(`profile-tab-${tab}`);

      if (tabElement) tabElement.classList.add('hidden');
      if (tabButton) tabButton.classList.remove('project-editor-tab-active');
    });

    // Update Current Tab
    currentTab = tabIndex;

    // Show the new tab
    const currentTabId = pageTabs[currentTab].toLowerCase();
    const currElement = document.querySelector(`#profile-editor-${currentTabId}`);
    const currTab = document.querySelector(`#profile-tab-${pageTabs[currentTab]}`);

    if (currElement) {
      currElement.classList.remove('hidden');
    }

    if (currTab) {
      currTab.classList.add('project-editor-tab-active');
    }

    console.log(`Switched to tab ${pageTabs[currentTab]}`); // Debug
  };

  // Profile should be set up on intialization
  useEffect(() => {
    const setUpProfileData = async () => {
      // Pick which socials to use based on type
      // fetch for profile on ID
      const userID = await fetchUserID();
      const response = await fetch(`api/users/${userID}`);
      const { data } = await response.json(); // use data[0]

      console.log('ProfileEditPopup - Raw API response:', data);
      console.log('ProfileEditPopup - User profile data:', data[0]);
      console.log('ProfileEditPopup - User interests from API:', data[0]?.interests);


      profile = await data[0];
    };
    setUpProfileData();
  }, []);

  // Component to organize the main tab content
  const TabContent = () => {
    return (
      <div id="profile-editor-content">
        <AboutTab profile={profile} selectedImageFile={selectedImageFile} setSelectedImageFile={setSelectedImageFile}/>
        <ProjectsTab profile={profile} />
        <SkillsTab profile={profile} />
        <InterestTab profile={profile} />
        <LinksTab profile={profile} type={'profile'} />
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
        callback={() => {
          // Reset to the first tab and ensure proper hiding
          currentTab = 0;
          setTimeout(() => {
            pageTabs.forEach((tab, idx) => {
              const tabId = tab.toLowerCase();
              const tabElement = document.getElementById(`profile-editor-${tabId}`);
              if (tabElement) {
                if (idx === 0) {
                  tabElement.classList.remove('hidden');
                } else {
                  tabElement.classList.add('hidden');
                }
              }
            });
          }, 0);
        }}
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