import profilePlaceholder from '../../icons/profile-user.png';
import { useNavigate } from 'react-router-dom';
import * as paths from '../../constants/routes';

//This component is used in the project page of the site
//Renders an instance of a single profile of a project member
//Includes their profile picture, their name, and their role on the current project
//Clicking on this component should redirect the user to the relevant profile page of the member clicked

//Takes in a name and role value as props, which should be the project member's name and their role in the relevant project

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
