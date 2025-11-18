import { projects } from '../../constants/fakeData'; // FIXME: use project data in db
import * as paths from '../../constants/routes';

// TODO: this file is old and not used. Has good information regarding past designs and intended userflow, so keep until this is
// properly documented and can be implemented in the future

//Folder containing various functions that are used in the Project page
//Used to simplify amount of code used in Project.tsx, ProjectInfo.tsx, and ProjectInfoMember.tsx

// Many functions below are meant to serve as placeholders, and only call a console.log message
// This is because many of them would involve having to write/read from a completed database, which is not implemented yet
// Not all placeholders may be necessary in the final product, but they can act as a guideline for the needed functionality

//Adds/removes currently viewed project to the user's followed projects
//Will require current user id & project id
//Should only be accessible to non-project members
const followProject = () => {
  console.log('This will let the user follow this project');
  //Get current user id (need session info)
  //Add project id to user's followed project list (need relevant data location)
};

//Adds/removes current user to the list of people interested in joining the current project
//Will require current user id & project id
//Should only be accessible to non-project members
const addInterested = () => {
  console.log('This will add the current user to the list of people interested');
  //Get current user id (need session info)
  //Add project id to user's interested project list (need relevant data location)
  //Add user to project's list of interested people (need relevant data location)
};

//Lets the user create a new post for the project
//Should only be accessible to project members and/or admins
const makeProjectPost = () => {
  console.log('This will let the member create a new project post');
  //Open window or page for making project post
  //No prototype of this found on project page, so I will refrain from adding further for now
};

//Placeholder for entering the virtual space for a project
//Can likely be replaced with a simple redirect funciton with useNavigation
// const enterVirtualSpace = () => {
//   console.log("This will take the user into the project's virtual space");
// };

//Lets the user block this project, preventing it from appearing for them
//Should only be accessible to non-project members
// const blockProject = () => {
//   console.log('This will allow a user to block the current project');
//   //Get current user id
//   //Add project to user's block projects list
// };

//Lets the user open a report popup, which can then be used to report an inappropriate project to site admins
//Should only be accessible to non-project members
// const reportProject = () => {
//   console.log('This will let the user report the project to moderators');
//   //Get project id & user id (if user is not anonymous)
//   //Send a report for admins to review filled with relevant info (need location for reports)
// };

//Lets the user leave the project
//Should only be accessible to project members
const leaveProject = () => {
  console.log('This will let a project member leave a project (Likely after another confirmation)');
  //Get current user id
  //remove user from project members list
};

//Checks the number of members in the project & returns it for displaying in the header
//If the number of members is higher than certain numbers, it will be abbreviated
const createMemberCount = (projectData) => {
  if (projectData.members.length >= 1000) {
    if (projectData.members.length >= 1000000) {
      return `${Math.trunc(projectData.members.length / 1000000)} Members`;
    }
    return `${Math.trunc(projectData.members.length / 1000)} Members`;
  } else if (projectData.members.length === 1) {
    return `1 Member`;
  } else {
    return `${projectData.members.length} Members`;
  }
};

//Opens/closes the additional project options dropdown menu
//Works for both the project member and non-project member views
const toggleOptionDisplay = () => {
  const popup = document.getElementById('more-options-popup');
  popup ? popup.classList.toggle('show') : console.log('element not found');
};

//Removes project from database and redirects user
//Ensure that all other functions come before the redirect function, as changing pages may stop the funciton
//Should only be accessible to the project's creator
const deleteProject = (callback) => {
  //Delete project from database
  //Error caused by typescript, code still runs correctly
  projects.splice(projects.indexOf(projects.find((p) => p._id === projectId)), 1);
  //Redirect to the MyProjects page
  callback(paths.routes.MYPROJECTS);
};

export {
  followProject,
  addInterested,
  makeProjectPost,
  // enterVirtualSpace,
  // blockProject,
  // reportProject,
  leaveProject,
  createMemberCount,
  toggleOptionDisplay,
  deleteProject,
};
