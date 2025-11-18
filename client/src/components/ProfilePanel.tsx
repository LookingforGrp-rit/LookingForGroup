import profilePicture from '../images/blue_frog.png';
import { useNavigate } from 'react-router-dom';
import { ThemeIcon } from './ThemeIcon';
import * as paths from '../constants/routes';
import usePreloadedImage from '../functions/imageLoad';
import { UserPreview } from '@looking-for-group/shared';

interface ProfilePanelProps {
  profileData: UserPreview;
}

export const ProfilePanel = ({ profileData }: ProfilePanelProps) => {
  const navigate = useNavigate();
  const profileURL = `${paths.routes.PROFILE}?userID=${profileData.userId}`;
  const majorsArr = profileData.majors?.map((maj) => maj.label);
  
  return (
    <div className={'profile-panel'}>
      <img
        src={usePreloadedImage(`images/profiles/${profileData.profileImage}`, profilePicture)}
        alt='profile image'
      />
      <h2>
        {profileData.firstName} {profileData.lastName}
      </h2>
      <h3>{majorsArr.join(', ') || ''}</h3>
      <div id="quote">{profileData.headline ? `"${profileData.headline}"` : ''}</div>

      <div className={'profile-panel-hover'} onClick={() => navigate(profileURL)}>

        {/* Heart to follow */}
        {/* TODO: if user is following */}
        {/* <ThemeIcon
          width={30}
          height={27}
          id={"heart-filled"}
          ariaLabel="unfollow profile"
        /> */}

        {/* TODO: if user is not following */}
        <ThemeIcon
          width={30}
          height={27}
          id={"heart-empty"}
          ariaLabel="follow profile"
        />
        
        {/* List of items */}
        <div className={'profile-panel-hover-item'}>
          <div className={'icon-box'}>
            <ThemeIcon id={'role'} width={20} height={20} className={'mono-fill'} ariaLabel={'Profession'}/>
          </div>
          <p>{profileData.title ? profileData.title : 'None specified'}</p>
        </div>
        <div className={'profile-panel-hover-item'}>
          <div className={'icon-box'}>
            <ThemeIcon id={'location'} width={12} height={16} className={'mono-fill'} ariaLabel={'Location'} />
          </div>
          <p>{profileData.location ? profileData.location : 'None specified'}</p>
        </div>
        <div className={'profile-panel-hover-item'}>
          <div className={'icon-box'}>
            <ThemeIcon id={'pronouns'} width={22} height={22} className={'mono-fill'} ariaLabel={'Pronouns'} />
          </div>
          <p>{profileData.pronouns ? profileData.pronouns : 'None specified'}</p>
        </div>
        <div className={'profile-panel-hover-item'}>
          <div className={'icon-box'}>
            <ThemeIcon id={'funfact'} width={24} height={24} className={'mono-stroke'} ariaLabel={'Fun Fact'} />
          </div>
          <p>{profileData.funFact ? profileData.funFact : 'None specified'}</p>
        </div>
      </div>
    </div>
  );
};
