import React from 'react';
import { Tags } from './Tags';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as paths from '../constants/routes';

import profilePicture from '../images/blue_frog.png';
import followPicture from '../images/heart.png';

import { projects } from '../constants/fakeData';

/*

Project Card is featured on the Discover Page as the way for users to see
information about a project recommended to them.

The card should be visually appealing, have enough information to get a user to click,
and be somewhat compact.

Right now the ProjectCard features Name, Bio, Project Picture, Desired Skills, and Desired Roles

ProjectCard uses the same styling as ProfileCard as they serve a similar role.

They are separate components because the ProjectCard displays pronouns and the 
ProjectCard displays desired roles.

I think the two components could be consolidated but would need to display and format content conditionally

The information for the card is pulled from static data in fakeData.ts

Eventually the data should be pulled from a database

This component is not necessarily the final version and doesn't match the visual design of the latest wireframes

*/

interface NeededRole {
  Role: string;
  amount: number;
}

interface ProjectData {
  _id: string;
  name: string;
  description: string;
  tags: string[];
  neededRoles: NeededRole[];
}
// This is used by the Discover Page to display Project information
export const ProjectCard = ({ project }: { project: ProjectData }) => {
  // Updates the url to point toward the project being clicked
  const navigate = useNavigate();
  const pathQuery = `?projID=${project._id}`;
  return (
    <div className="discover-card">
      <img id="discover-card-profile-picture" src={profilePicture} alt={project.name} />
      <div id="discover-card-body">
        {/* When the title is clicked it navigates to the project page */}
        <h2 id="discover-card-name" onClick={() => navigate(paths.routes.PROJECT + pathQuery)}>
          {project.name}
        </h2>
        <p id="discover-card-description">{project.description}</p>
        <div id="discover-card-tag-wrapper">
          <Tags>{project.tags[0]}</Tags>
          <Tags>{project.tags[1]}</Tags>
          <Tags>{project.tags[2]}</Tags>
        </div>
        {/* The needed roles are pulled from an array in fakeData.ts and are mapped along with the needed amounts */}
        <p id="discover-card-needed-roles">
          <b>Looking for:</b> {project.neededRoles.map((r) => `${r.Role}(${r.amount})`).join(', ')}
        </p>
      </div>
    </div>
  );
};
