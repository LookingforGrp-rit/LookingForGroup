import profilePicture from '../images/lfrog.png';
import { useNavigate } from 'react-router-dom';
import { ThemeIcon } from './ThemeIcon';
import * as paths from '../constants/routes';
import usePreloadedImage from '../functions/imageLoad';
import { UserPreview } from '@looking-for-group/shared';
import { useEffect, useState, useRef } from 'react';
import { addUserFollowing, deleteUserFollowing, getUsersById } from '../api/users';

interface ProfilePanelProps {
  profileData: UserPreview;
  currentUserId: number;
}

/**
 * ProfilePanel
 * Displays a user's profile information in a panel format with hover details.
 * Shows profile image, name, majors, headline, and hover overlay with additional info.
 * Handles follow status for the current user and navigates to the full profile page on click.
 *
 * @param profileData - UserPreview object containing basic user info (name, image, title, location, pronouns, fun fact, etc.)
 * @returns JSX element representing a user profile panel
 */
export const ProfilePanel = ({ profileData, currentUserId }: ProfilePanelProps) => {

  const navigate = useNavigate();
  const profileURL = `${paths.routes.PROFILE}?userID=${profileData.userId}`;
  // Array of major labels extracted from profileData
  const majorsArr = profileData.majors?.map((maj) => maj.label);

  //follow stuff
  // Whether the current user follows the displayed user
  const [isFollow, setIsFollow] = useState<boolean>(false);

  const profilePanel = useRef<HTMLDivElement>(null);

  /**
   * useEffect to fetch follow information:
   * 1. Retrieves full profile of the displayed user to access followers
   * 2. Sets `isFollow` to true if current user is in followers list
   * 
   * Dependency on profileData.userId ensures refresh when panel shows a different user.
   */
  useEffect(() => {
    // set follow to false when not logged in
    if (currentUserId === -1) {
      setIsFollow(false);
      return;
    }
    const getFollowData = async () => {
      //get the displayed user (again...) so we have their followers
      //because followers are currently not in the profileData
      //easiest way to do this would be to just put the followers into the userPreview...
      //...but that turned out to be way too much trouble than what it was worth so i'm doing this instead
      const otherUserResp = await getUsersById(profileData.userId);
      if (otherUserResp.data) {
        const isFollowing = otherUserResp.data.followers.users.some(
          (user) => user.user.userId === currentUserId,
        );
        setIsFollow(isFollowing);
      }
    };
    getFollowData();
  }, [profileData.userId, currentUserId])

  /**
   * Toggles following the user.
   */
  const toggleFollow = async () => {
    if (currentUserId == -1) {
      navigate(paths.routes.LOGIN, { state: { from: location.pathname } }); // Redirect if logged out
    } else {
      // otherwise, toggle follow state
      const toggleFollow = !isFollow;
      setIsFollow(toggleFollow);

      if (toggleFollow) { // now following
        const follow = await addUserFollowing(profileData.userId);
        if (follow.status === 401) navigate(paths.routes.LOGIN, { state: { from: location.pathname } });
      }
      else { // no longer following
        await deleteUserFollowing(profileData.userId);
      }
    }
  };

  return (
    <div
      className={'profile-panel'}
      onClick={() => navigate(profileURL)}
    >   
      <img
        src={usePreloadedImage(`${profileData.profileImage}`, profilePicture)}
        alt='profile image'
      />

      <div className={'profile-panel-extras'} ref={profilePanel} hidden={true}>
        <h2>
          {profileData.firstName} {profileData.lastName}
        </h2>
        <h3>{majorsArr.join(', ') || ''}</h3>
        <div id="quote">{profileData.headline ? `"${profileData.headline}"` : ''}</div>
      </div>

      <div className='profile-panel-hover'>
        <h2>
          {profileData.firstName} {profileData.lastName}
        </h2>
        <h3>{majorsArr.join(', ') || ''}</h3>
        <div id="quote">{profileData.headline ? `"${profileData.headline}"` : ''}</div>

        {isFollow ? <ThemeIcon
          width={30}
          height={27}
          id={"heart-filled"}
          ariaLabel="unfollow profile"
          onClick={(e) => { toggleFollow(); e.stopPropagation(); }} // stopPropagation cancels the redirect of the parent
        />
          : profileData.userId !== currentUserId ? <ThemeIcon
            width={30}
            height={27}
            id={"heart-empty"}
            ariaLabel="follow profile"
            onClick={(e) => { toggleFollow(); e.stopPropagation(); }} // stopPropagation cancels the redirect of the parent
          /> : ""}

        {/* List of items */}
        {profileData.title ?
          <div className={'profile-panel-hover-item'}>
            <div className={'icon-box'}>
              <ThemeIcon id={'role'} width={24} height={20} className={'color-fill undefined'} ariaLabel={'Profession'} />
            </div>
            <p>{profileData.title}</p>
          </div> : ""}
        {/* It feels unnecessary to display location as a hover item-- restore if you wish */}
        {/*profileData.location ?
          <div className={'profile-panel-hover-item'}>
            <div className={'icon-box'}>
              <ThemeIcon id={'location'} width={24} height={16} className={'color-fill undefined'} ariaLabel={'Location'} />
            </div>
            <p>{profileData.location}</p>
          </div> : ""*/}
        {profileData.pronouns ?
          <div className={'profile-panel-hover-item'}>
            <div className={'icon-box'}>
              <ThemeIcon id={'pronouns'} width={24} height={22} className={'color-fill undefined'} ariaLabel={'Pronouns'} />
            </div>
            <p>{profileData.pronouns}</p>
          </div> : ""}
        {profileData.funFact ?
          <div className={'profile-panel-hover-item'}>
            <div className={'icon-box'}>
              <ThemeIcon id={'funfact'} width={24} height={24} className={'color-fill undefined'} ariaLabel={'Fun Fact'} />
            </div>
            <p>{profileData.funFact}</p>
          </div> : ""}
          {/* Displays 'No extra information' if there is no other data displayed on the user's profile */}
        {!(profileData.title || profileData.location || profileData.pronouns || profileData.funFact) ?
          <div className='profile-panel-hover-item'>
            <p>No extra information</p>
          </div> : ""}
      </div>
    </div>
  );
};
