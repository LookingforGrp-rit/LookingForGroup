import profilePicture from '../images/blue_frog.png';
import { useNavigate } from 'react-router-dom';
import { ThemeIcon } from './ThemeIcon';
import * as paths from '../constants/routes';
import usePreloadedImage from '../functions/imageLoad';
import { MeDetail } from '@looking-for-group/shared';

//backend base url for getting images
const API_BASE = `http://localhost:8081`;

interface ProfilePanelProps {
  profileData: MeDetail;
}

export const ProfilePanel = ({ profileData }: ProfilePanelProps) => {
  const navigate = useNavigate();
  const profileURL = `${paths.routes.NEWPROFILE}?userID=${profileData.userId}`;

  return (
    <div className={'profile-panel'}>
      <img
        src={usePreloadedImage(`${API_BASE}/images/profiles/${profileData.profileImage}`, profilePicture)}
        alt='profile image'
        // default profile picture if profile image doesn't load
        onError={(e) => {
          // might be handled by preloaded image function. TODO: test
          const profileImg = e.target as HTMLImageElement;
          profileImg.src = profilePicture;
        }}
      />
      <h2>
        {profileData.firstName} {profileData.lastName}
      </h2>
      <h3>{profileData.majors?.join(', ') || ''}</h3>
      <div id="quote">"{profileData.headline}"</div>

      <div className={'profile-panel-hover'} onClick={() => navigate(profileURL)}>
        <div className={'profile-panel-hover-item'}>
          <div className={'icon-box'}>
            <ThemeIcon id={'role'} width={20} height={20} className={'mono-fill'} ariaLabel={'Profession'}/>
          </div>
          <p>{profileData.title}</p>
        </div>
        <div className={'profile-panel-hover-item'}>
          <div className={'icon-box'}>
            <ThemeIcon id={'location'} width={12} height={16} className={'mono-fill'} ariaLabel={'Location'} />
          </div>
          <p>{profileData.location}</p>
        </div>
        <div className={'profile-panel-hover-item'}>
          <div className={'icon-box'}>
            <ThemeIcon id={'pronouns'} width={22} height={22} className={'mono-fill'} ariaLabel={'Pronouns'} />
          </div>
          <p>{profileData.pronouns}</p>
        </div>
        <div className={'profile-panel-hover-item'}>
          <div className={'icon-box'}>
            <ThemeIcon id={'funfact'} width={24} height={24} className={'mono-stroke'} ariaLabel={'Fun Fact'} />
          </div>
          <p>{profileData.funFact}</p>
        </div>
      </div>
    </div>
  );
};
