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

import { useMemo, useState } from 'react';
import { Header } from '../Header';
import { members } from '../../constants/lfgmembers';

const Credits = () => {
  //SEARCHBAR FUNCTIONALITY

  // displayed data based on filter/search query
  const [filteredMembersList, setFilteredMembersList] = useState(members);

  // Need this for searching
  let tempMembersList = members;

  // List that holds trimmed data for searching. Empty before fullItemList is initialized
  const [membersSearchData, setMembersSearchData] = useState(members);

  // Format data for use with SearchBar, which requires it to be: [{ data: }]
  const dataSet = useMemo(() => {
    return [{ data: membersSearchData }];
  }, [membersSearchData]);

  // Updates filtered members list with new search info
  const searchMembers = (searchResults) => {
    // Clear list before handling search
    tempMembersList = [];

    //runs through each member to see if any match the search term
    for (const result of searchResults[0]) {
      for (const member of membersSearchData) {
        if (result === member) {
          //if match is found, pushes that member to the temp member list
          tempMembersList.push(members[membersSearchData.indexOf(member)]);
          continue;
        }
      }
    }

    // If no items were found, 
    if (tempMembersList.length === 0) {
      setFilteredMembersList([]); // Clear the displayed list
      console.log('No matching items found.');
    } else {
      setFilteredMembersList(tempMembersList);
    }
  };

  return (
    <div className="page" id="my-projects">
      <Header dataSets={dataSet} onSearch={searchMembers} />

      <h1 id="credits-title">Meet The LFG Team</h1>

      {/*runs through an array of all the members and creates a "card" for each one */}
      <div id="credit-members-container">
        {filteredMembersList.map(member => (
          <div className="lfg-contributor" key={member.name}>
            <img className="project-contributor-profile" src={member.photo} />
            <div className="project-contributor-info">
              <h2 className="team-member-name">{member.name}</h2>
              <p className="team-member-role">{member.role}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Credits;
