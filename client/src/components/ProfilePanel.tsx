import profilePicture from '../images/blue_frog.png';
import { useNavigate } from 'react-router-dom';
import { ThemeIcon } from './ThemeIcon';
import * as paths from '../constants/routes';

//backend base url for getting images
const API_BASE = `http://localhost:8081`;

interface ProfileData {
  user_id: string;
  profile_image?: string;
  first_name: string;
  last_name: string;
  major: string;
  headline: string;
  job_title: string;
  location: string;
  pronouns: string;
  fun_fact: string;
}

interface ProfilePanelProps {
  profileData: ProfileData;
}

export const ProfilePanel = ({ profileData }: ProfilePanelProps) => {
  const navigate = useNavigate();
  const profileURL = `${paths.routes.NEWPROFILE}?userID=${profileData.user_id}`;

  return (
    <div className={'profile-panel'}>
      <img
        src={profileData.profile_image ? `${API_BASE}/images/profiles/${profileData.profile_image}` : profilePicture}
        alt='profile image'
        // default profile picture if profile image doesn't load
        onError={(e) => {
          const profileImg = e.target as HTMLImageElement;
          profileImg.src = profilePicture;
        }}
      />
      <h2>
        {profileData.first_name} {profileData.last_name}
      </h2>
      <h3>{profileData.major}</h3>
      <div id="quote">"{profileData.headline}"</div>
      <div className={'profile-panel-hover'} onClick={() => navigate(profileURL)}>
        <div className={'profile-panel-hover-item'}>
          <ThemeIcon light={'/assets/white/role.png'} dark={'/assets/black/role.png'} />
          <p>{profileData.job_title}</p>
        </div>
        <div className={'profile-panel-hover-item'}>
          <ThemeIcon light={'/assets/white/location.png'} dark={'/assets/black/location.png'} />
          <p>{profileData.location}</p>
        </div>
        <div className={'profile-panel-hover-item'}>
          <ThemeIcon light={'/assets/white/pronouns.png'} dark={'/assets/black/pronouns.png'} />
          <p>{profileData.pronouns}</p>
        </div>
        <div className={'profile-panel-hover-item'}>
          <ThemeIcon light={'/assets/white/funfact.png'} dark={'/assets/black/funfact.png'} />
          <p>{profileData.fun_fact}</p>
        </div>
      </div>
    </div>
  );
};
