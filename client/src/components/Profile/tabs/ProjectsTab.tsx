import { useState, useEffect } from 'react';
import { sendPut, fetchUserID } from '../../../functions/fetch';

// let userProjects : [];

const ProjectTile = (props: {index: string}) => {
    return (
        <div className='projectTile' id={props.index}>
            {/* <p>{props.data.title}</p> */}
            <p>This is project #{props.index}</p>
        </div>
    );
}

export const ProjectsTab = (props: {profile: {}}) => {
    const [userProjects, setUserProjects] = useState([]);
    useEffect(() => {
        // Load in userProfile and then the projects
        const setUpProjects = async () => {
            const userID = await fetchUserID();
            const response = await fetch(`/api/users/${userID}/projects`);
            const data = await response.json();
            setUserProjects(data.data);
            // userProjects = data.data;
            // console.log('Projects finished loading');
        };

        setUpProjects();
    }, []);

    // console.log(userProjects);
    let render;
    if(userProjects && userProjects.length > 0) {
        // Make the grid of project buttons
        render = userProjects.map((p, i) => {
            return <ProjectTile index={i} data={p}/>;
        });
    } else {
        // Tell the user they have no projects
        render = <div className="no-projects-text">
            <p>You have no projects yet!</p>
            {/* <p>Start a new Project or join one</p> */}
        </div>;
    }

    return (
        <div id="profile-editor-projects" className="hidden">
          <div className="project-editor-section-header">Projects</div>
          <div className="project-editor-extra-info">
            Choose to hide/show projects you've worked on.
          </div>
          <div id="profile-editor-project-selection">
            {render}
          </div>
        </div>
      );
};