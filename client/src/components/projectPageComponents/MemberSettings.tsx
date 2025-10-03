import { MemberListing } from './MemberListing';
import { SearchBar } from '../SearchBar';
import { projects, profiles } from '../../constants/fakeData'; // FIXME: use data in db
import { useState } from 'react';

//This component is used in the project member view of the Project page
//Contains the layout of the 'Member' tab in the project settings menu
//There is a button that should allow for inviting users to become project members assuming they are an admin or similar
//When rendered, displays a list of project members that are rendered with several 'MemberListing' components
//Uses a 'SearchBar' component to assist with sorting through project members
//Currently, the SearchBar does not function correctly due to how it and the current data is structured
//    It currently searches through the project's member data rather than profile data, and no data on user's names are present there
//    'true' and 'false' also manage to return results despite there being no indicators present within the display due to boolean values used in the data

//A projectId value is passed in to load members of the corresponding project
//tempSettings is also passed in containing the current settings inputed
//A function for updating members is also passed in to be used in individual member listings

//Used for the members tab of the project settings
export const MemberSettings = (props) => {
  let i = -1;
  let key = 0; //Not needed, but react will give an error if not used
  const projectData = projects.find((p) => p._id === Number(props.projectId)) || projects[0];

  //Creates an array of objects containing data to use for the search function
  const members = projectData.members.map((member) => {
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

  const [memberData, setMemberData] = useState(members);

  //Called when searchbar is used to remake member list
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
