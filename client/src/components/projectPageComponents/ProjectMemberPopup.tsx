import { ProjectMember } from './ProjectMember';

/**
 * This function is used to create the Popup tooltip which displays the data on each of the project members 
 * including their Id, and their Role.
 * @param props projectData passed in
 * @returns ProjectMember - returns data for each of the project members to display
 */

// Small component used as part of a popup containing project member info
// Since both member and non-member views will need to use this, it will be used in the main Project.tsx component
// projectData is passed in through props, containing the current project's data
export const ProjectMemberPopup = (props) => {
  let key = 0; //not required, but react will give errors if key isn't used in .map function
  return (
    <>
      <h1>Members</h1>
      <hr />
      <div id="project-member-chart">
        {props.projectData.members.map((member) => {
          return (
            <ProjectMember
              onClick={() => (window.location.href = 'profile')}
              memberId={member.userID}
              role={member.role}
              key={key++}
            />
          );
        })}
      </div>
    </>
  );
};
