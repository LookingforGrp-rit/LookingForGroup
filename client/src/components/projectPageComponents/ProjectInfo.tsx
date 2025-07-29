import profilePlaceholder from '../../icons/profile-user.png';
import * as projectPageHelper from './ProjectPageHelper';
import { Tags } from '../Tags';
import { ThemeIcon } from '../ThemeIcon';

// Page header that displays for users that are not members of the project
// Includes options to follow, block, report, or show interest in joining the project
// When loading page, should check to see if the current user is part of the loaded project to determine which header to load

// *** Separate component that should be moved to another file in the future ***
// Could also move some comments into html of component

// projectData is passed in through props, containing data on the project
export const ProjectInfo = (props) => {
  let key = 0; //key is not required for functionality, but react will give an error without it when using the .map function later
  return (
    <div id="project-info">
      <img id="project-picture" src={profilePlaceholder} alt="project picture" />

      <div id="project-header">
        <h1 id="project-title">{props.projectData.name}</h1>
        <div id="project-owner">Created by: {props.projectOwner}</div>
        <div id="project-tags">
          <Tags className="project-tag">{props.projectData.tags[0]}</Tags>
          <Tags className="project-tag">{props.projectData.tags[1]}</Tags>
        </div>
        <div id="project-status">Status: Active</div>
        <div id="project-member-count">
          {projectPageHelper.createMemberCount(props.projectData)}
        </div>
        <div id="project-member-preview">
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
              <ThemeIcon
                src={'assets/menu_light.svg'}
                darkSrc={'assets/menu_dark.svg'}
                alt={'...'}
              />
            </button>
            <div id="more-options-popup" className="hide">
              <button className="white-button" onClick={projectPageHelper.blockProject}>
                Block
              </button>
              <button className="white-button" onClick={projectPageHelper.reportProject}>
                Report
              </button>
            </div>
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
