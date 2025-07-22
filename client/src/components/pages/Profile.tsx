// NOT CURRENTLY IN USE

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

import { ProfileHeader } from '../Profile/ProfileHeader';
import { ProfileInterests } from '../Profile/ProfileInterests';
import { ProfileSkills } from '../Profile/ProfileSkills';
import { ProfileEndorsements } from '../Profile/ProfileEndorsements';
import { ProfileProjects } from '../Profile/ProfileProjects';
import { useEffect, useState } from 'react';
import ToTopButton from '../ToTopButton';
import EditButton from '../Profile/ProfileEditButton';

// Get user ID from API
const fetchUserID = async () => {
  const response = await fetch('/api/auth');
  const {
    data: { userID },
  } = await response.json();
  return userID;
};

// Get list of users on site from API
const getProfiles = async () => {
  const response = await fetch('/api/users');
  const {
    data: { users },
  } = await response.json();
  return users;
};

// Main Profile component
const Profile = (props) => {
  const [profileID, setProfileID] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<{ _id: number; username: string }[]>([]);

  //Get profile id from search query
  const urlParams = new URLSearchParams(window.location.search);
  setProfileID(urlParams.get('profID'));

  //If nothing is found, use a default id
  useEffect(() => {
    if (profileID === null) {
      (async () => {
        // Get profile ID from API
        const userID = await fetchUserID();
        setProfileID(userID);
        console.log('userID is: ' + userID);
        console.log('profileID is: ' + profileID);
      })();
    }

    // Get all profiles
    const fetchProfiles = async () => {
      const profileData = await getProfiles();
      setProfiles(profileData);
    };
    fetchProfiles();
  }, [profileID]);

  //Find profile data using id & assign it to a value to use
  const profileData = profiles.find((p) => p._id === Number(profileID)) || profiles[0];

  /*usestates for selectors*/
  const [UID, setUID] = useState(profileData._id);
  const user = profiles[UID];

  window.scrollTo(0, 0);

  
  const [userData, setUserData] = useState();

  //Get user data from API
  const getUserData = async (userID: number) => {
    const url = `http://localhost:8081/api/users/${userID}`;
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const rawData = await response.json();
      setUserData(rawData.data[0]);
    } catch (error) {
      console.log(error);
    }
  };
  if (userData === undefined) {
    getUserData(1);
  }

  return (
    <div className="page">
      {/*selector at the top to switch between users */}
      <select
        onChange={(e) => {
          setUID(Number(e.target.value));
        }}
      >
        {profiles.map((prof) => {
          return <option value={prof._id}>{prof.username}</option>;
        })}
      </select>
      <div id="profile-page">
        <ProfileHeader user={user} />
        <ProfileInterests user={user} />
        <div>
          <ProfileSkills user={user} />
          <ProfileEndorsements user={user} />
        </div>
        <ProfileProjects user={user} />
      </div>
      {userData === undefined ? '' : <EditButton userData={userData} />}

      {/* Scroll To Top button */}
      <ToTopButton />
    </div>
  );
};

export default Profile;