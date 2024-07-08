import "../styles.css"
import profilePlaceholder from "../../img/profile-user.png";
import { useNavigate } from 'react-router-dom';
import * as paths from "../../constants/routes";

//This component is used in the project page of the site
//Renders an instance of a single profile of a project member
//Includes their profile picture, their name, and their role on the current project
//Clicking on this component should redirect the user to the relevant profile page of the member clicked

//Takes in a name and role value as props, which should be the project member's name and their role in the relevant project

export const ProjectMember = (props) => {
  const navigate = useNavigate();
  return (
    <div className='project-member' onClick={() => navigate(paths.routes.PROFILE)}>
      <img src={profilePlaceholder} alt=''/>
      <h2 className='member-name' onClick={() => window.location.href="profile"}>{props.name}</h2>
      <div className='member-role'>{props.role}</div>
    </div>
  )
}