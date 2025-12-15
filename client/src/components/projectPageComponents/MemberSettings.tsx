import { MemberListing } from './MemberListing';
import { SearchBar } from '../SearchBar';
import { projects, profiles } from '../../constants/fakeData'; // FIXME: use data in db
import { useState } from 'react';

// TODO: this file is old and not used. Has good information regarding past designs and intended userflow, so keep until this is
// properly documented and can be implemented in the future

/**
 * This component is for viewing project members in the Project page. It has the layout of the “Member” tab in the project settings menu. 
 * This includes a button for inviting users to join as project members if the user has a status like admin. 
 * This is in tandem with the “MemberListing” component. 
 * There is also a “SearchBar” component to help sort through project members.
 * @param props - projectId, tempSettings, as well as a function for updating members are passed in
 * @returns HTML - Renders the project member list with a SearchBar, an “Invite” Button, and a MemberListing per member
 */

// Current Status: Not Functioning because of how the current data is structured 
// Searches through project’s member data instead of profile data, and no users’ names are present
// Boolean values also manage to return results albeit no present indicators within display because of how they are used in data

//Used for the members tab of the project settings
export const MemberSettings = (props) => {
  // i - Index variable for tracking members during rendering to align with roles from tempSettings 
  let i = -1;
  let key = 0; //Not needed, but react will give an error if not used
  // projectData - Full project object retrieved from utilizing projectId from data
  const projectData = projects.find((p) => p._id === Number(props.projectId)) || projects[0];

  // members - Array of objects for member profiles that have been set to match project members with respective profile data
  const members = projectData.members.map((member) => {
    // profile - Current index of all profiles gathered from a specific project
    const profile = profiles.find((p) => p._id === Number(member.userID));
    if (profile !== undefined) {
      return {
        name: profile.name,
        username: profile.username,
        role: member.role,
        id: member.userID,
      };
    }
  });

  // memberData - Current list of members on screen and will update accordingly on search (setMemberData)
  const [memberData, setMemberData] = useState(members);

  // Set memberData based on search results from SearchBar. Expected search results to be a nested array.
  const updateMembers = (members) => {
    //members requires the index identified here due to how the data returned from the search function is structured
    setMemberData(members[0]);
  };

  return (
    <div id="member-settings">
      <div id="member-settings-header">
        <SearchBar dataSets={[{ data: members }]} onSearch={updateMembers} />
        {/* <button className="white-button">Invite</button> */}
      </div>
      <div id="member-settings-list">
        <hr />
        {memberData.map((member) => {
          if (member !== undefined) {
            i++;
            return (
              <div key={key++}>
                <MemberListing
                  name={member.name}
                  role={props.tempSettings.projectMembers[i].role}
                  num={i}
                  idNum={member.id}
                  updateMemberSettings={props.updateMemberSettings}
                />
                <hr />
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};
