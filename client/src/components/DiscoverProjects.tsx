import React, { useState, Fragment, useEffect, useRef } from 'react';
import { Popup, PopupButton, PopupContent } from './Popup';
import { SearchBar } from './SearchBar';
import { tags, projectTabs } from '../constants/tags';
import { getJobTitles, getProjectTypes, getTags } from '../api/users';
import { Tag, StringDictionary, Medium, Role, TagType, } from '@looking-for-group/shared';
import { Select, SelectButton, SelectOptions } from './Select';
import MoreFiltersButton from './MoreFiltersButton';
import { Tag as TagElement } from './Tag';
import TagDisplay from './TagDisplay';


interface DiscoverProjectsProps {
    updateItemList: (
        tags: Tag[],
        filterMode: "Match All" | "Match Any",
        SortMode: sortModes
    ) => void;
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

enum sortModes {
    "A-Z" = "A-Z",
    "Z-A" = "Z-A",
    "Newest" = "Newest",
    "Oldest" = "Oldest",
    "Followers" = "Followers",
    "Followers Ascending" = "Followers Ascending",
}


/**
 * Provides an interactive filtering system for the Discover and Meet pages.
 * Displays a horizontal list of quick-filter tags and a popup containing
 * advanced category-based filters, search functionality, and batch selection.
 * Selected filters are applied to the parent component via `updateItemList`,
 * and visual state is synchronized across the quick tags and popup.
 *
 * The component loads all available tags dynamically depending on whether
 * the current page is showing projects or profiles. It automatically groups
 * these tags into filter tabs, handles searching within categories, and
 * manages UI behaviors such as scroll buttons, selection highlighting,
 * and responsive resizing.
 * @param updateItemList Callback triggered whenever the active filter list changes.  
 * Receives the final set of applied Tag objects.
 * @returns A fully interactive filter bar and popup system,
 * providing tag selection, searching, category tabs, and applied-filter display.
 */
export const DiscoverProjects: React.FC<DiscoverProjectsProps> = ({ updateItemList }) => {
    // --------------------
    // Global variables
    // --------------------
    // Tags currently filtered via search input
    const [searchedTags, setSearchedTags] = useState<Tag[]>([]);
    // Filters that have been applied and are displayed under the quick filter tags
    const [appliedFiltersDisplay, setAppliedFiltersDisplay] = useState<EnabledFilter[]>([]);
    // List of tags currently active for filtering in the parent dataset
    const [activeTagFilters, setActiveTagFilters] = useState<Tag[]>([]);
    // Whether the "Applied Filters" section should display under the quick tags
    const [displayFiltersText, setDisplayFiltersText] = useState(false);
    //Keeps track of the currently selected tab in this popup.
    const [activeTabId, setActiveTabId] = useState(0);
    // Whether the popup is active; this effects popup filter arrows visibility
    const [activePopup, setActivePopup] = useState(false);

    const [searchValue, setSearchValue] = useState("");
    const [allTags, setAllTags] = useState<Tag[]>([]);

    // Dynamically show/hide arrows
    const tagFiltersRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    // Dynamically show/hide arrows for pop-up filters
    const popupTagFiltersRef = useRef<HTMLDivElement>(null);
    const [showPopupLeftArrow, setShowPopupLeftArrow] = useState(false);
    const [showPopupRightArrow, setShowPopupRightArrow] = useState(false);

    // Horizontal quick filter tags, changes based on category
    const tagList = tags;

    // Tabs shown in the popup, dynamically created after fetching data
    const [filterPopupTabs, setFilterPopupTabs] = useState<FilterTab[]>([]);

    const [filterMode, setFilterMode] = useState<"Match All" | "Match Any">("Match All");
    const [sortMode, setSortMode] = useState<sortModes>(sortModes.Newest);


    //////////////////
    //HELPER METHODS//
    //////////////////
    const getData = async () => {
        try {
            const response = await getTags();
            const responseTwo = await getProjectTypes();
            const jobResponse = await getJobTitles();
            const data: unknown[] = response.data as unknown[];
            const dataTwo = responseTwo.data;

            //gets the projet types and pushes the data into the data variable for every project got
            const projectTypes = await getProjectTypes();
            projectTypes.data?.forEach((proj: Medium) => data?.push({ label: proj.label, type: 'Project Type' }));

            // Construct the finalized version of the data to be moved into filterPopupTabs
            const tabs = JSON.parse(JSON.stringify(projectTabs));
            Object.values(tabs).forEach((tab: any) => tab.categoryTags = tab.categoryTags || []);

            // Map tag types to correct tab categories
            const typeMap: StringDictionary<string> = {
                Style: 'Style',
                Other: 'Other',
                Genre: 'Genre',
                Purpose: 'Purpose',
                Medium: 'Project Type',
            }

            const tag_data: Tag[] = data as Tag[];
            const medium_data: Medium[] = dataTwo as Medium[];
            const job_data: Role[] = jobResponse.data as Role[];

            setAllTags([
                ...tag_data.filter((tag) => tag.category !== undefined),
                ...medium_data.map(
                    (medium) => ({
                        tagId: medium.mediumId,
                        label: medium.label,
                        type: "Project Type",
                        category: "Other",
                    } as Tag)
                ),
                ...job_data.map(
                    (role) => ({
                        tagId: role.roleId,
                        label: role.label,
                        type: "Positions",
                        category: "Other",
                    } as Tag)
                )
            ]);

            tag_data?.forEach((tag: Tag) => {
                const filterTag: Tag = { ...tag };
                const mappedType = typeMap[tag.type] || tag.type;

                if (tabs[mappedType]) {
                    tabs[mappedType].categoryTags.push(filterTag);
                }
            });

            jobResponse.data?.forEach((job) => {
                tabs["Positions"].categoryTags.push({
                    tagId: job.roleId,
                    label: job.label,
                    type: "Positions",
                    category: "Other",
                });
            })

            setFilterPopupTabs(Object.values(tabs));
        }
        catch (err) {
            console.error('Error fetching tags: ', err);
        }
    };

    /**
     * Toggles a tag's selection in the horizontal quick filter.
     * Updates visual selection and parent dataset.
     * @param id - id of the tag to be found
     * @param type - the type of tag to be found(some tags share ID's with positions,mediums)
     */
    const toggleTag = (id: number, type: string, update?: boolean) => {
        let newActiveTags: Tag[];
        const tag = allTags.find((tag) => tag.tagId === id && tag.type === type as TagType);
        if (!tag) return;

        if (activeTagFilters.some(t => t === tag)) {
            // Remove the tag from the active list
            newActiveTags = activeTagFilters.filter(t => t !== tag);
        }
        else {
            // Add the tag to the active list
            newActiveTags = [...activeTagFilters, tag];
        }

        setActiveTagFilters(newActiveTags);
        if (update) updateItemList(newActiveTags, filterMode, sortMode);
    };

    /**
    * Checks the scroll position and container width to determine if 
    * there is more content to the left or right.
    */
    const checkScrollVisibility = () => {
        if (tagFiltersRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = tagFiltersRef.current;

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
        if (popupTagFiltersRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = popupTagFiltersRef.current;

            setShowPopupLeftArrow(scrollLeft > 0);
            setShowPopupRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 1);
        }
    };

    /**
     * Scrolls horizontal tag list left or right.
     * Hides or shows scroll buttons depending on edge conditions.
     */
    const scrollTags = (direction: string) => {
        if (tagFiltersRef.current) {
            // 80% of width. Feel free to fiddle with
            const scrollAmt = tagFiltersRef.current.clientWidth * 0.8;

            if (direction === 'left') {
                tagFiltersRef.current.scrollBy({ left: -scrollAmt, behavior: 'smooth' });
            } else if (direction === 'right') {
                tagFiltersRef.current.scrollBy({ left: scrollAmt, behavior: 'smooth' });
            }
        }
    };

    /** === For Popup Filters ===
     * Scrolls horizontal tag list left or right.
     * Hides or shows scroll buttons depending on edge conditions.
     */
    const popupScrollTags = (direction: string) => {
        if (popupTagFiltersRef.current) {
            // 80% of width. Feel free to fiddle with
            const scrollAmt = popupTagFiltersRef.current.clientWidth * 0.8;

            if (direction === 'left') {
                popupTagFiltersRef.current.scrollBy({ left: -scrollAmt, behavior: 'smooth' });
            } else if (direction === 'right') {
                popupTagFiltersRef.current.scrollBy({ left: scrollAmt, behavior: 'smooth' });
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
        //  setCurrentTags(currentTab.categoryTags);
        //  setDataSet([{ data: currentTab.categoryTags }]);
        //  setSearchedTags({
        //    tags: currentTab.categoryTags,
        //    color: currentTab.color,
        //  });
        //}
        setActivePopup(true);
    };

    //initial fetch of all data
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
        <div id="discover-filters-parent">
            <div id="discover-filters">
                <button
                    id="filters-left-scroll"
                    className={`filters-scroller ${!showLeftArrow ? 'hide' : ''}`}
                    onClick={() => scrollTags('left')}
                >
                    <i className="fa fa-caret-left"></i>
                </button>
                <div
                    id="discover-tag-filters"
                    tabIndex={-1}
                    ref={tagFiltersRef}
                    onScroll={checkScrollVisibility}
                >
                    { /* make each tag button have proper label & type */}
                    {tagList.map(tagLabel => {
                        const label = tagLabel === 'Developers' ? 'Developer' :
                            tagLabel === 'Designers' ? 'Designer' :
                                tagLabel === 'Audio Creators' ? 'Audio' :
                                    //tagLabel === 'Soft Skills' ? "Soft" :
                                    tagLabel;
                        const type = 'Project Type';
                        const tagObj: Tag = { tagId: allTags.find((tag) => tag.label == label)?.tagId ?? 0, label, type, category: "Other" };
                        return (
                            <button key={`${type}-${label}`}
                                className={"discover-tag-filter" + (activeTagFilters.find(t => t.tagId === tagObj.tagId && t.type === tagObj.type) ? " discover-tag-filter-selected" : "")}
                                data-type={type}
                                onClick={() => toggleTag(tagObj.tagId, tagObj.type, true)}>
                                {tagLabel}
                            </button>
                        )
                    })}
                </div>
                <button
                    id="filters-right-scroll"
                    className={`filters-scroller ${!showRightArrow ? 'hide' : ''}`}
                    onClick={() => scrollTags('right')}
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
                                When page loads, get all necessary tag lists based on page category.
                                Place these lists in an array, along with an identifier for which column 
                                Displayed tags are determined using a state variable, changable w/ searchbar.
                                Tags have an onClick function that adds their tag to a full tag list. 
                                Full tag list is only applied when hitting done, which then pushes the 
                                info to an active list.
                            */}
                        <PopupContent useClose={false}>
                            {/* Close Button */}
                            <PopupButton className="popup-close">
                                <img alt="close" src="/images/icons/cancel.png" onClick={() => { setActivePopup(false); }}></img>
                            </PopupButton>
                            <div id="filters-popup">
                                <h2>Project Filters</h2>
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
                                        dataSets={[{ data: allTags }]}
                                        onSearch={(results) => {
                                            setSearchedTags(results[0] as Tag[]);
                                        }}
                                        value={searchValue}
                                        setValue={setSearchValue}
                                        placeholderText='Search for Tag'
                                    ></SearchBar>
                                    <div id="more-filters-scroll-container">
                                        <button
                                            id="popup-filters-left-scroll"
                                            className={`more-filters-scroller ${!showPopupLeftArrow ? 'hide' : ''}`}
                                            onClick={() => popupScrollTags('left')}
                                        >
                                            <i className="fa fa-caret-left"></i>
                                        </button>
                                        <div id="filter-tabs"
                                            tabIndex={-1}
                                            ref={popupTagFiltersRef}
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
                                            onClick={() => popupScrollTags('right')}
                                        >
                                            <i className="fa fa-caret-right"></i>
                                        </button>
                                    </div>
                                    <hr />
                                    <div id="filter-tags">
                                        <TagDisplay
                                            selected={activeTagFilters.map(
                                                (tag) => ({
                                                    id: tag.tagId,
                                                    label: tag.label,
                                                    type: tag.type,
                                                    category:
                                                        tag.type === "Project Type" ? "Medium" :
                                                            tag.type === "Positions" ? "Position" :
                                                                tag.category,
                                                })
                                            )}
                                            toggleTag={toggleTag}
                                            tabs={filterPopupTabs.map(tab => tab.categoryName)}
                                            tabId={activeTabId}
                                            all={allTags.map(
                                                (tag) => ({
                                                    id: tag.tagId,
                                                    label: tag.label,
                                                    type: tag.type,
                                                    category:
                                                        tag.type === "Project Type" ? "Medium" :
                                                            tag.type === "Positions" ? "Position" :
                                                                tag.category,
                                                })
                                            )}
                                            searchValue={searchValue}
                                            searchData={searchedTags?.map(
                                                (tag) => ({
                                                    id: tag.tagId,
                                                    label: tag.label,
                                                    type: tag.type,
                                                    category:
                                                        tag.type === "Project Type" ? "Medium" :
                                                            tag.type === "Positions" ? "Position" :
                                                                tag.category,
                                                })
                                            )}
                                        />
                                    </div>
                                </div>
                                <div id="selected-section" className="popup-section">
                                    <h3>Selected</h3>
                                    <h4>Click to deselect</h4>
                                    <div id="selected-filters">
                                        {activeTagFilters.map((tag) => (
                                            <TagElement
                                                key={tag.type + tag.tagId}
                                                type={tag.type.toLowerCase()}
                                                onClick={() => {
                                                    toggleTag(tag.tagId, tag.type);
                                                }}
                                                selected={true}
                                            >
                                                <i className="fa fa-close"></i>
                                                <p>{tag.label}</p>
                                            </TagElement>
                                        ))}
                                    </div>
                                </div>
                                <div id="filters-btns-section">
                                    {/* Reset Filters button */}
                                    <PopupButton
                                        className={'delete-button'}
                                        doNotClose={() => true}
                                        callback={() => {
                                            // Reset tag filters before adding results in
                                            setActiveTagFilters([]);
                                            const discoverFilters = document.getElementsByClassName('discover-tag-filter');

                                            // Remove any/all other clicked discover tags
                                            for (let i = 0; i < discoverFilters.length; i++) {
                                                discoverFilters[i].classList.remove('discover-tag-filter-selected');
                                            }

                                            // Sets active filters displayed to "none" 
                                            setAppliedFiltersDisplay([]);
                                        }}
                                    >
                                        Reset Filters
                                    </PopupButton>
                                    <PopupButton
                                        buttonId={'primary-btn'}
                                        callback={() => {
                                            // Reset tag filters before adding results in
                                            const newActiveTags = activeTagFilters
                                            setActiveTagFilters(newActiveTags);
                                            const discoverFilters = document.getElementsByClassName('discover-tag-filter');

                                            // Remove any/all other clicked discover tags
                                            for (let i = 0; i < discoverFilters.length; i++) {
                                                discoverFilters[i].classList.remove('discover-tag-filter-selected');
                                            }

                                            activeTagFilters.forEach((tag) => {

                                                // Check if any enabled filters match a discover tag, and visually toggle it
                                                // If the filter has a tag_id, it's either a Tag or a Skill, and not a Project Type
                                                // Available for selection on the discover filters page
                                                if (tag.type === 'Project Type') {
                                                    for (let i = 0; i < discoverFilters.length; i++) {
                                                        if (discoverFilters[i].innerHTML.toLowerCase() === tag.label.toLowerCase()) {
                                                            discoverFilters[i].classList.add('discover-tag-filter-selected');
                                                        }
                                                    }
                                                }
                                            });

                                            // Update the project list
                                            updateItemList(newActiveTags, filterMode, sortMode);

                                            //Add "Applied Filters" div if it is missing and if the paragraph exists
                                            if (newActiveTags.length > 0) {
                                                setDisplayFiltersText(newActiveTags.some(tag => tag.type !== 'Project Type'));
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
                        if (filter.tag.type === 'Project Type') {
                            return <Fragment key={`${filter.tag.type}`} />;
                        }

                        return (
                            <button
                                key={filter.tag.label}
                                className={`tag-button tag-button-${filter.color}-selected`}
                                onClick={() => {

                                    // Remove tag from list of enabled filters, re-rendering component
                                    const tempList = appliedFiltersDisplay.toSpliced(index, 1);
                                    const newActiveTags = tempList.map((filter) => filter.tag);
                                    setAppliedFiltersDisplay(tempList);
                                    setActiveTagFilters(newActiveTags);
                                    updateItemList(newActiveTags, filterMode, sortMode);

                                    if (newActiveTags.length === 0 || (newActiveTags.length === 1 && newActiveTags[0].type === 'Project Type')) {
                                        setDisplayFiltersText(false);
                                    } else {
                                        setDisplayFiltersText(true);
                                    }
                                }}
                            >
                                <i className='fa fa-close'></i>
                                <p>{filter.tag.label}</p>
                            </button>
                        );
                    })}
                </div>
            ) : (
                <></>
            )}
        </div>
    );
}