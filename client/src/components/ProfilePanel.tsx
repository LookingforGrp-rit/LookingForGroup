import profilePicture from '../images/blue_frog.png';
import { useNavigate } from 'react-router-dom';
import { ThemeIcon } from './ThemeIcon';
import * as paths from '../constants/routes';

//backend base url for getting images
const API_BASE = `http://localhost:8081`;

interface ProfileData {
  userId: string;
  profileImage?: string;
  firstName: string;
  lastName: string;
  major: string;
  headline: string;
  jobTitle: string;
  location: string;
  pronouns: string;
  funFact: string;
}

interface ProfilePanelProps {
  profileData: ProfileData;
}

export const ProfilePanel = ({ profileData }: ProfilePanelProps) => {
  const navigate = useNavigate();
  const profileURL = `${paths.routes.NEWPROFILE}?userID=${profileData.userId}`;

  return (
    <div className={'profile-panel'}>
      <img
        src={profileData.profileImage ? `${API_BASE}/images/profiles/${profileData.profileImage}` : profilePicture}
        alt='profile image'
        // default profile picture if profile image doesn't load
        onError={(e) => {
          const profileImg = e.target as HTMLImageElement;
          profileImg.src = profilePicture;
        }}
      />
      <h2>
        {profileData.firstName} {profileData.lastName}
      </h2>
      <h3>{profileData.major}</h3>
      <div id="quote">"{profileData.headline}"</div>
      <div className={'profile-panel-hover'} onClick={() => navigate(profileURL)}>
        <div className={'profile-panel-hover-item'}>
          <ThemeIcon src={'assets/white/role.svg'}  lightModeColor={'white'} darkModeColor={'black'} />
          <p>{profileData.job_title}</p>
        </div>
        <div className={'profile-panel-hover-item'}>
          <ThemeIcon src={'assets/white/location.svg'} lightModeColor={'white'} darkModeColor={'black'} />
          <p>{profileData.location}</p>
        </div>
        <div className={'profile-panel-hover-item'}>
          <ThemeIcon src={'assets/white/pronouns.svg'} lightModeColor={'white'} darkModeColor={'black'} />
          <p>{profileData.pronouns}</p>
        </div>
        <div className={'profile-panel-hover-item'}>
          <ThemeIcon src={'assets/white/funfact.svg'} lightModeColor={'white'} darkModeColor={'black'} />
          <p>{profileData.fun_fact}</p>
        </div>
      </div>
    </div>
  );
};
