import { useState } from 'react';
import { sortItems } from '../functions/itemSort';
import { tags } from '../constants/tags';
import { SearchBar } from './SearchBar';
import { interests } from '../constants/interests';
import { softSkills, hardSkills, proficiencies } from '../constants/skills';

// SPRING 26 NOTE: This component isn't used anywhere in the project.
// There are a handful of errors with it, but it's unused, so ¯\_(ツ)_/¯


//This component will contain a list of tag buttons that can be used to filter projects and profiles

//Things to fix:
//Search bar re-rendering not working correctly *
//Search queries longer than 2 characters not working
//selected tag list wiped upon using filter *
//Implement tag coloring *
//New repeating tags when using profile filter
//Implement size limit for tags' space

//create empty array, which will be filled with tags selected by user
//This needs to be placed outside the main component
//Placing it inside causes it to be reset whenever 'setUseState' in 'filter' is run
const selectedTags: string[] = [];

/**
 * Component for filtering projects or profiles using a list of tags.
 * Displays a search bar to filter tags and allows selecting multiple tags.
 * Selected tags can be used to filter datasets passed via the `setUseState` function.
 *
 * @param projectFilter - Boolean indicating whether to filter projects (true) or profiles (false)
 * @param setUseState - useState setter function to update the filtered dataset
 * @returns JSX element rendering the tag filter interface, including a search bar, tag list, and filter button
 */
export const TagFilter = ({ projectFilter, setUseState }) => {
  //Determine what we are filtering for; this tells what set of tags to use
  //create empty tag array to be filled based on this
  let tagsList: string[];
  //if projects...
  if (projectFilter) {
    //fill array using 'tags'
    tagsList = tags;
  } else {
    //if people...
    //fill array using 'softSkills', 'hardSkills', & 'proficiencies'
    tagsList = interests.concat(softSkills).concat(hardSkills).concat(proficiencies);
    /* for (let item of softSkills) {
      tagsList.push(item);
    }
    for (let item of hardSkills) {
      tagsList.push(item);
    }
    for (let item of proficiencies) {
      tagsList.push(item);
    } */
  }
  //create useState using this array; this will be used for 'tag searching' and modify display accordingly
  const [displayedTags, setDisplayedTags] = useState(tagsList);

  //tag search function
  //Runs whenever the input in the searchbar changes
  //takes in searchResults, which is the data filtered by the search function
  const tagSearch = (searchResults) => {
    //Get the 'correct' data out of the weird structuring of searchResults
    const realSearchResults = searchResults[0];
    //set displayedTags state
    setDisplayedTags(realSearchResults);
    //run through all selected tags & update their displays if present
    //setTimeout allows new data to be loaded first before updating based on selected tags
    setTimeout(() => {
      //First, find all 'selected' elements and change them to unselected displays
      const selectedTagElements = Array.from(document.getElementsByClassName('tag-filter-selected'));
      console.log(selectedTagElements);
      for (const element of selectedTagElements) {
        element.classList.toggle('tag-filter-selected');
      }
      //Then, see if any results are in the currently selected tags
      for (const result of realSearchResults) {
        //If the are...
        if (selectedTags.includes(result)) {
          //Update their displays to match
          const tagElement = document.getElementById(`tag-id-${result}`);
          console.log(tagElement);

          if(tagElement) tagElement.classList.toggle('tag-filter-selected');
          else console.log('error updating display');

        }
      }
    }, 1);
  };

  //toggle tag function
  //Runs when a tag item is clicked, either adds or removes tag from selected tag array
  //takes in a string representing the tag being selected
  const toggleTag = (e, tag: string) => {
    //First, check if tag is included in selected tag array
    //if the tag is not there...
    if (!selectedTags.includes(tag)) {
      //push the tag of the current selected tag in question
      selectedTags.push(tag);
    } else {
      //otherwise (if the tag IS there)...
      //remove the tag from the array
      selectedTags.splice(selectedTags.indexOf(tag), 1);
    }
    //In both cases, toggle the display of the tag in question to show it is selected
    //Undetermined on how to set up display functions yet, will save for later
    console.log(selectedTags);
    e.target.classList.toggle('tag-filter-selected');
  };

  //filter funciton
  //Also utilizes itemSort.tsx for sorting code (for now, ugh.)
  const filter = () => {
    //Passes in selected tag array to be run by sortItems
    const filteredData = sortItems(selectedTags, projectFilter);
    //Use returned data with the setUseState function passed into this component
    setUseState(filteredData); //May need adjustments due to same-name useState stuff
    //Additional stuff - if component is part of a popup or dropdown, have this function close it as well
  };

  //component HTML
  return (
    <>
      {/*Include searchbar component (check what searchbar needs to run correctly)*/}
      <SearchBar dataSets={[{ data: tagsList }]} onSearch={tagSearch} />

      <div id="tag-filter-list">
        {
          //For each item in the tag array...
          displayedTags.map((tag) => {
            //Create an element containing the name of the tag
            //Make it clickable, assign toggle tag function to it
            //If tag is already in selected tags...
            //Use selected tag classname
            //Otherwise...
            //Use unselected tag classname
            return (
              <div className={'tag-filter'} id={`tag-id-${tag}`} onClick={(e) => toggleTag(e, tag)}>
                {tag}
              </div>
            );
          })
        }
      </div>

      {/* Include filter button, which runs filter function */}
      <button onClick={filter}>Filter</button>
      <button onClick={() => console.log(selectedTags)}>show selected tags</button>
    </>
  );
};
