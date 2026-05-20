import { useMemo, useState, useCallback, ChangeEvent } from 'react';
import { Header } from '../Header';
import { members } from '../../constants/lfgmembers';

/**
 * Credits Page. List of all original team members for the project.
 * @returns JSX Element
 */
const Credits = () => {
  //SEARCHBAR FUNCTIONALITY

  // displayed data based on filter/search query
  const [filteredMembersList, setFilteredMembersList] = useState(members);
  const [searchQuery, setSearchQuery] = useState('');

  // Format data for use with SearchBar, which requires it to be: [{ data: }]
  const dataSet = useMemo(() => [{ data: members }], []);

  // Allows for the variable to update and display to the user
  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

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
      <Header 
        dataSets={dataSet} 
        onSearch={searchMembers} 
        value={searchQuery}
        onChange={handleSearchChange}
      />

      <h1 id="credits-title">Meet The LFG Team</h1>

      {/*runs through an array of all the members and creates a "card" for each one */}
      <main id="main" tabIndex={-1} aria-labelledby='credits-title'>
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {`Showing ${filteredMembersList.length} team ${filteredMembersList.length === 1 ? 'member' : 'members'}.`}
        </div>

        <ul id="credit-members-container">
          {filteredMembersList.map(member => (
            <li className="lfg-contributor" key={member.name}>
              <img 
                className="project-contributor-profile" 
                src={member.photo} 
                alt={`Profile photo of ${member.name}`}
              />
              <div className="project-contributor-info">
                <h2 className="team-member-name">{member.name}</h2>
                <p className="team-member-role">{member.role}</p>
              </div>
            </li>
          ))}
        </ul>
        
        {filteredMembersList.length === 0 && (
          <p className='no-members'>No team members found matching your search.</p>
        )}

      </main>
    </div>
  );
};

export default Credits;
