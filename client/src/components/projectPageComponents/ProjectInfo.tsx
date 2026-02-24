import profilePlaceholder from '../../icons/profile-user.png';
import * as projectPageHelper from './ProjectPageHelper';
import { Tag } from '../Tag';
import { ThemeIcon } from '../ThemeIcon';

/**
 * ProjectInfo is a React component that displays project information for non-member users. 
 * It shows project details including the project picture, title, creator, tags, status, member count, and a preview of project members. 
 * It also provides interactive buttons for following, blocking, reporting, and showing interest in joining the project. 
 * This component is designed to be shown when the user viewing the page is not part of the project team.
 * @param props - projectData, projectOwner are passed through
 * @returns React component 
 */

// *** Separate component that should be moved to another file in the future ***
// Could also move some comments into html of component
export const ProjectInfo = (props) => {
  // key - Counter used to generate unique React keys for mapped elements. Incremented for each role in the project listings
  let key = 0; //key is not required for functionality, but react will give an error without it when using the .map function later
  return (
    <div id="project-info">
      {/* Get image of project and use preloader function in functions/imageLoad.tsx */}
      <img id="project-picture" src={profilePlaceholder} alt="project picture" />

      <div id="project-header">
        <h1 id="project-title">{props.projectData.name}</h1>
        <div id="project-owner">Created by: {props.projectOwner}</div>
        <div id="project-tags">
          <Tag className="project-tag">{props.projectData.tags[0]}</Tag>
          <Tag className="project-tag">{props.projectData.tags[1]}</Tag>
        </div>
        <div id="project-status">Status: Active</div>
        <div id="project-member-count">
          {projectPageHelper.createMemberCount(props.projectData)}
        </div>
        <div id="project-member-preview">
          {/* Get image of members and use preloader function in functions/imageLoad.tsx */}
          <img id="member-preview-1" src={profilePlaceholder} />
          <img id="member-preview-2" src={profilePlaceholder} />
          <img id="member-preview-3" src={profilePlaceholder} />
          <span onClick={props.callback2}>Show all members</span>
        </div>
        <div id="header-buttons">
          <button
            id="follow-project"
            className="orange-button"
            onClick={projectPageHelper.followProject}
          >
            Follow
          </button>
          <div id="more-options">
            <button
              id="more-options-button"
              className="icon-button"
              onClick={projectPageHelper.toggleOptionDisplay}
            >
              <ThemeIcon id={'menu'} width={25} height={25} className={'color-fill'} ariaLabel={'...'}/>
            </button>
            {/* <div id="more-options-popup" className="hide">
              <button className="white-button" onClick={projectPageHelper.blockProject}>
                Block
              </button>
              <button className="white-button" onClick={projectPageHelper.reportProject}>
                Report
              </button>
            </div> */}
          </div>
        </div>
      </div>

      <p id="project-desc">{props.projectData.description}</p>

      <div id="project-listings">
        <h3>Looking for</h3>
        <hr />
        {props.projectData.neededRoles.map((role) => {
          return (
            <div key={key++}>
              {role.Role} &#40;{role.amount}&#41;
            </div>
          );
        })}

        <button
          id="interested-button"
          className="white-button"
          onClick={projectPageHelper.addInterested}
        >
          Interested
        </button>
      </div>
    </div>
  );
};
