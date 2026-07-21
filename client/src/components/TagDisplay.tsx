import { Fragment, useMemo } from "react";
import { Tag as TagElement } from "./Tag";
import { Medium, Skill, Tag } from "@looking-for-group/shared";

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

export const tagToTagOrSkill = (tags: Tag[]): TagOrSkill[] => {
  return tags.map(
    (tag) => ({
      id: tag.tagId,
      label: tag.label,
      type: tag.type,
      category:
        tag.type === "Project Type" ? "Project Type" :
        tag.type === "Positions" ? "Positions" :
        tag.type === "Game Engine" ? "Game Engines" :
        tag.type === "Context" ? "Context" :
        tag.category,
    })
  );
}

export const skillToTagOrSkill = (skills: Skill[]): TagOrSkill[] => {
  return skills.map(
    skill => ({
      ...skill,
      id: skill.skillId,
      category: 
        skill.type === "Major" ? "Major" : 
        skill.type === "Role" ? "Role" : 
        skill.category === "Discipline" ? 
        `${skill.type} ${skill.category}` :
        skill.category,
    })
  );
}

export const mediumToTagOrSkill = (mediums: Medium[]): TagOrSkill[] => {
  return mediums.map(
    medium => ({
      label: medium.label,
      id: medium.mediumId,
      category: "Project Type",
      type: "Project Type",
    })
  );
}

const CatOrder: Record<string, number> = {
  //gaps made so you can easily add in between 
  "Project Type":           999,
  "Film/Video":             990,
  "Visual":                 980,
  "Story":                  960,
  "Game":                   940,
  "Music":                  920,
  "Context":                900,
  "Game Engines":           800,
  "Usage":                  720,
  "Field":                  700,
  "Maturity Rating":        620,
  "Triggers":               600,
  "Designer Discipline":    580,
  "Video Software":         560,
  "Design Software":        540,
  "Art and Animation":      520,
  "Photo Editing":          500,
  "Audio Discipline":       460,
  "DAW/Audio Editor":       440,
  "Middleware":             420,
  "Notation":               400,
  "Developer Discipline":   390,
  "Software":               380,
  "Coding Language":        360,
  "Framework":              340,
  "API":                    320,
  "Operating System":       310,
  "Game Engine":            300,
  "Team":                   240,
  "Personal":               220,
  "Soft Discipline":        200,
  "Engineer Discipline":    140,
  "Engineering Software":   120,
  "Hardware":               100,
  'Godot':                   24,
  'MonoGame':                23,
  'Twine':                   22,
  'Unity':                   21,
  'Unreal Engine':           20,
  "Discipline":              10,
  "Other":                    6,
  "Major":                    4,
  "Positions":                2,
  "Role":                     0,
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
  selected: TagOrSkill[][];
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

  const orderTags = (tags: TagOrSkill[][]): TagOrSkill[] => {
    let newTags: TagOrSkill[] = [];
    const SortedTags: TagOrSkill[][] = tags.toSorted((a, b) => {
        const catA = CatOrder[a[0].category];
        const catB = CatOrder[b[0].category];

        return catB - catA;
    });
    for (const array of SortedTags) {
      newTags = [...newTags, ...array];
    }

    return newTags;
  };

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

    tagsToDisplay = orderTags(filteredCategories);

    //only display category dividers if there are more than one categories
    const multipleCategories = foundCategories.length > 1;

    return tagsToDisplay.map((tag, index, array) => {
      //Because .includes doesn't work for some reason.
      //And not using every detail leads to false positives for reasons I can't comprehend.
      const selectedInclude = selected[0].some(
        t => t.id === tag.id && 
        t.label === tag.label && 
        t.category === tag.category && 
        t.type === tag.type);
      const selectedExlude = selected[1].some(
        t => t.id === tag.id && 
        t.label === tag.label && 
        t.category === tag.category && 
        t.type === tag.type);
      
      return  (
        <Fragment key={tag.type + tag.id}>
          {multipleCategories
            ? index === 0 || (array[index - 1]?.category != array[index]?.category) ? 
              <div id="tag-category-header">
                <p>
                  {array[index].category.includes("Discipline") && searchData.length === 0 ? 
                    "Discipline" : array[index].category}
                </p>
                <hr></hr>
              </div>
            : <></>
          : <></>}
          <TagElement
            type={tag.type.toLowerCase()}
            onClick={() => toggleTag(tag.id, tag.type)}
            selected={selectedInclude || selectedExlude}
          >
            <i className={selectedInclude ? "fa fa-check" : selectedExlude ? "fa fa-close" : "fa fa-plus"}></i>
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