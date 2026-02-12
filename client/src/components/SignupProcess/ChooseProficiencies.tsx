/*
import React, { useState, useEffect } from 'react';

//--------------------------------------------------------------------
///\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\

//UNUSED CURRENTLY
//CHOOSING PROFICIENCIES IS NOW PART OF CHOOSE SKILLS

///\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\/\
//--------------------------------------------------------------------

// list of proficiencies to choose from
const proficiencies = [
  'Full Stack Developer',
  'Front End Developer',
  'Back End Developer',
  'UI/UX Designer',
  'Graphic Designer',
  'Graphic Artist',
  'Game Developer',
  'Game Designer',
  'Web Designer',
  'Web Editor',
  'Product Designer',
  'Mobile Developer',
  'Software Developer',
  'Cloud Developer',
  'Database Developer',
  'PHP Developer',
  'BlockChain Developer',
  'AR/VR Developer',
  'IT',
  'Mentor',
];

//
// Choose top 3 proficiencies component
//
const ChooseProficiencies = ({
  show,
  onNext,
  onBack,
  selectedProficiencies,
  setSelectedProficiencies,
}) => {
  // Function to handle the proficiency selection
  const handleProficienciesSelect = (proficiency) => {
    // get the proficiency that was selected
    const selected = proficiency.target.innerHTML;

    // if the proficiency is already selected, remove it from the selectedProficiencies array
    if (selectedProficiencies.includes(selected)) {
      setSelectedProficiencies(selectedProficiencies.filter((prof) => prof !== selected));
    }
    // else if the selectedProficiencies array has less than 3 elements, add the proficiency to the selectedProficiencies array
    else if (selectedProficiencies.length < 3) {
      setSelectedProficiencies([...selectedProficiencies, selected]);
    }
  };

  // if the modal is not shown, return null
  if (!show) {
    return null;
  }

  // render the page
  return (
    <div className="signupProcess-background">
      <div className="signupProcess-modal">
        <div className="ChooseProficiencies">
          <h1 id="signupProcess-title">Choose Your Top 3 Proficiencies</h1>
          <p>You can add more and edit later</p>

          <div id="proficiency-select">
            //{ map through the proficiencies array and create a button for each proficiency }
            {proficiencies.map((proficiency, index) => (
              <button
                key={index}
                value={proficiency}
                onClick={handleProficienciesSelect}
                // add the 'active' class to the buttons that were selected
                // doing this inside className so that it's remembered when the user goes back and forth between modals
                className={`proficiencyBtn ${selectedProficiencies.includes(proficiency) ? 'active' : ''}`}
              >
                {proficiency}
              </button>
            ))}
          </div>
          <div id="signupProcess-btns">
            <button id="signup-backBtn" onClick={onBack}>
              Back
            </button>
            <button
              id="signup-nextBtn"
              onClick={onNext}
              // disable the next button if the user has not selected 3 proficiencies
              // this is to prevent the user from moving to the next modal without selecting the required number of proficiencies
              // the user can only move to the next modal when they have selected 3 proficiencies
              disabled={selectedProficiencies.length !== 3}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChooseProficiencies;
*/
