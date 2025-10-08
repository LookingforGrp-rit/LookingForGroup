import React from 'react';
import { Tags } from './Tags';
import { useNavigate } from 'react-router-dom';
import * as paths from '../constants/routes';

import profilePicture from '../images/blue_frog.png';
import followPicture from '../images/heart.png';

import { projects } from '../constants/fakeData'; // FIXME: use data in db
import usePreloadedImage from '../functions/imageLoad';

import { MeDetail } from '@looking-for-group/shared';

//backend base url for getting images
const API_BASE = `http://localhost:8081`;

/*

Profile Card is featured on the Discover Page as the way for people to see
information about a person recommended to them.

The card should be visually appealing, have enough information to get a user to click,
and be somewhat compact.

Right now the ProfileCard features Name, Pronouns, Bio, Profile Picture, and featured Skills

ProfileCard uses the same styling as ProjectCard as they serve a similar role.

They are separate components because the ProfileCard displays pronouns and the 
ProjectCard displays desired roles.

I think the two components could be consolidated but would need to display and format content conditionally

The information for the card is pulled from static data in fakeData.ts

Eventually the data should be pulled from a database

This component is not necessarily the final version and doesn't match the visual design of the latest wireframes

*/

interface ProfileCardProps {
  profile: MeDetail;
}

export const ProfileCard = ({ profile }: ProfileCardProps ) => {
  // Updates the url to point toward the profile being clicked
  const navigate = useNavigate();
  const pathQuery = `?userID=${profile.userId}`;
  return (
    <div className="discover-card">
      <img
        src={usePreloadedImage(`${API_BASE}/images/profiles/${profile.profileImage}`, profilePicture)}
        alt={'profile image'}
      />
      <div id="discover-card-body">
        <span>
          {/* When the title is clicked it navigates to the profile page */}
          <h2 id="discover-card-name" onClick={() => navigate(paths.routes.PROFILE + pathQuery)}>
            {profile.firstName + ' ' + profile.lastName}
          </h2>
          {/* The pronouns are pulled from an array in fakeData.ts, and are mapped/joined together with / */}
          <p id="discover-card-pronouns">{profile.pronouns}</p>
        </span>
        <p id="discover-card-description">{profile.bio}</p>
        <div id="discover-card-tag-wrapper">
          {profile.skills?.slice(0, 3).map((s) => (
            <Tags key={s.skillId}>{s.label}</Tags>
          ))}
        </div>
      </div>
    </div>
  );
};
