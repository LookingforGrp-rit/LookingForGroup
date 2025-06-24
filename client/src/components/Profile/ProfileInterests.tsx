import { retry } from '@reduxjs/toolkit/query';
import { Tags } from '../Tags';
//import { PagePopup, openClosePopup } from '../PagePopup';
//import { SearchBar } from '../SearchBar';
//import { useState } from 'react';
//import { interests } from '../../constants/interests';
//import { ThemeIcon } from '../ThemeIcon';
//import { Tag } from '../Tags';
// import ChooseInterests from "../SignupProcess/ChooseInterests";

export const ProfileInterests = ({ user, isUsersProfile }) => {

  const testInterests = [
    { interest: 'Web Development' },
    { interest: 'Game Development' },
    { interest: 'AI and Machine Learning' },
  ]

  const testUser = {
    interests: testInterests
  };
  
  console.log("ProfileInterests component rendered with user:", user);
  console.log("Test user: ", testUser);
  console.log("ProfileInterests isUsersProfile:", isUsersProfile);
  console.log("ProfileInterests user interests:", user?.interests);

  const processInterests = () => {

    const interestsToProcess = user?.interests || testUser.interests;

    if (interestsToProcess || !Array.isArray(user.interests)) {
      console.log("User interests are not found or not an array.");
      return [];
    }

  // Process interests and log each one  
  const processedInterests = user.interests.map((interest, index) => {
    const interestValue = typeof interest === 'string' ? interest : interest.interest;
    console.log(`Processing interest at index ${index}:`, interestValue);
    return interestValue;
  }).filter(interest => interest && interest.trim() !== ''); // Filter out empty or undefined interests
  console.log("Processed interests:", processedInterests);
  return processedInterests;
};

  const interestValues = processInterests();
  console.log("Interest values:", interestValues);

  // Safely generate interests list with null check
  const interestsList = interestValues.map((interest, index) => {
    console.log(`ProfileInterests - Rendering interest tag ${index}:`, interest);
    return (
      <Tags key={`interest-${index}-${interest}`} className="profile-interest-tag">
        {interest}
      </Tags>
    );
  });

  console.log("Interests list length: ", interestsList.length);
  // Toggle interest selection
 /* const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter(i => i !== interest));
    } else if (selectedInterests.length < 4) {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  // Search function for the "edit interests" popup
  const Search = (results) => {
    // If no search results, show all interests
    if (!results || results.length === 0) {
      // setTimeout to avoid crashing error
      setTimeout(() => setFilteredInterests(interests), 0);
      return;
    }
    
    // Filter interests based on search results
    const matchedInterests = results[0];
    // setTimeout to avoid crashing error
    setTimeout(() => setFilteredInterests(matchedInterests), 0);
  };

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
  }; */

  return (
    <div id="profile-interests">
      
      <div className="profile-name-button">
        <h4>Interests</h4>
        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && (
          <small style={{ color: 'gray', fontSize: '0.8rem' }}>
            Debug: {interestValues.length} interests found
          </small>
        )}
      </div>

      <div id="profile-interests-list" className="profile-list">
        {interestsList.length > 0 ? ( interestsList ) : ( <p 
        style={{ 
            margin: '0', 
            padding: '0', 
            fontSize: '1rem',
            textAlign: 'left'
          }}>Sorry, no interests here</p>)}
      </div>

      {/* <PagePopup
        width={'80vw'}
        height={'80vh'}
        popupId={0}
        zIndex={3}
        show={showPopup}
        setShow={setShowPopup}
      >
        <div id="profile-edit-interests" className="profile-edit">
          <h1>Edit Interests</h1>
          <h3>Select 3 or 4 interests to be highlighted on your page</h3>
          <SearchBar dataSets={[{ data: interests }]} onSearch={Search} />

          <h3>Available Interests:</h3>
          <div id="profile-available-interests" className="interests-selection">
            {filteredInterests.map((interest) => (
              <button
                key={interest}
                className={`interest-tag ${selectedInterests.includes(interest) ? 'selected' : ''}`}
                onClick={() => toggleInterest(interest)}
                disabled={!selectedInterests.includes(interest) && selectedInterests.length >= 4}
              >
                {interest}
              </button>
            ))}
          </div>

          <h3>My Selected Interests: <span className="interest-count">({selectedInterests.length}/4)</span></h3>
          <div id="profile-edit-interests-list" className="profile-list">
            {selectedInterests.length > 0 ? 
              selectedInterests.map(interest => (
                <Tags key={interest} onClick={() => toggleInterest(interest)} className="selected-interest-tag">{interest}</Tags>
              ))
              : <p>No interests selected</p>
            }
          </div>

          <div className="button-row">
            <button className="save-btn" onClick={saveInterests}>Save</button>
            <button className="cancel-btn" onClick={() => setShowPopup(false)}>Cancel</button>
          </div>
        </div>
      </PagePopup> */}
    </div>
  );
};
