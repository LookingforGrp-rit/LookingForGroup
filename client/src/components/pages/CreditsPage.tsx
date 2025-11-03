import { useMemo, useState, useCallback } from 'react';
import { Header } from '../Header';
import { members } from '../../constants/lfgmembers';

const Credits = () => {
  //SEARCHBAR FUNCTIONALITY

  // displayed data based on filter/search query
  const [filteredMembersList, setFilteredMembersList] = useState(members);

  // Format data for use with SearchBar, which requires it to be: [{ data: }]
  const dataSet = useMemo(() => [{ data: members }], []);

  // Updates filtered members list with new search info
  const searchMembers = useCallback((searchResults: any[][]) => {
    if (!searchResults || !Array.isArray(searchResults)) return;
    
    // Flatten the nested arrays
    const flattened = searchResults.flat();

    // Prevent unnecessary state updates if results haven't changed
    setFilteredMembersList((prev) => {
      const prevNames = prev.map((m) => m.name).join(',');
      const newNames = flattened.map((m) => m.name).join(',');
      if (prevNames === newNames) return prev;
      return flattened;
    });
  }, []);

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
