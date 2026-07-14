import { Fragment, useMemo } from "react";
import { Tag as TagElement } from "./Tag";

/** holds all the nesessary information for the tag or skill with shorter names 
 * @param label - the name of the tag/skill, and to be displayed
 * @param id - id of the tag/skill
 * @param type - the broader grouper, in a string format to allow for all type data types
 * @param category - the more specific grouper, in a string format to allow for all category data types
*/
type TagOrSkill = {
  label: string;
  id: number;
  type: string;
  category: string;
};

/** 
 * @param selected - an array of every tag/skill that has been selected
 * @param toggleTag - an external function to set the array of selected tags/skills, and whatever else may be needed
 * @param tabs - the possible types of tabs to be displayed, each one holding a category
 * @param tabId - Id of the current tab
 * @param all - an array of all possible tags/skills that could be displayed
 * @param searchValue - the value of the search bar present in the tag/skill menu
 * @param searchData - the returned array of tags/skills found by the search bar
*/
interface TagDisplayProps {
  selected: TagOrSkill[];
  toggleTag: (id: number, type: string) => void;
  tabs: string[];
  tabId: number;
  all: TagOrSkill[];
  searchValue: string;
  searchData: TagOrSkill[];
};

const TagDisplay: React.FC<TagDisplayProps> = ({ selected, toggleTag, tabs, tabId, all, searchValue, searchData }) => {
  //if the tabId is valid with the tabs array, filter them out, otherwise show everything
  const dataSet = useMemo(() => {
    if (tabId < tabs.length)
      return all.filter(tag => tag.type === tabs[tabId]);

    return all;
  }, [tabId, all, tabs]);

  // Creates button elements for all available tags in the current category tab, with appropriate styling for selected/unselected states.
  const renderTags = useMemo(() => {
    //The final list of tags displayed to the screen.
    let tagsToDisplay: TagOrSkill[] = [];
    let data: TagOrSkill[] = [];

    // if the user has searched
    if (searchValue !== "") {
      if (searchData?.length === 0 )
        return <div className="no-results-message">No results found!</div>;
      data = searchData;
    }
    else 
      data = dataSet;
    
    //seperate by category, then combine together to sort them by category
    let filteredCategories: TagOrSkill[][] = []; 
    let foundCategories: string[] = [];
    for (let tag of data) {
      if (!foundCategories.includes(tag.category)) {
        foundCategories.push(tag.category);
        filteredCategories.push(data.filter((allTag) => allTag.category === tag.category));
      }
    }
    for (let tags of filteredCategories) {
      tagsToDisplay = [...tagsToDisplay, ...tags]; 
    }

    //only display category dividers if there are more than one categories
    const multipleCategories = foundCategories.length > 1;

    return tagsToDisplay.map((tag, index, array) => {
      //Because .includes doesn't work for some reason.
      //And not using every detail leads to false positives for reasons I can't comprehend.
      const Selected = selected.findIndex(
        t => t.id === tag.id && 
        t.label === tag.label && 
        t.category === tag.category && 
        t.type === tag.type) !== -1;
      
      return  (
        <Fragment key={tag.type + tag.id}>
          {multipleCategories
            ? index === 0 || (array[index - 1]?.category != array[index]?.category) ? 
              <div id="tag-category-header">
                <p>{array[index].category == null ? "Medium" : array[index].category}</p>
                <hr></hr>
              </div>
            : <></>
          : <></>}
          <TagElement
            type={tag.type.toLowerCase()}
            onClick={() => toggleTag(tag.id, tag.type)}
            selected={Selected}
          >
            <i className={Selected ? "fa fa-check" : "fa fa-plus"}></i>
            <p>{tag.label}</p>
          </TagElement>
        </Fragment>
      );
    });
  }, [
    searchValue,
    searchData,
    tabId,
    selected,
    dataSet,
    toggleTag,
  ]);

  return <>{renderTags}</>;
}

export default TagDisplay;