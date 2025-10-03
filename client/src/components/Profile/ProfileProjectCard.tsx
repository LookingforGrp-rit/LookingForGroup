
import { useNavigate } from 'react-router-dom';
import * as paths from '../../constants/routes';

import profilePicture from '../../images/blue_frog.png';
import { ProjectDetail, ProjectMember } from '@looking-for-group/shared';

//used in the profile page under the "projects" section
//displays the project name and the person's role

interface ProfileProjectCardProps {
  project: ProjectDetail;
  userId: number;
}

export const ProfileProjectCard = ({ project, userId }: ProfileProjectCardProps) => {
  const navigate = useNavigate();
  const pathQuery = `?projID=${project.projectId}`;

  // Find member object associated to this user
  const member = project.members.find((m: ProjectMember) => m.user.userId === userId);
  const roleLabel = member?.role.label ?? 'Unknown';

  return (
    <div id="profile-project-card">
      <img id="profile-project-profile-picture" src={profilePicture} alt={project.title} />
      <div id="profile-project-body">
        <div id="profile-project-namedate">
          <h2 id="profile-project-name" onClick={() => navigate(paths.routes.PROJECT + pathQuery)}>
            {project.title}
          </h2>
          <p id="profile-project-date">mm/dd/yy</p>
        </div>
        <p id="profile-project-role">
          as&nbsp;&nbsp;<b>{roleLabel}</b>
        </p>
      </div>
    </div>
  );
};
