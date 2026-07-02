import React, { useState, Fragment, useEffect, useRef } from 'react';
import { Popup, PopupButton, PopupContent } from './Popup';
import { SearchBar } from './SearchBar';
import { ThemeIcon } from './ThemeIcon';
import { PeopleSkills, peopleTabs } from '../constants/tags';
import { getMajors, getJobTitles, getSkills } from '../api/users';
import { StringDictionary, Role, Major, Skill, SkillType } from '@looking-for-group/shared';

interface DiscoverFiltersProps {
    updateItemList: (skills: Skill[]) => void;
}

interface FilterTab {
    categoryName: string;
    color: string;
    categorySkills: Skill[];
}

interface EnabledFilter {
    skill: Skill;
    color: string;
}

export const DiscoverProfiles: React.FC<DiscoverFiltersProps> = ({ updateItemList }) => {
    // --------------------
    // Global variables
    // --------------------
    // All skills currently available in the active filter tab
    const [currentSkills, setCurrentSkills] = useState<Skill[]>([]);
    // Skills currently filtered via search input
    const [searchedSkills, setSearchedSkills] = useState<{ skills: Skill[], color: string }>({ skills: [], color: 'grey' });
    // Skills that are selected in the popup before applying
    const [enabledFilters, setEnabledFilters] = useState<EnabledFilter[]>([]);
    // Filters that have been applied and are displayed under the quick filter skills
    const [appliedFiltersDisplay, setAppliedFiltersDisplay] = useState<EnabledFilter[]>([]);
    // List of skill types to filter by with the horizontal quick filter
    const [activeSkillFilters, setActiveSkillFilters] = useState<Skill[]>([]);
    // Whether the "Applied Filters" section should display under the quick skills
    const [displayFiltersText, setDisplayFiltersText] = useState(false);
    //Keeps track of the currently selected tab in this popup.
    const [activeTabId, setActiveTabId] = useState(0);
    // Whether the popup is active; this effects popup filter arrows visibility
    const [activePopup, setActivePopup] = useState(false);


    // Dynamically show/hide arrows
    const skillFiltersRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    // Dynamically show/hide arrows for pop-up filters
    const popupSkillFiltersRef = useRef<HTMLDivElement>(null);
    const [showPopupLeftArrow, setShowPopupLeftArrow] = useState(false);
    const [showPopupRightArrow, setShowPopupRightArrow] = useState(false);


    // Formatted for SearchBar dataSets prop
    const [dataSet, setDataSet] = useState([{ data: currentSkills }]);

    // Horizontal quick filter skills, changes based on category
    const skillList = Object.values(PeopleSkills) as string[];

    // Tabs shown in the popup, dynamically created after fetching data
    const [filterPopupTabs, setFilterPopupTabs] = useState<FilterTab[]>([]);


    const getData = async () => {
        try {
            const response = await getSkills();
            const data: unknown[] = response.data as unknown[];

            // Get job titles and append it to full data
            const jobTitles = await getJobTitles();
            jobTitles.data?.forEach((job: Role) => data?.push({ label: job.label, type: 'Role' })); //does it need the types

            // Get majors and append it to full data
            const majors = await getMajors();
            majors.data?.forEach((major: Major) => data?.push({ label: major.label, type: 'Major' }));

            // Construct the finalized version of the data to be moved into filterPopupTabs
            const tabs = JSON.parse(JSON.stringify(peopleTabs));
            Object.values(tabs).forEach((tab: any) => tab.categorySkills = tab.categorySkills || []);

            // Map skill types to correct tab categories
            const typeMap: StringDictionary<string> = {
                Designer: 'Designer Skill',
                Developer: 'Developer Skill',
                Soft: 'Soft Skill',
                Audio: 'Audio Skill',
                Engineer: 'Engineer Skill',
                Role: 'Role',
                Major: 'Major',
            };

            const skillData: Skill[] = data as Skill[];

            skillData?.forEach((s: Skill) => {
                const filterSkill: Skill = { ...s };
                const mappedType = typeMap[s.type] || s.type;

                if (tabs[mappedType]) {
                    tabs[mappedType].categorySkills.push(filterSkill);
                }
            });

            setFilterPopupTabs(Object.values(tabs));

        }
        catch (error) {
            console.error('Error fetching skills:', error);
        }
    };

    /**
     * Toggles a skill's selection in the horizontal quick filter.
     * Updates visual selection and parent dataset.
     * @param event Click event
     * @param skill Skill object clicked
     */
    const toggleSkill = (event: any, skill: Skill) => {
        let newActiveSkills: Skill[];

        if (activeSkillFilters.some(s => s.label === skill.label)) {
            // Remove the skill from the active list
            newActiveSkills = activeSkillFilters.filter(s => s.label !== skill.label);
            event.currentTarget.classList.remove('discover-tag-filter-selected');
        } else {
            // Add the tag to the active list
            newActiveSkills = [...activeSkillFilters, skill];
            event.currentTarget.classList.add('discover-tag-filter-selected');
        }

        setActiveSkillFilters(newActiveSkills);
        updateItemList(newActiveSkills);
    };

    /**
    * Checks the scroll position and container width to determine if 
    * there is more content to the left or right.
    */
    const checkScrollVisibility = () => {
        if (skillFiltersRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = skillFiltersRef.current;

            setShowLeftArrow(scrollLeft > 0);
            setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1);
        }
    };

    /**
    * === For Popup Filters ===
    * Checks the scroll position and container width to determine if 
    * there is more content to the left or right.
    */
    const checkPopupScrollVisibility = () => {
        if (popupSkillFiltersRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = popupSkillFiltersRef.current;

            setShowPopupLeftArrow(scrollLeft > 0);
            setShowPopupRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1);
        }
    };

    /**
     * Scrolls horizontal skill list left or right.
     * Hides or shows scroll buttons depending on edge conditions.
     */
    const scrollSkills = (direction: string) => {
        if (skillFiltersRef.current) {
            // 80% of width. Feel free to fiddle with
            const scrollAmt = skillFiltersRef.current.clientWidth * 0.8;

            if (direction === 'left') {
                skillFiltersRef.current.scrollBy({ left: -scrollAmt, behavior: 'smooth' });
            } else if (direction === 'right') {
                skillFiltersRef.current.scrollBy({ left: scrollAmt, behavior: 'smooth' });
            }
        }
    };

    /** === For Popup Filters ===
     * Scrolls horizontal skill list left or right.
     * Hides or shows scroll buttons depending on edge conditions.
     */
    const popupScrollSkills = (direction: string) => {
        if (popupSkillFiltersRef.current) {
            // 80% of width. Feel free to fiddle with
            const scrollAmt = popupSkillFiltersRef.current.clientWidth * 0.8;

            if (direction === 'left') {
                popupSkillFiltersRef.current.scrollBy({ left: -scrollAmt, behavior: 'smooth' });
            } else if (direction === 'right') {
                popupSkillFiltersRef.current.scrollBy({ left: scrollAmt, behavior: 'smooth' });
            }
        }
    };

    /**
    * Initializes popup filters to the first tab. Also,
    * sets the popup as active, which triggers popup filter arrow visiblity.
    */
    const setupFilters = () => {
        // Defaults to the first available tab
        //if (filterPopupTabs.length > 0) {
        //  const currentTab = filterPopupTabs[activeTabId];
        //  setCurrentSkills(currentTab.categorySkills);
        //  setDataSet([{ data: currentTab.categorySkills }]);
        //  setSearchedSkills({
        //    skills: currentTab.categorySkills,
        //    color: currentTab.color,
        //  });
        //}
        setActivePopup(true);

        // loads in current filters
        const seeded: EnabledFilter[] = activeSkillFilters.map((skill) => {
            const tab = filterPopupTabs.find((t) =>
                t.categorySkills.some((ct) => ct.type === skill.type)
            );
            return { skill, color: tab?.color ?? 'grey' };
        });
        setEnabledFilters(seeded);
    };

    /**
     * Checks if a skill is currently enabled in the popup filters.
     */
    const isSkillEnabled = (skill: Skill, color: string) => {
        return enabledFilters.findIndex(f => f.skill === skill && f.color === color);
    };

    // Trigger initial data fetch
    useEffect(() => {
        getData();
    }, []);

    //Displays the correct tabs depending on the value of activeTabId.
    useEffect(() => {
        if (filterPopupTabs[activeTabId]) {
            const currentTab = filterPopupTabs[activeTabId];
            setCurrentSkills(currentTab.categorySkills);
            setDataSet([{ data: currentTab.categorySkills }]);
            setSearchedSkills({ skills: currentTab.categorySkills, color: currentTab.color });
        }
    }, [activeTabId, filterPopupTabs]);

    // Checks arrow visibility when filters popup loads
    useEffect(() => {
        checkPopupScrollVisibility();
    }, [activePopup]);

    // Check arrow visibility on resize, mount, and data changes
    useEffect(() => {
        checkScrollVisibility(); // initial
        checkPopupScrollVisibility();

        let windowTimeout: NodeJS.Timeout;
        let popupTimeout: NodeJS.Timeout;
        const handleResize = () => {
            clearTimeout(windowTimeout);
            clearTimeout(popupTimeout);
            windowTimeout = setTimeout(checkScrollVisibility, 150);
            popupTimeout = setTimeout(checkPopupScrollVisibility, 150);

        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

      // --------------------
      // Component
      // --------------------
      let skillsToDisplay = searchedSkills.skills;
      let currentTabName = filterPopupTabs[activeTabId]?.categoryName;
      let discipline;

      switch (currentTabName){
        case "Developer Skill":
          //Developer
          discipline = searchedSkills.skills.filter((tag) => (tag as Skill).category === "Discipline");
          let software = searchedSkills.skills.filter((tag) => (tag as Skill).category === "Software");
          let codingLanguage = searchedSkills.skills.filter((tag) => (tag as Skill).category === "Coding Language");
          let framework = searchedSkills.skills.filter((tag) => (tag as Skill).category === "Framework");
          let api = searchedSkills.skills.filter((tag) => (tag as Skill).category === "API");
          let operatingSystem = searchedSkills.skills.filter((tag) => (tag as Skill).category === "Operating System");
          let gameEngine = searchedSkills.skills.filter((tag) => (tag as Skill).category === "Game Engine");
          skillsToDisplay = discipline.concat(software, codingLanguage, framework, api, operatingSystem, gameEngine);
          break;
        case "Designer Skill":
          //Designer
          discipline = searchedSkills.skills.filter((tag) => (tag as Skill).category === "Discipline");
          let videoSoftware = searchedSkills.skills.filter((tag) => (tag as Skill).category === "Video Software");
          let designSoftware = searchedSkills.skills.filter((tag) => (tag as Skill).category === "Design Software");
          let artAnimation = searchedSkills.skills.filter((tag) => (tag as Skill).category === "Art and Animation");
          let photoEditing = searchedSkills.skills.filter((tag) => (tag as Skill).category === "Photo Editing");
          skillsToDisplay = discipline.concat(videoSoftware, designSoftware, artAnimation, photoEditing);
          break;
        case "Soft Skill":
          //Soft
          discipline = searchedSkills.skills.filter((tag) => (tag as Skill).category === "Discipline");
          let team = searchedSkills.skills.filter((tag) => (tag as Skill).category === "Team");
          let personal = searchedSkills.skills.filter((tag) => (tag as Skill).category === "Personal");
          skillsToDisplay = discipline.concat(team, personal);
          break;
        case "Audio Skill":
          //Audio
          discipline = searchedSkills.skills.filter((tag) => (tag as Skill).category === "Discipline");
          let dawAudioEditor = searchedSkills.skills.filter((tag) => (tag as Skill).category === "DAW/Audio Editor");
          let middleware = searchedSkills.skills.filter((tag) => (tag as Skill).category === "Middleware");
          let notation = searchedSkills.skills.filter((tag) => (tag as Skill).category === "Notation");
          skillsToDisplay = discipline.concat(dawAudioEditor, middleware, notation);
          break;
        case "Engineer Skill":
          //Engineer
          discipline = searchedSkills.skills.filter((tag) => (tag as Skill).category === "Discipline");
          let engineeringSoftware = searchedSkills.skills.filter((tag) => (tag as Skill).category === "Engineering Software");
          let hardware = searchedSkills.skills.filter((tag) => (tag as Skill).category === "Hardware");
          skillsToDisplay = discipline.concat(engineeringSoftware, hardware);
          break;
      }

      return (
        <>
          <div id="discover-filters-parent">
            <div id="discover-filters">
              <button
                id="filters-left-scroll"
                className={`filters-scroller ${!showLeftArrow ? 'hide' : ''}`}
                onClick={() => scrollSkills('left')}
              >
                <i className="fa fa-caret-left"></i>
              </button>
              <div
                id="discover-tag-filters"
                tabIndex={-1}
                ref={skillFiltersRef}
                onScroll={checkScrollVisibility}
              >
                { /* make each skill button have proper label & type */}
                {skillList.map(skillFilterType => {
                  const trueType = Object.keys(PeopleSkills)[Object.values(PeopleSkills).indexOf(skillFilterType)]
                  //template skill to be sent in for the broad horizontal filters
                  const templateSkill = {
                    skillId: 0,
                    label: trueType,
                    type: trueType as SkillType,
                    category: 'Other',
                  } as Skill;

                  return (
                    <button key={`${templateSkill.type}-${skillFilterType}`}
                      className="discover-tag-filter"
                      data-type={templateSkill.label}
                      onClick={(e) => toggleSkill(e, templateSkill)}>
                      {skillFilterType}
                    </button>
                  )
                })}
              </div>
              {/* Container so more filters popup is aligned at the end */}
              <div id="discover-more-filters-container">
    
                {/* === Additional filters popup === */}
                <Popup>
                  <PopupButton buttonId={'discover-more-filters'} callback={setupFilters}>
                    <ThemeIcon id={'filter'} width={30} height={31} className={'color-fill color-stroke'} ariaLabel={'more filters'} />
                  </PopupButton>
                  {/* 
                                When page loads, get all necessary skill lists based on page category.
                                Place these lists in an array, along with an identifier for which column 
                                Displayed skills are determined using a state variable, changable w/ searchbar.
                                Skills have an onClick function that adds their skill to a full skill list. 
                                Full skill list is only applied when hitting done, which then pushes the 
                                info to an active list.
                            */}
                  <PopupContent useClose={false}>
                    {/* Close Button */}
                    <PopupButton className="popup-close">
                      <img alt="close" src="/src/icons/cancel.png" onClick={() => { setActivePopup(false); }}></img>
                    </PopupButton>
                    <div id="filters-popup">
                      <h2>{'People Filters'}</h2>
                      <div id="filters" className="popup-section">
                        <SearchBar
                          dataSets={dataSet}
                          onSearch={(results) => {
                            setSearchedSkills({ skills: results[0] as Skill[], color: searchedSkills.color });
                          }}
                        ></SearchBar>
                        <div id="more-filters-scroll-container">
                          <button
                            id="popup-filters-left-scroll"
                            className={`more-filters-scroller ${!showPopupLeftArrow ? 'hide' : ''}`}
                            onClick={() => popupScrollSkills('left')}
                          >
                            <i className="fa fa-caret-left"></i>
                          </button>
                          <div id="filter-tabs"
                            tabIndex={-1}
                            ref={popupSkillFiltersRef}
                            onScroll={checkPopupScrollVisibility}
                          >
                            {filterPopupTabs.map((tab, index) => (
                              <a
                                key={`${tab.categoryName}-${index}`}
                                className={`filter-tab ${index === activeTabId ? 'selected' : ''}`}
                                onClick={() => {
                                  //const element = e.target as HTMLElement;
    
                                  //// Remove .selected from all 3 options, add it only to current button
                                  //const tabs = document.querySelector('#filter-tabs')!.children;
                                  //for (let i = 0; i < tabs.length; i++) {
                                  //  tabs[i].classList.remove('selected');
                                  //}
                                  //element.classList.add('selected');
    
                                  //Sets the index to the setActiveId value.
                                  setActiveTabId(index);
                                }}
                              >
                                {tab.categoryName}
                              </a>
                            ))}
                          </div>
                          <button
                            id="popup-filters-right-scroll"
                            className={`more-filters-scroller ${!showPopupRightArrow ? 'hide' : ''}`}
                            onClick={() => popupScrollSkills('right')}
                          >
                            <i className="fa fa-caret-right"></i>
                          </button>
                        </div>
                        <hr />
                        <div id="filter-tags">
                          {searchedSkills.skills.length === 0 ? (
                            <p>No skills found. Please try a different search term.</p>
                          ) : (
                            skillsToDisplay.map((skill, index, array) => (
                              <Fragment key={`${skill.label}-${skill.type}`}>
                              {(index === 0 || (array[index - 1].category != array[index].category)) && array[index].category != null
                              ? <div id="tag-category-header">
                                  <p>{array[index].category}</p>
                                  <hr></hr>
                                </div>
                              : <></>}
                              <button
                                key={`${skill.label}-${skill.type}`}
                                // className={`skill-button skill-button-${searchedSkills.color}-unselected`}
                                className={`tag-button tag-button-${searchedSkills.color}-${isSkillEnabled(skill, searchedSkills.color) !== -1 ? 'selected' : 'unselected'}`}
                                onClick={(e) => {
                                  const element = e.target as HTMLElement;
                                  const selectIndex = isSkillEnabled(skill, searchedSkills.color);
                                  const tempEnabled = enabledFilters;
    
                                  //if (tag.type === 'Project Type' || tag.type === 'Purpose' || tag.type === 'Role' || tag.type === 'Major') {
                                  //  // Remove all other tags of the same type except the one selected
                                  //  const filterSkills = document.querySelector('#filter-tags')!;
                                  //  const tagList: HTMLCollectionOf<HTMLElement> = filterSkills.getElementsByClassName(`tag-button-${searchedSkills.color}-selected`) as HTMLCollectionOf<HTMLElement>;
    //
                                  //  for (let i = 0; i < tagList.length; i++) {
                                  //    const tagObj: Skill = { label: tagList[i].innerText.trim(), type: tag.type, tagId: -1 };
                                  //    const tagTypeIndex = isSkillEnabled(tagObj, searchedSkills.color);
    //
                                  //    if (tagList[i].innerText.trim() !== tag.label) {
                                  //      tagList[i].classList.replace(
                                  //        `tag-button-${searchedSkills.color}-selected`,
                                  //        `tag-button-${searchedSkills.color}-unselected`
                                  //      );
    //
                                  //      tempEnabled = tempEnabled.toSpliced(tagTypeIndex, 1);
                                  //    }
                                  //  }
                                  //}
    
                                  if (selectIndex === -1) {
                                    // Creates an object to store text and category
                                    //setEnabledFilters([...enabledFilters, { tag, color: searchedSkills.color }]);
                                    setEnabledFilters([
                                      ...tempEnabled,
                                      { skill, color: searchedSkills.color },
                                    ]);
                                    element.classList.replace(
                                      `tag-button-${searchedSkills.color}-unselected`,
                                      `tag-button-${searchedSkills.color}-selected`
                                    );
                                  } else {
                                    // Remove tag from list of enabled filters
                                    setEnabledFilters(tempEnabled.toSpliced(selectIndex, 1));
                                    element.classList.replace(
                                      `tag-button-${searchedSkills.color}-selected`,
                                      `tag-button-${searchedSkills.color}-unselected`
                                    );
                                  }
                                }}
                              >
                                <i
                                  className={
                                    isSkillEnabled(skill, searchedSkills.color) !== -1
                                      ? 'fa fa-check'
                                      : 'fa fa-plus'
                                  }
                                ></i>
                                <p>{skill.label}</p>
                              </button>
                              </Fragment>
                            ))
                          )}
                        </div>
                      </div>
                      <div id="selected-section" className="popup-section">
                        <h3>Selected</h3>
                        <h4>Click to deselect</h4>
                        <div id="selected-filters">
                          {enabledFilters.map((skill) => (
                            <button
                              key={`${skill.skill.label}-${skill.color}`}
                              className={`tag-button tag-button-${skill.color}-selected`}
                              onClick={() => {
                                // Remove skill from list of enabled filters, re-rendering component
                                setEnabledFilters(
                                  enabledFilters.toSpliced(isSkillEnabled(skill.skill, skill.color), 1)
                                );
                              }}
                            >
                              <i className="fa fa-close"></i>
                              <p>{skill.skill.label}</p>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div id="filters-btns-section">
                        {/* Reset Filters button */}
                        <PopupButton
                          className={'delete-button'}
                          doNotClose={() => true}
                          callback={() => {
                            // Reset skill filters before adding results in
                        
                            // Clears all active filters
                            setEnabledFilters([]);
                            const newActiveSkills = enabledFilters.map(f => f.skill);
                            setActiveSkillFilters(newActiveSkills);
                            const discoverFilters = document.getElementsByClassName('discover-tag-filter');
                        
                            // Remove any/all other clicked discover tags
                            for (let i = 0; i < discoverFilters.length; i++) {
                              discoverFilters[i].classList.remove('discover-tag-filter-selected');
                            }
                        
                            // Sets active filters displayed to "none" 
                            setAppliedFiltersDisplay(enabledFilters);
                        
                            //Add "Applied Filters" div if it is missing and if the paragraph exists
                            if (newActiveSkills.length > 0) {
                              setDisplayFiltersText(newActiveSkills.some(skill => skill.type !== 'Designer'));
                            }
                          }}
                        >
                          Reset Filters
                        </PopupButton>
                        <PopupButton
                          buttonId={'primary-btn'}
                          callback={() => {
                            // Reset skill filters before adding results in
                            const newActiveSkills = enabledFilters.map(f => f.skill)
                            setActiveSkillFilters(newActiveSkills);
                            const discoverFilters = document.getElementsByClassName('discover-tag-filter');
                          
                            // Remove any/all other clicked discover tags
                            for (let i = 0; i < discoverFilters.length; i++) {
                              discoverFilters[i].classList.remove('discover-tag-filter-selected');
                            }
                          
                            // enabledFilters.forEach((filter) => {
                            
                            //   // Check if any enabled filters match a discover tag, and visually toggle it
                            //   // If the filter has a tag_id, it's either a Skill or a Skill, and not a Project Type
                            //   // Available for selection on the discover filters page
                            //   if (filter.skill.type === 'Project Type') {
                            //     for (let i = 0; i < discoverFilters.length; i++) {
                            //       if (discoverFilters[i].innerHTML.toLowerCase() === filter.tag.label.toLowerCase()) {
                            //         discoverFilters[i].classList.add('discover-tag-filter-selected');
                            //       }
                            //     }
                            //   }
                            // });
                          
                            setAppliedFiltersDisplay(enabledFilters);
                          
                            // Update the project list
                            updateItemList(newActiveSkills);
                          
                            //Add "Applied Filters" div if it is missing and if the paragraph exists
                            if (newActiveSkills.length > 0) {
                              setDisplayFiltersText(newActiveSkills.some(skill => skill.type !== 'Designer'));
                            }
                          }}
                        >
                          Apply
                        </PopupButton>
                      </div>
                    </div>
                  </PopupContent>
                </Popup>
              </div>
              <button
                id="filters-right-scroll"
                className={`filters-scroller ${!showRightArrow ? 'hide' : ''}`}
                onClick={() => scrollSkills('right')}
              >
                <i className="fa fa-caret-right"></i>
              </button>
            </div >
            {((appliedFiltersDisplay.length > 0) && (displayFiltersText)) ? (
              <div className='applied-filters'>
                <p>Applied Filters:</p>
                {appliedFiltersDisplay.map((filter, index) => {
                  if (filter.skill.type === 'Designer') {
                    return <Fragment key={`${filter.skill.type}`} />;
                  }
    
                  return (
                    <button
                      key={filter.skill.label}
                      className={`tag-button tag-button-${filter.color}-selected`}
                      onClick={() => {
    
                        // Remove skill from list of enabled filters, re-rendering component
                        const tempList = appliedFiltersDisplay.toSpliced(index, 1);
                        const newActiveSkills = tempList.map((filter) => filter.skill);
                        setAppliedFiltersDisplay(tempList);
                        setActiveSkillFilters(newActiveSkills);
                        updateItemList(newActiveSkills);
    
                        if (newActiveSkills.length === 0 || (newActiveSkills.length === 1 && newActiveSkills[0].label === 'Filter')) {
                          setDisplayFiltersText(false);
                        } else {
                          setDisplayFiltersText(true);
                        }
                      }}
                    >
                      <i className='fa fa-close'></i>
                      <p>{filter.skill.label}</p>
                    </button>
                  );
                })}
              </div>
            ) : (
              <></>
            )}
          </div>
        </>
      );
}