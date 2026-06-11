import profilePicture from '../images/blue_frog.png';
import { useNavigate } from 'react-router-dom';
import { ThemeIcon } from './ThemeIcon';
import * as paths from '../constants/routes';
import usePreloadedImage from '../functions/imageLoad';
import { UserPreview } from '@looking-for-group/shared';
import { useEffect, useState } from 'react';
import { addUserFollowing, deleteUserFollowing, getCurrentAccount, getUsersById } from '../api/users';

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
  // Current logged-in user id
  const [userId, setUserId] = useState<number>(currentUserId);
  // Whether the current user follows the displayed user
  const [isFollow, setIsFollow] = useState<boolean>(false);
  /**
   * useEffect to fetch follow information:
   * 1. Retrieves current user ID
   * 2. Retrieves full profile of the displayed user to access followers
   * 3. Sets `isFollow` to true if current user is in followers list
   * 
   * Dependency on profileData.userId ensures refresh when panel shows a different user.
   * Dependency on userId ensures we check follow status after current user ID is fetched.
   */
    useEffect(() => {
      const getFollowData = async () => {
        //get our current user so we can check their follow status
        if (userId !== -1) {
          const userResp = await getCurrentAccount();
          if(userResp.data) setUserId(userResp.data.userId);
        }
        
        //get the displayed user (again...) so we have their followers
        //because followers are currently not in the profileData
        //easiest way to do this would be to just put the followers into the userPreview...
        //...but that turned out to be way too much trouble than what it was worth so i'm doing this instead
        const otherUserResp = await getUsersById(profileData.userId);
        if (otherUserResp.data) { 
          otherUserResp.data.followers.users.map((user) => {
            if(user.user.userId === userId) {
              setIsFollow(true);
              return;
            }
          })
          
        }
      };
        getFollowData();
    }, [profileData.userId, userId])

    /**
     * Toggles following the user.
     */
    const toggleFollow = async () => {
      if (userId !== -1) {
        navigate(paths.routes.LOGIN, { state: { from: location.pathname } }); // Redirect if logged out
      } else {
        // otherwise, toggle follow state
        const toggleFollow = !isFollow;
        setIsFollow(toggleFollow);
        
        if (toggleFollow) { // now following
          const follow = await addUserFollowing(profileData.userId);
          if(follow.status === 401) navigate(paths.routes.LOGIN, { state: { from: location.pathname } });
        }
        else { // no longer following
          await deleteUserFollowing(profileData.userId);
        }
      }
    };
    
  return (
    <button className={'profile-panel'} onClick={() => navigate(profileURL)}>
      <img
        src={usePreloadedImage(`${profileData.profileImage}`, profilePicture)}
        alt='profile image'
      />

      <div className={'profile-panel-extras'}>
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
            onClick={(e) => {toggleFollow(); e.stopPropagation();}} // stopPropagation cancels the redirect of the parent
          />
          : profileData.userId !== userId ? <ThemeIcon
            width={30}
            height={27}
            id={"heart-empty"}
            ariaLabel="follow profile"
            onClick={(e) => {toggleFollow(); e.stopPropagation();}} // stopPropagation cancels the redirect of the parent
          /> : ""}
        
        {/* List of items */}
        {profileData.title ?
        <div className={'profile-panel-hover-item'}>
          <div className={'icon-box'}>
            <ThemeIcon id={'role'} width={20} height={20} className={'color-fill undefined'} ariaLabel={'Profession'}/>
          </div>
          <p>{profileData.title}</p>
        </div> : "" }
        {profileData.location ?
        <div className={'profile-panel-hover-item'}>
          <div className={'icon-box'}>
            <ThemeIcon id={'location'} width={12} height={16} className={'color-fill undefined'} ariaLabel={'Location'} />
          </div>
          <p>{profileData.location}</p>
        </div> : "" }
        {profileData.pronouns ?
        <div className={'profile-panel-hover-item'}>
          <div className={'icon-box'}>
            <ThemeIcon id={'pronouns'} width={22} height={22} className={'color-fill undefined'} ariaLabel={'Pronouns'} />
          </div>
          <p>{profileData.pronouns}</p>
        </div> : "" }
        {profileData.funFact ?
        <div className={'profile-panel-hover-item'}>
          <div className={'icon-box'}>
            <ThemeIcon id={'funfact'} width={24} height={24} className={'color-fill undefined'} ariaLabel={'Fun Fact'} />
          </div>
          <p>{profileData.funFact}</p>
        </div> : "" }
        {!(profileData.title && profileData.location && profileData.pronouns && profileData.funFact) ? 
        <div className='profile-panel-hover-item'>
          <p>No extra information</p>
        </div> : ""}
      </div>
    </button>
  );
};
