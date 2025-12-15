import profilePlaceholder from '../../icons/profile-user.png';
import { useNavigate } from 'react-router-dom';
import * as paths from '../../constants/routes';

/**
 * This component renders an instance of a single profile for a project member. 
 * This includes their profile picture, name, and role in the project. 
 * On click here will redirect the user to the profile page of the member clicked.
 * @param props - member ID, member name, member role, avatarURL
 * @returns HTML - Renders a clickable member card showing profile information and will redirect to a member’s profile on click
 */
export const ProjectMember = (props: { memberId: string; name?: string; role?: string; avatarUrl?: string }) => {
  const navigate = useNavigate();

  const { memberId, name, role, avatarUrl } = props;

  // Build query string using the provided memberId
  const pathQuery = `?userID=${memberId}`;

  return (
    <div className="project-member" onClick={() => navigate(paths.routes.PROFILE + pathQuery)}>
      {/* Get image of profile and use preloader function in functions/imageLoad.tsx */}
      <img src={avatarUrl || profilePlaceholder} alt="profile" />
      <h2 className="member-name" onClick={() => navigate(paths.routes.PROFILE + pathQuery)}>
        {name || 'User'}
      </h2>
      <div className="member-role">{role}</div>
    </div>
  );
};
