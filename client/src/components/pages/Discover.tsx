import React, { useMemo, useState, useCallback, ChangeEvent, useEffect } from 'react';
import { DiscoverCarousel } from '../DiscoverCarousel';
import { DiscoverFilters } from '../DiscoverFilters';
import { Header } from '../Header';
import { PanelBox } from '../PanelBox';
import ToTopButton from '../ToTopButton';
import { getProjects, getByID } from '../../api/projects';
import { getProjectFollowing } from '../../api/users';
import {
  ApiResponse, Tag, NumberDictionary, StructuredProjectInfo,
  ProjectPreview, ProjectWithFollowers,
  MePrivate
} from '@looking-for-group/shared';
import { DiscoverProjects } from '../DiscoverProjects';

export const DiscoverPage = () => {
  // --------------------
  // Components
  // --------------------
  const [loaded, setLoaded] = useState<boolean>(false);
  const [currentSearch, setCurrentSearch] = useState('');

  // Full data and displayed data based on filter/search query
  const [fullProjectList, setFullProjectList] = useState<ProjectPreview[]>([]);
  const [projectCache, setProjectCache] = useState<NumberDictionary<StructuredProjectInfo>>({});

  const [filteredProjectList, setFilteredProjectList] = useState<ProjectPreview[]>([]);
  const [heroProjectList, setHeroProjectList] = useState<ProjectWithFollowers[]>([]);

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [followedProjectIds, setFollowedProjectIds] = useState<Set<number>>(new Set());

  // Format data for use with SearchBar, which requires it to be: [{ data: }]
  const projectDataSet = useMemo(() => {
    return [{ data: fullProjectList }];
  }, [fullProjectList]);

  // When passing in data for project carousel, pass in the first three projects after getting their details
  // Hide the carousel while the user has an active search (non-empty search input)
  const heroContent = <DiscoverCarousel dataList={heroProjectList} />

  // --------------------
  // Helper functions
  // --------------------
  /**
  * Loads the current user and their followed projects so follow icons render immediately.
  */
  const getAuth = async (data: MePrivate | undefined) => {

    if (data) {
      setCurrentUserId(data.userId);
      await loadFollowedProjectIds(data.userId);
    } else {
      setCurrentUserId(-1);
      setFollowedProjectIds(new Set());
    }
  };

  const loadFollowedProjectIds = async (userId: number) => {
    if (currentUserId === -1) {
      setFollowedProjectIds(new Set());
      return;
    }

    try {
      const response = await getProjectFollowing(userId);
      if (response.data?.projects) {
        setFollowedProjectIds(new Set(response.data.projects.map((follow) => follow.project.projectId)));
      }
    } catch (error) {
      console.error('Error loading followed projects:', error);
      setFollowedProjectIds(new Set());
    }
  };

  // Update the showcased projects after getting more info from the server
  const getShowcaseDetails = async (projectList: ProjectPreview[], usedCache: NumberDictionary<StructuredProjectInfo>) => {
    const focusProjectDetailsList: ProjectWithFollowers[] = [];

    const MAX_HERO_PROJECTS = 6;

    // gets random projects order
    const shuffled = projectList.slice().sort(() => Math.random() - 0.5);

    //cache fetch helper
    const fetchFull = async (preview: ProjectPreview) => {
      const cacheEntry = usedCache[preview.projectId] ?? (usedCache[preview.projectId] = {});
      if (cacheEntry.full) return cacheEntry.full;

      const response = await getByID(preview.projectId);
      if (!response.data) return undefined;

      cacheEntry.full = response.data;
      return response.data;
    };

    // get only projects with open jobs
    for (const preview of shuffled) {
      const full = await fetchFull(preview);
      if (full && full.jobs.length > 0) {
        focusProjectDetailsList.push(full);
      }
      if (focusProjectDetailsList.length >= MAX_HERO_PROJECTS) break;
    }

    //Error check to make sure we have designated number of projects with open positions. 
    // If not, fill remaining slots with random projects until we have it
    // or run out of projects.
    if (focusProjectDetailsList.length < MAX_HERO_PROJECTS) {
      for (const preview of shuffled) {
        const full = await fetchFull(preview);
        if (!full) continue;

        // prevent duplicates
        if (!focusProjectDetailsList.some(p => p.projectId === full.projectId)) {
          focusProjectDetailsList.push(full);
        }

        if (focusProjectDetailsList.length >= MAX_HERO_PROJECTS) break;
      }
    }

    // Debug
    // console.log("Final count:", focusProjectDetailsList.length);
    // console.log("Titles:", focusProjectDetailsList.map(p => p.title));

    setHeroProjectList(focusProjectDetailsList);
  }

  // Set the necessary data for project mode
  const setupProjectData = async (): Promise<void> => {
    const projectRes = await getProjects();
    if (!projectRes.data) return;

    const newProjectCache = projectCache;
    for (const project of projectRes.data) {

      const cachedProject = newProjectCache[project.projectId];
      if (!cachedProject) {
        newProjectCache[project.projectId] = { preview: project };
      }
      else {
        cachedProject.preview = project;
      }

    }

    // Pre-fetch full details for the first visible batch to avoid flashing like/count state
    const INITIAL_LOAD_COUNT = 25;
    for (let i = 0; i < Math.min(INITIAL_LOAD_COUNT, projectRes.data.length); i++) {
      const projectPreview = projectRes.data[i] as ProjectPreview;
      const projectId = projectPreview.projectId;
      if (!newProjectCache[projectId]?.full) {
        try {
          const projectData = await getByID(projectId);
          if (projectData.data) {
            newProjectCache[projectId].full = projectData.data;
          }
        } catch (error) {
          console.error(`Error preloading project ${projectId}:`, error);
        }
      }
    }

    setFullProjectList(projectRes.data);
    setFilteredProjectList(projectRes.data);

    getShowcaseDetails(projectRes.data, newProjectCache);
    setProjectCache(newProjectCache);

    setLoaded(true);
  };

  /**
  * Changes what projects are shown to the user whenever a filter has been added or changed
  * @param activeTagFilters Tags that are shown to the user now
  */
  const updateProjectList = async (activeTagFilters: Tag[], filterMode: "Match All" | "Match Any") => {
    const projectList = fullProjectList;
    // Get project and user info to match with tags
    const items: ProjectWithFollowers[] = [];
    for (const item of projectList) {
      if (projectCache[item.projectId].full != undefined) {
        items.push(projectCache[item.projectId].full as ProjectWithFollowers);
      }
      else {
        const projectData = await getByID(item.projectId);
        if (projectData.data) {
          items.push(projectData.data);
          projectCache[item.projectId].full = projectData.data;
        } else {
          console.error("Error getting project data from " + item.projectId);
        }
      }
    }
    let tagFilteredList = items.filter((item) => {
      if (activeTagFilters.length === 0) return true;
      let matchesAny = false;
      let matchesAll = true;
      for (const tag of activeTagFilters) {
        // Check project type by name since IDs are not unique relative to tags
        // Project Type tag
        if (tag.type === 'Project Type' && Array.isArray(item.mediums)) {
          const projectTypes = item.mediums.map((t) => t.label.toLowerCase());
          if (tag.label === `New`) {
            //change the subtraction to change the 
            const cutOff = Date.now() - 604800000; //604,800,000 is 1 week in milliseconds
            const date = Date.parse(item.createdAt.toString());
            if (date > cutOff) {
              matchesAny = true;
            }
            else {
              matchesAll = false;
            }
          }
          else if (projectTypes.includes(tag.label.toLowerCase())) {
            matchesAny = true;
          }
          else {
            matchesAll = false;
          }
        }
        // Purpose tag 
        else if (tag.type === 'Purpose' && item.purpose) {
          const projectPurpose = item.purpose.toLowerCase();
          if (projectPurpose.includes(tag.label.toLowerCase())) {
            matchesAny = true;
          }
          else {
            matchesAll = false;
          }
        }
        else if (tag.type === "Position") {
          const roles = item.jobs.map((job) => job.role);

          if (roles.find((role) => role.roleId === tag.tagId))
            matchesAny = true;
          else 
            matchesAll = false;
        }
        // Tag check can be done by ID: Genre
        else if (tag.tagId && item.tags) {
          const tagIDs = item.tags.map((itemTag) => itemTag.tagId);

          if (tagIDs.includes(tag.tagId)) {
            matchesAny = true;
          }
          else {
            matchesAll = false;
          }
        }

      }
      if (filterMode === "Match Any") return matchesAny;
      else return matchesAll;
    });

    // If no tags are currently selected, render all projects
    // !! Needs to be skipped if searchbar has any input !!
    if (tagFilteredList.length === 0 && activeTagFilters.length === 0) {
      tagFilteredList = JSON.parse(JSON.stringify(fullProjectList));

      setFilteredProjectList(fullProjectList);
      return;
    }

    //doing both updates messes with the display updating
    //setProjectSearchData(tagFilteredList);

    // Set displayed projects
    setFilteredProjectList(tagFilteredList);
  };

  useEffect(() => {
    setupProjectData();
  }, []);

  /**
  * Updates the filtered project list with new search information
  * @param searchResults
  */
  const searchProjects = useCallback((searchResults: any[][]) => {
    if (!searchResults || !Array.isArray(searchResults)) return;

    // Flatten the nested arrays
    const flatResults = searchResults.flat();
    const matches: ProjectPreview[] = [];
    const matchIds: number[] = [];

    for (const result of flatResults) {
      const resultName = result?.title || result?.name || result?.value || '';
      if (!resultName) continue;

      const matchIndex = fullProjectList.findIndex(
        (item) => item.title === resultName
      );

      if (matchIndex !== -1 && fullProjectList[matchIndex]) {
        const projectPreview = fullProjectList[matchIndex];
        matches.push(projectPreview);
        matchIds.push(projectPreview.projectId);
      }
    }

    setFilteredProjectList(matches);

    // Preload full project data for search results so the like icon state is available immediately.
    (async () => {
      const newCache = projectCache;
      for (const projectId of matchIds) {
        if (!newCache[projectId]?.full) {
          try {
            const projectData = await getByID(projectId);
            if (projectData.data) {
              newCache[projectId].full = projectData.data;
            }
          } catch (error) {
            console.error(`Error preloading search project ${projectId}:`, error);
          }
        }
      }
      setProjectCache(newCache);
    })();
  }, [fullProjectList, projectCache]);

  //gets the discover stuff at the bottom
  let discoverPanelContents: React.ReactElement
  if (!loaded) {
    discoverPanelContents = (
      <div className='placeholder-spacing'>
        <div className='spinning-loader'></div>
      </div>
    );
  } else {
    discoverPanelContents = (
      <PanelBox
        category={'projects'}
        itemList={filteredProjectList}
        projectCache={projectCache}
        followedProjectIds={followedProjectIds}
        userId={currentUserId ?? -1}
      />
    );
  };


  // On mobile, focusing the search bar opens the on-screen keyboard, which
  // covers the lower half of the page and hides the results behind the carousel.
  // Scroll past the carousel so the filter bar and first result sit just under
  // the sticky header, keeping the top result visible above the keyboard.
  const handleSearchFocus = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    if (window.innerWidth > 800) return;

    
    const page = document.querySelector('.page') as HTMLElement | null;
    if (!page) return;
    const input = e.currentTarget;

    // Temporarily add scroll space at the bottom so the page can scroll far
    // enough to push the carousel fully out of view even when there are only a
    // few results below it (otherwise the scroll clamps and stops short).
    // Removed again when the search bar loses focus.
    page.style.paddingBottom = '60vh';
    const cleanup = () => {
      page.style.paddingBottom = '';
      input.removeEventListener('blur', cleanup);
    };
    input.addEventListener('blur', cleanup);

    // Delay so the keyboard/viewport change settles before we scroll.
    window.setTimeout(() => {
      const filters = document.getElementById('discover-filters-parent');
      if (!filters) return;
      const headerHeight = document.getElementById('header')?.offsetHeight ?? 90;
      // Tune SCROLL_OFFSET: higher (positive) = scroll FARTHER down so more of
      // the results show; lower/negative = scroll less.
      const SCROLL_OFFSET = 50;
      const top =
        filters.getBoundingClientRect().top -
        page.getBoundingClientRect().top +
        page.scrollTop -
        headerHeight +
        SCROLL_OFFSET;
      page.scrollTo({ top, behavior: 'smooth' });
    }, 250);
  }, []);

  return (
    <div className="page discover-page" tabIndex={-1}>
      {/* Search bar and profile/notification buttons */}
      <Header dataSets={projectDataSet}
        onSearch={searchProjects}
        value={currentSearch} onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentSearch(e.currentTarget.value)}
        setCurrentUserId={getAuth}
        searchOnFocus={handleSearchFocus} />
      {/* Contains the hero display, carousel if projects, profile intro if profiles*/}
      {heroContent}

      {/* 
        Contains tag filters & button to access more filters 
        When page loads, determine if project tags or profile tags should be used
        Clicking a tag filter adds it to a list & updates panel display based on that list
        Changes to filters via filter menu are only applied after a confirmation
      */}
      <main id="main" tabIndex={-1} aria-label='main content'>
        <DiscoverProjects updateItemList={updateProjectList} />

        {/* Panel container. itemAddInterval can be whatever. 25 feels good for now */}
        <div id="discover-panel-box">
          {/* If filteredItemList isn't done loading, display a loading bar */}
          {discoverPanelContents}
        </div>
      </main>
      <ToTopButton />
    </div>
  );
}