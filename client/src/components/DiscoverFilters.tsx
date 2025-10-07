import React, {useState, Fragment, useEffect} from 'react';
import { Popup, PopupButton, PopupContent } from './Popup';
import { SearchBar } from './SearchBar';
import { ThemeIcon } from './ThemeIcon';
import { tags, peopleTags, projectTabs, peopleTabs } from '../constants/tags';
import { getMajors, getJobTitles, getProjectTypes, getTags, getSkills } from '../api/users';
import { Tag, Skill } from '@looking-for-group/shared';

interface DiscoverFiltersProps {
  category: 'projects' | 'profiles';
  updateItemList: (tags: Tag[]) => void;
}

interface FilterTab {
  categoryName: string;
  color: string;
  categoryTags: Tag[];
}

interface EnabledFilter {
  tag: Tag;
  color: string;
}

export const DiscoverFilters: React.FC<DiscoverFiltersProps> = ({ category, updateItemList }) => {

  // --------------------
  // Global variables
  // --------------------
  // Important for ensuring data has properly loaded
  const [dataLoaded, setDataLoaded] = useState(false);
  const [currentTags, setCurrentTags] = useState<Tag[]>([]);
  const [searchedTags, setSearchedTags] = useState<{ tags: [], color: string }>({ tags: [], color: 'grey' });
  const [enabledFilters, setEnabledFilters] = useState<EnabledFilter[]>([]);
  const [appliedFiltersDisplay, setAppliedFiltersDisplay] = useState<EnabledFilter[]>([]);
  const [activeTagFilters, setActiveTagFilters] = useState<Tag[]>([]);
  const [displayFiltersText, setDisplayFiltersText] = useState(false);


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
  const [filterPopupTabs, setFilterPopupTabs] = useState<FilterTab[]>([]);

  // --------------------
  // Helper functions
  // --------------------
  const getData = async () => {
    try {
      let response = category === 'projects' ? await getTags() : await getSkills();
      const data: Skill[] = [...response.data];

      // Need to also pull from majors and job_titles tables
      if (category === 'profiles') {
        // Get job titles and append it to full data
        const jobTitles = await getJobTitles();
        jobTitles.data.forEach((job: Skill) => data.push({ label: job.label, type: 'Role' }));

        // Get majors and append it to full data
        const majors = await getMajors();
        majors.data.forEach((major: Skill) => data.push({ label: major.label, type: 'Major' }));

      } else if (category === 'projects') {
        // Pull Project Types and append it to full data
        const projectTypes = await getProjectTypes();
        projectTypes.data.forEach((proj: Skill) => data.push({ label: proj.label, type: 'Project Type' }));
      }

      // Construct the finalized version of the data to be moved into filterPopupTabs
      const tabs = JSON.parse(JSON.stringify(category === 'projects' ? projectTabs : peopleTabs));
      Object.values(tabs).forEach((tab: any) => tab.categoryTags = tab.categoryTags || []);
      data.forEach((tag: Tag) => {
        const filterTag: Tag = { ...tag };
        if ('tagId' in tag) {
          (filterTag as any).tag_id = (tag as any).tagId;
        }

        if(['Creative', 'Technical', 'Games', 'Multimedia', 'Music', 'Other'].includes(tag.type)) {
          filterTag.type = 'Genre';
        }

        tabs[filterTag.type].categoryTags.push(filterTag);
      });

      setFilterPopupTabs(Object.values(tabs));

    } catch (error) {
      console.error('Error fetching tags:', error);
    }

    setDataLoaded(true);
  };

  useEffect(() => {
    if (!dataLoaded) getData();
  }, [dataLoaded]);

  // Function called when a tag is clicked, adds/removes tag to list of filters
  const toggleTag = (tag: Tag) => {
    let newActiveTags: Tag[];
    
    if (activeTagFilters.some(t => t.label === tag.label && t.type === tag.type)) {
      newActiveTags = activeTagFilters.filter(t => t.label !== tag.label || t.type !== tag.type);
    } else { 
      newActiveTags = [...activeTagFilters, tag];
    }

    setActiveTagFilters(newActiveTags);
    updateItemList(newActiveTags);
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

  // window.resize event listener
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(timeout);
      timeout = setTimeout(resizeTagFilter, 250);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Checks if enabledFilters contains a particular tag
  const isTagEnabled = (tag: Tag, color: string) => {
    return enabledFilters.findIndex(f => f.tag.label === tag.label && f.color === color);
  };

  // Setup filter tabs when popup is opened
  const setupFilters = () => {
    // Defaults to the first available tab
    if (filterPopupTabs.length > 0) {
      const firstTab = filterPopupTabs[0];
      setCurrentTags(firstTab.categoryTags);
      setDataSet([{ data: firstTab.categoryTags }]);
      setSearchedTags({
        tags: firstTab.categoryTags,
        color: firstTab.color,
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
          {tagList.map(tagLabel => {
            const label = tagLabel === 'Developers' ? 'Developer' : tagLabel === 'Designers' ? 'Designer' : tagLabel;
            const type = category === 'projects' ? 'Project Type' : tagLabel === 'Other' ? 'Major' : 'Role';
            const tagObj: Tag = { label, type };
            return (
              <button key={label}
                className="discover-tag-filter"
                data-type={type}
                onClick={() => toggleTag(tagObj)}>
                {label}
              </button>
            )
          })}
          {/* Container so more filters popup is aligned at the end */}
          <div id="discover-more-filters-container">
            {/* Additional filters popup */}
            <Popup>
              <PopupButton buttonId={'discover-more-filters'} callback={setupFilters}>
                <ThemeIcon id={'filter'} width={30} height={31} className={'color-fill color-stroke'} ariaLabel={'more filters'}/>
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
                  <ThemeIcon id={'back'} width={70} height={25} className={'color-fill'} ariaLabel={'back'}/>
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
                      const newActiveTags = enabledFilters.map(f => f.tag)
                      setActiveTagFilters(newActiveTags);
                      const discoverFilters = document.getElementsByClassName('discover-tag-filter');

                      // Remove any/all other clicked discover tags
                      for (let i = 0; i < discoverFilters.length; i++) {
                        discoverFilters[i].classList.remove('discover-tag-filter-selected');
                      }

                      enabledFilters.forEach((filter) => {

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
                      updateItemList(newActiveTags);

                      //Add "Applied Filters" div if it is missing and if the paragraph exists
                      if (newActiveTags.length > 0) {
                        setDisplayFiltersText(newActiveTags.some(tag => tag.type !== 'Project Type'));
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
                  const newActiveTags = tempList.map((filter) => filter.tag);
                  setAppliedFiltersDisplay(tempList);
                  setActiveTagFilters(newActiveTags);
                  updateItemList(newActiveTags);

                  if (newActiveTags.length === 0 || (newActiveTags.length === 1 && newActiveTags[0].type === 'Project Type')) {
                    setDisplayFiltersText(false);
                  } else {
                    setDisplayFiltersText(true);
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

