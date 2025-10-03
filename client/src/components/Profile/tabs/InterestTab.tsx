import { useState, useEffect, useMemo, useCallback } from 'react';
import { SearchBar } from '../../SearchBar';
import { interests } from '../../../constants/interests';
import { Tags } from '../../Tags';
import { ProfileData } from '../ProfileEditPopup'
//import { ThemeIcon } from '../../ThemeIcon';
import { Tag } from '@looking-for-group/shared';

export const InterestTab = (props: { profile: ProfileData}) => {
  // Initialize state with profile data 
  const [modifiedProfile, setModifiedProfile] = useState<ProfileData>(props.profile);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [filteredInterests, setFilteredInterests] = useState<string[]>(interests);
  const user = useMemo(() => props.profile, [props.profile]);
  const [noResults, setNoResults] = useState(false);

  useEffect(() => {
  // Force hidden state on initial render unless this is the active tab
  const element = document.getElementById('profile-editor-interests');
  if (element) {
    // Check if interests is the current active tab
    const isActive = document.querySelector(`#profile-tab-Interests.project-editor-tab-active`);
    if (!isActive) {
      element.classList.add('hidden');
    }
  }
}, []);

  // Update data when data is changed
  useEffect(() => {
    setModifiedProfile(props.profile);
    if (props.profile?.interests) {
      const interestStrings = props.profile.interests.map((i: Tag) => i.interest);  
      setSelectedInterests(interestStrings);
    }
  }, [props.profile]);
  
  // Initialize interests from user profile
  useEffect(() => {
    setFilteredInterests(interests);
  }, []);

  useEffect(() => {
    const interestInput = document.getElementById('profile-edit-interests') as HTMLInputElement;
    if (interestInput) {
      interestInput.value = selectedInterests.join(', ');
    }
  }, [selectedInterests]);

  // Safely generate interests list with null check
  /*const interestsList = user?.interests?.map((interest) => (
    <Tags key={interest}>{interest}</Tags>
  )) || [];*/

  // Toggle interest selection
  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  // Search function for the "edit interests" popup
  const Search = (results: Array<Array<{ name: string }>>) => {
    if (!results || results.length === 0) {
      //setTimeout to avoid crashing error
      // If no search results, show all interests  
      setNoResults(false); 
      setTimeout(() => setFilteredInterests(interests), 0);
      return;
    }
    // Filter interests based on search results
    const matchedInterests: string[] = results[0].map(result => result.name);
    matchedInterests.length === 0 ? setNoResults(true) : setNoResults(false);
    // setTimeout to avoid crashing error
    setTimeout(() => setFilteredInterests(matchedInterests), 0);
  };

  // Render selected interests with useMemo for performance
  const renderSelectedInterests = useMemo(() => {
    return selectedInterests.map(interest => (
        <button
            key={interest}
            className="tag-button interest-tag-button-blue-selected"
            onClick={() => toggleInterest(interest)}
        >
            <i className="fa fa-close"></i>
            &nbsp;{interest}
        </button>
    ));
  }, [selectedInterests]);

    // Save selected interests
    const saveInterests = async () => {
      try {
        // TODOS: Make an API call to save the interests
        
        // Close the popup after saving
        setShowPopup(false);
        
        // Update the displayed interests (if needed)
        
        console.log("Interests saved:", selectedInterests);
      } catch (error) {
        console.error("Failed to save interests:", error);
      }
    };

  // load interests from API
  /*useEffect(() => {
    const getInterests = async () => {
      try {
        const response = await getSkills();   <--- import getSkills from api/users.ts

        const interests = await response.json();
        const interestData = interests.data;

        if (interestData === undefined) {
          return;
        }
        setAllInterests(interestData);

      } catch (error) {
        console.error(error);
      }
    };
    if (allSkills.length === 0) {
      getSkills();
    }
  }, [allSkills]);*/

  
  return (
  <div id="profile-editor-interests" className="hidden">
        
        <div id="project-editor-selected-tags">
        <div className="project-editor-section-header">Selected Tags</div>
        <div className="project-editor-extra-info">
          Drag and drop to reorder
        </div>    
        <div id="project-editor-selected-tags-container">
          <hr id="selected-tag-divider" />
          {renderSelectedInterests}

        </div>
      </div>
      <div id="project-editor-tag-search">
          <SearchBar dataSets={[{ data: interests.map(interest => ({name: interest})) }]} 
          onSearch={Search} 
          />

          <h3>Available Interests:</h3>
          {noResults && <div className="no-results-message">No results found!</div>}
          <div id="profile-available-interests" className="interests-selection">
            {filteredInterests.map((interest) => (
              <button
                key={interest}
                type="button"
                className={`tag-button tag-button-blue-${selectedInterests.includes(interest) ? 'selected' : 'unselected'}`}
                onClick={(e) => { 
                    e.preventDefault(); // Prevent any default behavior
                    toggleInterest(interest)
                }}
              >
                <i className={selectedInterests.includes(interest) ? 'fa fa-remove' : 'fa fa-plus'}></i>
                &nbsp;{interest}
              </button>
            ))}
          </div>
          </div>
        </div>
  );
}