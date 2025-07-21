import React, { act, useState, Fragment } from 'react';
import { Popup, PopupButton, PopupContent } from './Popup';
import { SearchBar } from './SearchBar';
import { ThemeIcon } from './ThemeIcon';
import { tags, peopleTags, projectTabs, peopleTabs } from '../constants/tags';

// Has to be outside component to avoid getting reset on re-render
let activeTagFilters: string[] = [];
let displayFiltersText = false; // toggles "Applied Filters:" div when necessary

export const DiscoverFilters = ({ category, updateItemList }: { category: string, updateItemList: Function }) => {
  // --------------------
  // Interfaces
  // --------------------
  interface Tag {
    tag: string;
    color: string;
  }

  interface Skill {
    label: string;
    type: string;
  }

  // --------------------
  // Global variables
  // --------------------
  // Important for ensuring data has properly loaded
  const [dataLoaded, setDataLoaded] = useState(false);

  const [currentTags, setCurrentTags] = useState([]);
  const [searchedTags, setSearchedTags] = useState({
    tags: [],
    color: 'grey',
  });
  const [enabledFilters, setEnabledFilters] = useState([]);
  const [appliedFiltersDisplay, setAppliedFiltersDisplay] = useState([]);

  // Formatted for SearchBar dataSets prop
  const [dataSet, setDataSet] = useState([{ data: currentTags }]);

  const tagList = category === 'projects' ? tags : peopleTags;

  // List of tabs for the filter popup to use, changes for discover/meet page
  // TO-DO: Change code to rely on Database
  // let filterPopupTabs =
  //   category === 'projects'
  //     ? [
  //         { categoryTags: tags.projectTypes, categoryName: 'Project Type', color: 'blue' },
  //         { categoryTags: tags.genres, categoryName: 'Genre', color: 'green' },
  //         { categoryTags: tags.purposes, categoryName: 'Purpose', color: 'grey' },
  //       ]
  //     : [
  //         { categoryTags: tags.devSkills, categoryName: 'Developer Skill', color: 'yellow' },
  //         { categoryTags: tags.desSkills, categoryName: 'Designer Skill', color: 'red' },
  //         { categoryTags: tags.softSkills, categoryName: 'Soft Skill', color: 'purple' },
  //         { categoryTags: tags.tags, categoryName: 'Role', color: 'grey' },
  //         { categoryTags: tags.tags, categoryName: 'Major', color: 'orange' },
  //       ];
  const [filterPopupTabs, setFilterPopupTabs] = useState([]);

  // --------------------
  // Helper functions
  // --------------------
  const getData = async () => {
    const url = `/api/datasets/${category === 'projects' ? 'tags' : 'skills'}`;

    try {
      let response = await fetch(url);
      const result = await response.json();
      const data = result.data;

      // Need to also pull from majors and job_titles tables
      if (category === 'profiles') {
        // Get job titles and append it to full data
        response = await fetch(`/api/datasets/job-titles`);
        let extraData = await response.json();
        if (extraData.data !== undefined) {
          extraData.data.forEach((jobTitle: Skill) => data.push({ label: jobTitle.label, type: 'Role' }));
        }

        // Get majors and append it to full data
        response = await fetch(`/api/datasets/majors`);
        extraData = await response.json();
        if (extraData.data !== undefined) {
          extraData.data.forEach((major: Skill) => data.push({ label: major.label, type: 'Major' }));
        }
      } else if (category === 'projects') {
        // Pull Project Types and append it to full data
        response = await fetch(`/api/datasets/project-types`);
        const extraData = await response.json();
        if (extraData.data !== undefined) {
          extraData.data.forEach((projectType: Skill) => data.push({ label: projectType.label, type: 'Project Type' }));
        }
      }

      // Construct the finalized version of the data to be moved into filterPopupTabs
      const tabs = JSON.parse(JSON.stringify((category === 'projects') ? projectTabs : peopleTabs));
      data.forEach((tag: Skill) => {
        const filterTag = { label: tag.label, type: tag.type };
        let type = tag.type;

        if (tag.tag_id) {
          filterTag['tag_id'] = tag.tag_id;
        }

        //TODO: clean this up. data should all be of type 'Genre' now
        // All these tags should be under Genre
        if (
          type === 'Creative' ||
          type === 'Technical' ||
          type === 'Games' ||
          type === 'Multimedia' ||
          type === 'Music' ||
          type === 'Other'
        ) {
          type = 'Genre';
        }

        tabs[type].categoryTags.push(filterTag);
      });

      setFilterPopupTabs(Object.values(tabs));

    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.log(`Unknown error: ${error}`);
      }
    }

    setDataLoaded(true);
  };

  if (!dataLoaded) {
    getData();
  }

  // Function called when a tag is clicked, adds/removes tag to list of filters
  const toggleTag = (e, tagName: string, tagType: string) => {
    // see if button is clicked
    const clicked = e.target;
    // is button selected?
    const isSelected = clicked.classList.contains('discover-tag-filter-selected');
    const discoverFilters = document.getElementsByClassName('discover-tag-filter');

    let newAlreadyActive = false; // Handles if a filter is clicked when NEW is already active.
    let anyActiveBeforeNew = ""; // Handles if NEW is clicked when another filter is already active.

    // Handling visuals: Hide all, only add back if necessary.
    // If "New" button was clicked - don't hide other any other selection, only New
    if (clicked.innerText.toLowerCase() === "new") {
      clicked.classList.remove('discover-tag-filter-selected');

      // if new is clicked when something is already active, it shouldnt clear that filter, but should clear its own (new) (no matter what!)
      for (let i = 0; i < discoverFilters.length; i++) {
        if (discoverFilters[i].classList.contains('discover-tag-filter-selected') && discoverFilters[i].innerText.toLowerCase() !== "new") {
          anyActiveBeforeNew = discoverFilters[i].innerText;
        }
      }
    }
    else {
      // if any filter is clicked when new is already active, it shouldnt clear new, but should clear its own (no matter what!)
      if (discoverFilters[0].innerText.toLowerCase() === "new" && discoverFilters[0].classList.contains('discover-tag-filter-selected')) { newAlreadyActive = true; }

      // remove 'selected' class from all buttons of this type (EXCEPT "New")
      for (let i = 0; i < discoverFilters.length; i++) {
        // get current button & type
        const button = discoverFilters[i];
        // type based on the page: Role/Project Type
        const buttonType = button.getAttribute('data-type');
        // remove select if type is the same, don't remove "New"
        if (button.innerText.toLowerCase() !== "new") {
          button.classList.remove('discover-tag-filter-selected');
        }
      }
    }

    // clear out tags
    activeTagFilters.splice(0, activeTagFilters.length);
    // old filtering: --> activeTagFilters = activeTagFilters.filter(tag => tag.type !== tagType);

    if (newAlreadyActive) { activeTagFilters.push({ label: 'New', type: 'Project Type' }); } // Add back new if necessary!
    if (anyActiveBeforeNew !== "") { activeTagFilters.push({ label: anyActiveBeforeNew, type: 'Project Type' }); } // Add back existing if necessary!

    console.log(activeTagFilters);

    // if initially invisible, make visible and push
    if (!isSelected) {
      clicked.classList.add('discover-tag-filter-selected');
      activeTagFilters.push({ label: tagName, type: tagType });
    }

    updateItemList(activeTagFilters);
  };

  // Scrolls the list of tag filters right or left
  const scrollTags = (direction: string) => {
    // Check if left or right button was clicked
    const tagFilterElement = document.getElementById('discover-tag-filters');
    const leftScroll = document.getElementById('filters-left-scroll');
    const rightScroll = document.getElementById('filters-right-scroll');

    // Ensure these elements exist before running code
    if (tagFilterElement && leftScroll && rightScroll) {
      const scrollAmt = tagFilterElement.clientWidth;

      // Check if other button is hidden, if so...
      if (leftScroll.classList.contains('hide') || rightScroll.classList.contains('hide')) {
        // Un-hide the other scrolling button
        leftScroll.classList.remove('hide');
        rightScroll.classList.remove('hide');
      }

      // If we are going to hit the edge with this scroll...
      if (direction === 'left') {
        if (tagFilterElement.scrollLeft - scrollAmt <= 0) {
          leftScroll.classList.add('hide');
        }

        tagFilterElement.scrollBy(-scrollAmt, 0);
      } else if (direction === 'right') {
        const scrolledAmt = tagFilterElement.scrollLeft + tagFilterElement.offsetWidth + scrollAmt;
        if (scrolledAmt >= tagFilterElement.scrollWidth) {
          rightScroll.classList.add('hide');
        }

        tagFilterElement.scrollBy(scrollAmt, 0);
      }
    }
  };

  // Ensures that scroll buttons show and hide when they're supposed to on-resize
  const resizeTagFilter = () => {
    const tagFilterElement = document.getElementById('discover-tag-filters')!;
    const leftScroll = document.getElementById('filters-left-scroll')!;
    const rightScroll = document.getElementById('filters-right-scroll')!;

    if (tagFilterElement && leftScroll && rightScroll) {
      // Check if left scroll should be shown or hidden
      if (tagFilterElement.scrollLeft <= 0 && !leftScroll.classList.contains('hide')) {
        leftScroll.classList.add('hide');
      } else if (tagFilterElement.scrollLeft > 0 && leftScroll.classList.contains('hide')) {
        leftScroll.classList.remove('hide');
      }

      // Check if right scroll should be shown or hidden
      const scrollAmt = tagFilterElement.scrollLeft + tagFilterElement.offsetWidth;
      if (scrollAmt >= tagFilterElement.scrollWidth && !rightScroll.classList.contains('hide')) {
        rightScroll.classList.add('hide');
      } else if (scrollAmt < tagFilterElement.scrollWidth && rightScroll.classList.contains('hide')) {
        rightScroll.classList.remove('hide');
      }
    }
  };

  // Variables for debouncing resize event call
  let timeout; // holder for timeout id
  const delay: number = 250; // delay after event is "complete" to run callback

  // window.resize event listener
  window.addEventListener('resize', function () {
    // clear the timeout
    clearTimeout(timeout);
    // start timing for event "completion"
    timeout = setTimeout(resizeTagFilter, delay);
  });

  // Checks if enabledFilters contains a particular tag
  const isTagEnabled = (tag: string, color: string) => {
    for (let i = 0; i < enabledFilters.length; i++) {
      if (enabledFilters[i].tag.label === tag.label && enabledFilters[i].color === color) {
        return i;
      }
    }

    return -1;
  };

  // Setup filter tabs when popup is opened
  const setupFilters = () => {
    // Defaults to the first available tab
    if (filterPopupTabs.length !== 0) {
      setCurrentTags(filterPopupTabs[0].categoryTags);
      setDataSet([{ data: filterPopupTabs[0].categoryTags }]);
      setSearchedTags({
        tags: filterPopupTabs[0].categoryTags,
        color: filterPopupTabs[0].color,
      });
    }
    setEnabledFilters([]);
  };

  // --------------------
  // Component
  // --------------------
  return (
    <>
      <div id="discover-filters">
        <button
          id="filters-left-scroll"
          className="filters-scroller hide"
          onClick={() => scrollTags('left')}
        >
          <i className="fa fa-caret-left"></i>
        </button>
        <div id="discover-tag-filters" onResize={resizeTagFilter}>
          { /* make each tag button have proper label & type */}
          {tagList.map((tag) => {
            const label = tag === 'Developers'
              ? 'Developer' : tag === 'Designers'
                ? 'Designer' : tag;

            const type = category === 'projects'
              ? 'Project Type' : tag === 'Other'
                ? 'Major' : 'Role';

            return (
              <button key={tag}
                className="discover-tag-filter"
                data-type={type}
                onClick={(e) => toggleTag(e, label, type)}>
                {tag}
              </button>
            )
          })}
          {/* Container so more filters popup is aligned at the end */}
          <div id="discover-more-filters-container">
            {/* Additional filters popup */}
            <Popup>
              <PopupButton buttonId={'discover-more-filters'} callback={setupFilters}>
                <ThemeIcon light={'/assets/filters_light.png'} dark={'/assets/filters_dark.png'} />
              </PopupButton>
              {/* 
                            When page loads, get all necessary tag lists based on page category.
                            Place these lists in an array, along with an identifier for which column 
                            they belong. Map through these lists to construct filter dropdown.
                            Displayed tags are determined using a state variable, changable w/ searchbar.
                            Tags have an onClick function that adds their tag to a full tag list. 
                            Full tag list is only applied when hitting done, which then pushes the 
                            info to an active list.
                        */}
              <PopupContent useClose={false}>
                {/* Back button */}
                <PopupButton className="popup-back">
                  <ThemeIcon
                    light={'/assets/back_light.png'}
                    dark={'/assets/back_dark.png'}
                    id="dropdown-arrow"
                  />
                </PopupButton>
                <div id="filters-popup">
                  <h2>{category === 'projects' ? 'Project Filters' : 'People Filters'}</h2>
                  <div id="filters" className="popup-section">
                    <SearchBar
                      dataSets={dataSet}
                      onSearch={(results) => {
                        setSearchedTags({ tags: results[0], color: searchedTags.color });
                      }}
                    ></SearchBar>
                    <div id="filter-tabs">
                      {filterPopupTabs.map((tab, index) => (
                        <a
                          key={`${tab.categoryName}-${index}`}
                          className={`filter-tab ${index === 0 ? 'selected' : ''}`}
                          onClick={(e) => {
                            const element = e.target as HTMLElement;

                            // Remove .selected from all 3 options, add it only to current button
                            const tabs = document.querySelector('#filter-tabs')!.children;
                            for (let i = 0; i < tabs.length; i++) {
                              tabs[i].classList.remove('selected');
                            }
                            element.classList.add('selected');
                            setCurrentTags(tab.categoryTags);
                            setDataSet([{ data: tab.categoryTags }]);
                            setSearchedTags({ tags: tab.categoryTags, color: tab.color });
                          }}
                        >
                          {tab.categoryName}
                        </a>
                      ))}
                    </div>
                    <hr />
                    <div id="filter-tags">
                      {searchedTags.tags.length === 0 ? (
                        <p>No tags found. Please try a different search term.</p>
                      ) : (
                        searchedTags.tags.map((tag) => (
                          <button
                            // add key once duplicate tags are removed:  --->  key={`${tag.label}-${tag.type}`}
                            // className={`tag-button tag-button-${searchedTags.color}-unselected`}
                            className={`tag-button tag-button-${searchedTags.color}-${isTagEnabled(tag, searchedTags.color) !== -1 ? 'selected' : 'unselected'}`}
                            onClick={(e) => {
                              const element = e.target as HTMLElement;
                              const selecIndex = isTagEnabled(tag, searchedTags.color);
                              let tempEnabled = enabledFilters;

                              if (tag.type === 'Project Type' || tag.type === 'Purpose' || tag.type === 'Role' || tag.type === 'Major') {
                                // Remove all other tags of the same type except the one selected
                                const filterTags = document.querySelector('#filter-tags')!;
                                const tagList = filterTags.getElementsByClassName(`tag-button-${searchedTags.color}-selected`);

                                for (let i = 0; i < tagList.length; i++) {
                                  const tagObj = { label: tagList[i].innerText.trim(), type: tag.type };
                                  const tagTypeIndex = isTagEnabled(tagObj, searchedTags.color);

                                  if (tagList[i].innerText.trim() !== tag.label) {
                                    tagList[i].classList.replace(
                                      `tag-button-${searchedTags.color}-selected`,
                                      `tag-button-${searchedTags.color}-unselected`
                                    );

                                    tempEnabled = tempEnabled.toSpliced(tagTypeIndex, 1);
                                  }
                                }
                              }

                              if (selecIndex === -1) {
                                // Creates an object to store text and category
                                //setEnabledFilters([...enabledFilters, { tag, color: searchedTags.color }]);
                                setEnabledFilters([
                                  ...tempEnabled,
                                  { tag, color: searchedTags.color },
                                ]);
                                element.classList.replace(
                                  `tag-button-${searchedTags.color}-unselected`,
                                  `tag-button-${searchedTags.color}-selected`
                                );
                              } else {
                                // Remove tag from list of enabled filters
                                setEnabledFilters(tempEnabled.toSpliced(selecIndex, 1));
                                element.classList.replace(
                                  `tag-button-${searchedTags.color}-selected`,
                                  `tag-button-${searchedTags.color}-unselected`
                                );
                              }
                            }}
                          >
                            <i
                              className={
                                isTagEnabled(tag, searchedTags.color) !== -1
                                  ? 'fa fa-check'
                                  : 'fa fa-plus'
                              }
                            ></i>
                            &nbsp;{tag.label}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                  <div id="selected-section" className="popup-section">
                    <h3>Selected</h3>
                    <h4>Click to deselect</h4>
                    <div id="selected-filters">
                      {enabledFilters.map((tag) => (
                        <button
                          key={tag.tag.label}
                          className={`tag-button tag-button-${tag.color}-selected`}
                          onClick={(e) => {
                            // Remove tag from list of enabled filters, re-rendering component
                            setEnabledFilters(
                              enabledFilters.toSpliced(isTagEnabled(tag.tag, tag.color), 1)
                            );
                          }}
                        >
                          <i className="fa fa-close"></i>
                          &nbsp;{tag.tag.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <PopupButton
                    buttonId={'primary-btn'}
                    callback={() => {
                      // Reset tag filters before adding results in
                      activeTagFilters = [];
                      const discoverFilters = document.getElementsByClassName('discover-tag-filter');

                      // Remove any/all other clicked discover tags
                      for (let i = 0; i < discoverFilters.length; i++) {
                        discoverFilters[i].classList.remove('discover-tag-filter-selected');
                      }

                      enabledFilters.forEach((filter) => {
                        activeTagFilters.push(filter.tag);

                        // Check if any enabled filters match a discover tag, and visually toggle it
                        // If the filter has a tag_id, it's either a Tag or a Skill, and not a Project Type
                        // Available for selection on the discover filters page
                        if (filter.tag.type === 'Project Type') {
                          for (let i = 0; i < discoverFilters.length; i++) {
                            if (discoverFilters[i].innerHTML.toLowerCase() === filter.tag.label.toLowerCase()) {
                              discoverFilters[i].classList.add('discover-tag-filter-selected');
                            }
                          }
                        }
                      });

                      setAppliedFiltersDisplay(enabledFilters);

                      // Update the project list
                      updateItemList(activeTagFilters);

                      //Add "Applied Filters" div if it is missing and if the paragraph exists
                      if (activeTagFilters.length > 0) {
                        displayFiltersText = false; // Checking to make sure more filters are applied than just a discover tag filter
                        for (let i = 0; i < activeTagFilters.length; i++) {
                          if (activeTagFilters[i].type != 'Project Type') {
                            displayFiltersText = true;
                            break;
                          }
                        }
                      }
                    }}
                  >
                    Apply
                  </PopupButton>
                </div>
              </PopupContent>
            </Popup>
          </div>
        </div>
        <button
          id="filters-right-scroll"
          className={`filters-scroller ${window.innerWidth >= 1450 ? 'hide' : ''}`}
          onClick={() => scrollTags('right')}
        >
          <i className="fa fa-caret-right"></i>
        </button>
      </div >
      {((appliedFiltersDisplay.length > 0) && (displayFiltersText)) ? (
        <div className='applied-filters'>
          <p>Applied Filters:</p>
          {appliedFiltersDisplay.map((filter, index) => {
            if (filter.tag.type === 'Project Type') {
              return <Fragment key={`${filter.tag.type}`} />;
            }

            return (
              <button
                key={filter.tag.label}
                className={`tag-button tag-button-${filter.color}-selected`}
                onClick={(e) => {
                  console.log('clicked!');

                  // Remove tag from list of enabled filters, re-rendering component
                  const tempList = appliedFiltersDisplay.toSpliced(index, 1);
                  activeTagFilters = tempList.map((filter) => filter.tag);
                  setAppliedFiltersDisplay(tempList);
                  updateItemList(activeTagFilters);

                  if (activeTagFilters.length == 1) { // If the only tag still active is a discover tag, remove "applied filters" div
                    if (activeTagFilters[0].type == 'Project Type') {
                      displayFiltersText = false;
                    }
                  }
                }}
              >
                <i className='fa fa-close'></i>
                &nbsp;{filter.tag.label}
              </button>
            );
          })}
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

