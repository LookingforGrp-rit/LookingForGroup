//Styles
import '../Styles/credits.css';
import '../Styles/discoverMeet.css';
import '../Styles/emailConfirmation.css';
import '../Styles/general.css';
import '../Styles/loginSignup.css';
import '../Styles/messages.css';
import '../Styles/notification.css';
import '../Styles/profile.css';
import '../Styles/projects.css';
import '../Styles/settings.css';
import '../Styles/pages.css';

import { useState } from 'react';
// import { ProjectInfo } from '../projectPageComponents/ProjectInfo';
import { ProjectInfoMember } from '../projectPageComponents/ProjectInfoMember';
import { ProjectPost } from '../projectPageComponents/ProjectPost';
import { ProjectMember } from '../projectPageComponents/ProjectMember';
import { ProjectMemberPopup } from '../projectPageComponents/ProjectMemberPopup';
import { PagePopup, openClosePopup } from '../PagePopup';
import { projects, posts, profiles } from '../../constants/fakeData'; // FIXME: use data in db

//Styling changes needed:
/*
-Move return button to left side of page
-Display project creator's  username
-Display at least 2 tags in header
-Add indicator to whether project is actively being made or not
-Move members to header, also include number of members
-How will members be displayed when they're clicked?
-Add 'gallery' section (No idea what goes in there, though)
-Update project posts section to project forum
-No page scrolling, instead use left/right scroll areas for gallery & forum
-No follow button?
-No more options dropdown?
*/

//This is the Project page component, which contains a layout that allows for displaying project info
//More info and comments on individual parts are found above their respective parts

// Main content of the Project page, which is exported from this file
// When loading page, should check to see if the current user is part of the loaded project to determine which header to load
// Utilizes the 'ProjectInfo' and 'ProjectInfoMember' components for headers, 'ProjectMember' component for listing project members,
//    and 'ProjectPost' component for displaying posts the project has made

// No data is passed in through props

// The 'select' element is for testing different projects with this layout, it should not be included in the final product
const Project = () => {
  window.scrollTo(0, 0);

  //current project's id number
  let projectId: string | null;

  // dummy project data, used when re-rendering the page after saving settings
  const dummyProject = {
    _id: -1,
    name: 'dummy project',
    members: [
      {
        userID: 0,
        admin: true,
        owner: true,
        role: 'Project Lead',
      },
    ],
    description: 'dummy project',
    tags: ['dummy', 'project'],
    neededRoles: [
      {
        Role: 'dummy',
        amount: 2,
        description: 'dummy project',
      },
    ],
    posts: [],
  };

  const keys = [0, 0, 0, 0]; //keys are not required for functionality, but react will give an error without it when using .map functions later

  //useState for members popup
  const [showPopup, setShowPopup] = useState<boolean>(false);

  //*** Pulls project ID number from search query (should be stored as 'p') ***
  //(ex. [site path]/project?p=x , where x = the project ID number)
  const urlParams = new URLSearchParams(window.location.search);
  projectId = urlParams.get('projID');

  //If search query doesn't yield anything, use a default project id
  if (projectId === null) {
    console.log('No query in url, loading default');
    projectId = '0';
  }

  //Find project using project ID
  const currentProject = projects.find((p) => p._id === Number(projectId)) || projects[0];

  //Pass project data for rendering purposes
  const [projectData, setProjectData] = useState(currentProject);

  //Store project owner's username
  const ownerMember = projectData.members.find((p) => p.owner === true);
  const projectOwner = ownerMember
    ? profiles.find((p) => p._id === ownerMember.userID)?.username
    : undefined;

  // Optional use of projectOwner to prevent lint error (can be replaced with UI use later)
  if (projectOwner) console.log(`Project owner: ${projectOwner}`);

  //Workaround function to update data on a project save
  //Necessary due to how setting useState variables works
  //If there's a better solution for this, please use it.
  const resetProjectData = () => {
    //First line is to change state to something other than what's being used
    //If it were set to the same project as before, it wouldn't recognize it as a change & wouldn't do anything
    setProjectData(dummyProject);
    //Second line delays the resetting of the project data
    //This is due to the set state function being partly asynchronous, and this allows the first line to finish before continuing
    setTimeout(() => {
      setProjectData(projects.find((p) => p._id === Number(projectId)) || projects[0]);
    }, 1);
  };

  //First select element is used for testing/debugging purposes, it should be removed in the final product
  //Some comments may be move into html
  return (
    <div id="project-page" className="page">
      <select
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
          const selectedProject = projects.find((proj) => proj._id === Number(e.target.value));
          if (selectedProject) {
            setProjectData(selectedProject);
          }
        }}
      >
        {projects.map((project) => {
          return (
            <option value={project._id} key={keys[0]++}>
              {project.name}
            </option>
          );
        })}
      </select>

      <div id="return-button-container">
        <button id="return-button" className="white-button" onClick={() => window.history.back()}>
          &lt; return
        </button>
      </div>

      <ProjectInfoMember
        callback={resetProjectData}
        callback2={() => openClosePopup(showPopup, setShowPopup)}
        projectData={projectData}
      />

      <div id="member-divider">
        <hr />
        <span>Members</span>
        <hr />
      </div>

      <div id="project-members">
        {projectData.members.map((member) => {
          return (
            <ProjectMember
              onClick={() => (window.location.href = 'profile')}
              memberId={member.userID}
              role={member.role}
              key={keys[1]++}
            />
          );
        })}
      </div>
      <hr />

      <div id="project-posts">
        {projectData.posts.map((postNum: number) => {
          return <ProjectPost postID={posts[postNum]._id} key={keys[2]++} />;
        })}
      </div>

      <PagePopup
        width={'80vw'}
        height={'80vh'}
        popupId={3}
        zIndex={3}
        show={showPopup}
        setShow={setShowPopup}
      >
        <ProjectMemberPopup projectData={projectData} />
      </PagePopup>
    </div>
  );
};

export default Project;
