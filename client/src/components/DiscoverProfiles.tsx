import React, { useState, Fragment, useEffect, useRef } from 'react';
import { Popup, PopupButton, PopupContent } from './Popup';
import { SearchBar } from './SearchBar';
import { PeopleSkills, peopleTabs } from '../constants/tags';
import { getMajors, getJobTitles, getSkills } from '../api/users';
import { StringDictionary, Role, Major, Skill, SkillType } from '@looking-for-group/shared';
import MoreFiltersButton from './MoreFiltersButton';
import { Tag } from './Tag';
import TagDisplay from './TagDisplay';
import { Select, SelectButton, SelectOptions } from './Select';

interface DiscoverFiltersProps {
  updateItemList: (skills: Skill[], excludeSkills: Skill[], filterMode: "Match All" | "Match Any", sortMode: sortModes) => void;
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

enum sortModes {
  "A-Z" = "A-Z",
  "Z-A" = "Z-A",
  "Newest" = "Newest",
  "Oldest" = "Oldest",
  "Followers" = "Followers",
  "Followers Ascending" = "Followers Ascending",
}

export const DiscoverProfiles: React.FC<DiscoverFiltersProps> = ({ updateItemList }) => {
  // --------------------
  // Global variables
  // --------------------
  // Skills currently filtered via search input
  const [searchedSkills, setSearchedSkills] = useState<Skill[]>([]);
  // Filters that have been applied and are displayed under the quick filter skills
  const [appliedFiltersDisplay, setAppliedFiltersDisplay] = useState<EnabledFilter[]>([]);
  // List of skill types to filter by with the horizontal quick filter
  const [activeSkillFilters, setActiveSkillFilters] = useState<Skill[]>([]);
  const [activeExclusionFilters, setActiveExclusionFilters] = useState<Skill[]>([]);
  // Whether the "Applied Filters" section should display under the quick skills
  const [displayFiltersText, setDisplayFiltersText] = useState(false);
  //Keeps track of the currently selected tab in this popup.
  const [activeTabId, setActiveTabId] = useState(0);
  // Whether the popup is active; this effects popup filter arrows visibility
  const [activePopup, setActivePopup] = useState(false);

  const [allSkills, setAllSkills] = useState<Skill[]>([]);
  const [searchValue, setSearchValue] = useState("");

  // Dynamically show/hide arrows
  const skillFiltersRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Dynamically show/hide arrows for pop-up filters
  const popupSkillFiltersRef = useRef<HTMLDivElement>(null);
  const [showPopupLeftArrow, setShowPopupLeftArrow] = useState(false);
  const [showPopupRightArrow, setShowPopupRightArrow] = useState(false);

  // Horizontal quick filter skills, changes based on category
  const skillList = Object.values(PeopleSkills) as string[];

  // Tabs shown in the popup, dynamically created after fetching data
  const [filterPopupTabs, setFilterPopupTabs] = useState<FilterTab[]>([]);

  const [filterMode, setFilterMode] = useState<"Match All" | "Match Any">("Match All");
  const [sortMode, setSortMode] = useState<sortModes>(sortModes.Newest);

  const getData = async () => {
    try {
      const response = await getSkills();
      const data: unknown[] = response.data as unknown[];

      // Get job titles and append it to full data
      const jobTitles = await getJobTitles();
      jobTitles.data?.forEach((job: Role) => data?.push({ label: job.label, skillId: job.roleId, type: 'Role', category: "Other" } as Skill)); //does it need the types

      // Get majors and append it to full data
      const majors = await getMajors();
      majors.data?.forEach((major: Major) => data?.push({ label: major.label, skillId: major.majorId, type: 'Major', category: "Other" } as Skill));

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

      if (data) setAllSkills(data as Skill[]);

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
  const toggleSkill = (id: number, type: string, update?: boolean) => {
    let newActiveSkills: Skill[];
    let newExcludeSkills: Skill[];
    let skill: Skill | undefined;
    if (id === -1) {
      skill = { skillId: id, label: type, type: type as SkillType, category: "Other" }
    }
    else
      skill = allSkills.find(s => s.skillId === id && s.type === type);
    if (!skill) return;

    if (activeSkillFilters.some(s => s.skillId === id && s.type === type)) {
      // Remove the skill from the active list
      newActiveSkills = activeSkillFilters.filter(s => s !== skill);
      newExcludeSkills = [...activeExclusionFilters, skill];
    }
    else if (activeExclusionFilters.some(s => s.skillId === id && s.type === type)) {
      newActiveSkills = activeSkillFilters;
      newExcludeSkills = activeExclusionFilters.filter(s => s !== skill);
    }
    else {
      // Add the tag to the active list
      newActiveSkills = [...activeSkillFilters, skill];
      newExcludeSkills = activeExclusionFilters;
    }

    setActiveSkillFilters(newActiveSkills);
    setActiveExclusionFilters(newExcludeSkills);
    if (update) updateItemList(newActiveSkills, newExcludeSkills, filterMode, sortMode);
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
  };

  // Trigger initial data fetch
  useEffect(() => {
    getData();
  }, []);

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

  return (
    <>
      <div id="discover-filters-parent">
        <div id="discover-filters">
          <button
            id="filters-left-scroll"
            className={`filters-scroller ${!showLeftArrow ? 'hide' : ''}`}
            onClick={() => scrollSkills('left')}
            value={'left'}
            aria-label='scroll left'
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
                skillId: -1,
                label: trueType,
                type: trueType as SkillType,
                category: 'Other',
              } as Skill;

              return (
                <button key={`${templateSkill.type}-${skillFilterType}`}
                  className={"discover-tag-filter" +
                    (activeSkillFilters.some(s => s.skillId === -1 && s.label === trueType) ? " discover-tag-filter-selected" :
                      activeExclusionFilters.some(s => s.skillId === -1 && s.label === trueType) ? " discover-tag-filter-excluded " :
                        "")}
                  data-type={templateSkill.label}
                  onClick={() => toggleSkill(templateSkill.skillId, templateSkill.type, true)}>
                  {skillFilterType}
                </button>
              )
            })}
          </div>
          <button
            id="filters-right-scroll"
            className={`filters-scroller ${!showRightArrow ? 'hide' : ''}`}
            onClick={() => scrollSkills('right')}
            value={'right'}
            aria-label='scroll right'
          >
            <i className="fa fa-caret-right"></i>
          </button>
          {/* Container so more filters popup is aligned at the end */}
          <div id="discover-more-filters-container">

            {/* === Additional filters popup === */}
            <Popup>
              <PopupButton buttonId={'discover-more-filters'} callback={setupFilters}>
                <MoreFiltersButton />
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
                  <img alt="close" src="/images/icons/cancel.png" onClick={() => { setActivePopup(false); }}></img>
                </PopupButton>
                <div id="filters-popup">
                  <h2>{'People Filters'}</h2>
                  <div id='filter-settings'>
                    <button id='match-button'
                      onClick={() => {
                        setFilterMode(filterMode === "Match All" ? "Match Any" : "Match All");
                      }}>
                      {filterMode}
                    </button>
                    <Select>
                      <SelectButton buttonId='sort-button'
                        placeholder="Sorting Mode"
                        type={"input"}
                        initialVal={sortMode}
                      />
                      <SelectOptions
                        callback={(e) =>
                          setSortMode(
                            (e.target as HTMLButtonElement)
                              .value as sortModes
                          )
                        }
                        options={Object.keys(sortModes).map(
                          (key) => {
                            return {
                              value: key,
                              markup: <>{key}</>,
                              disabled: false
                            };
                          }
                        )}
                      />
                    </Select>
                  </div>
                  <div id="filters" className="popup-section">
                    <SearchBar
                      dataSets={[{ data: allSkills }]}
                      onSearch={(results) => {
                        setSearchedSkills(results[0] as Skill[]);
                      }}
                      value={searchValue}
                      setValue={setSearchValue}
                      placeholderText='Search for Tag'
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
                            className={`filter-tab filter-tab-${tab.color} ${index === activeTabId ? 'selected' : ''}`}
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
                      <TagDisplay
                        selected={[activeSkillFilters.map(
                          skill => ({
                            ...skill,
                            category: skill.type === "Major" ? "Major" : skill.type === "Role" ? "Role" : skill.category,
                            id: skill.skillId
                          })
                        ), activeExclusionFilters.map(
                          skill => ({
                            ...skill,
                            category: skill.type === "Major" ? "Major" : skill.type === "Role" ? "Role" : skill.category,
                            id: skill.skillId
                          })
                        )]}
                        toggleTag={toggleSkill}
                        tabs={filterPopupTabs.map(tab =>
                          tab.categoryName === "Developer Skill" ? "Developer" :
                            tab.categoryName === 'Designer Skill' ? "Designer" :
                              tab.categoryName === 'Audio Skill' ? "Audio" :
                                tab.categoryName === 'Soft Skill' ? "Soft" :
                                  tab.categoryName === 'Engineer Skill' ? "Engineer" :
                                    tab.categoryName === 'Major' ? "Major" :
                                      tab.categoryName
                        )}
                        tabId={activeTabId}
                        all={allSkills.map(
                          skill => ({
                            ...skill,
                            category: skill.type === "Major" ? "Major" : skill.type === "Role" ? "Role" : skill.category,
                            id: skill.skillId
                          })
                        )}
                        searchValue={searchValue}
                        searchData={searchedSkills.map(
                          skill => ({
                            ...skill,
                            category: skill.type === "Major" ? "Major" : skill.type === "Role" ? "Role" : skill.category,
                            id: skill.skillId
                          })
                        )}
                      />
                    </div>
                  </div>
                  <div id="selected-section" className="popup-section">
                    <h3>Selected</h3>
                    <h4>Click once to include-<i className='fa fa-check'></i>, twice to exclude-<i className='fa fa-close'></i>, three times to remove.</h4>
                    <div id="selected-filters">
                      {activeSkillFilters.map((skill) => (
                        <Tag
                          key={skill.skillId}
                          type={(skill.type.toLowerCase() == "role" || skill.type.toLowerCase() == "major") ? skill.type.toLowerCase() : skill.type.toLowerCase() + " skill"}
                          onClick={() =>
                            toggleSkill(skill.skillId, skill.type)
                          }
                          selected={true}
                        >
                          <i className="fa fa-check"></i>
                          <p>{skill.label}</p>
                        </Tag>
                      ))}
                      {activeExclusionFilters.map((skill) => (
                        <Tag
                          key={skill.skillId}
                          type={(skill.type.toLowerCase() == "role" || skill.type.toLowerCase() == "major") ? skill.type.toLowerCase() : skill.type.toLowerCase() + " skill"}
                          onClick={() =>
                            toggleSkill(skill.skillId, skill.type)
                          }
                          selected={true}
                        >
                          <i className="fa fa-close"></i>
                          <p>{skill.label}</p>
                        </Tag>
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
                        setActiveSkillFilters([]);
                        setActiveExclusionFilters([]);
                      }}
                    >
                      Reset Filters
                    </PopupButton>
                    <PopupButton
                      buttonId={'primary-btn'}
                      callback={() => {
                        // Reset skill filters before adding results in
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

                        // Update the project list
                        updateItemList(activeSkillFilters, activeExclusionFilters, filterMode, sortMode);

                        //Add "Applied Filters" div if it is missing and if the paragraph exists
                        if (activeSkillFilters.length > 0) {
                          setDisplayFiltersText(activeSkillFilters.some(skill => skill.type !== 'Designer'));
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
                    updateItemList(newActiveSkills, activeExclusionFilters, filterMode, sortMode);

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