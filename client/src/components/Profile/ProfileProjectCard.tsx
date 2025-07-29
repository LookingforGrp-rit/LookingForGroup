
import { useNavigate } from 'react-router-dom';
import * as paths from '../../constants/routes';

import profilePicture from '../../images/blue_frog.png';
import { projects } from '../../constants/fakeData'; // FIXME: use project data in db
import { profiles } from '../../constants/fakeData'; // FIXME: use user data in db

//used in the profile page under the "projects" section
//displays the project name and the person's role

interface ProfileProjectCardProps {
  projectID: number;
  userID: number;
}

export const ProfileProjectCard = ({ projectID, userID }: ProfileProjectCardProps) => {
  const project = projects[projectID];
  const navigate = useNavigate();
  const pathQuery = `?projID=${project._id}`;
  return (
    <div id="profile-project-card">
      <img id="profile-project-profile-picture" src={profilePicture} alt={project.name} />
      <div id="profile-project-body">
        <div id="profile-project-namedate">
          <h2 id="profile-project-name" onClick={() => navigate(paths.routes.PROJECT + pathQuery)}>
            {project.name}
          </h2>
          <p id="profile-project-date">mm/dd/yy</p>
        </div>
        <p id="profile-project-role">
          as&nbsp;&nbsp;<b>{project.members.filter((member) => member.userID == userID)[0].role}</b>
        </p>
      </div>
    </div>
  );
};
