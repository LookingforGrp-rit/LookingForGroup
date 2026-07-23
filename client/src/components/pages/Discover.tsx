import React, { useMemo, useState, useCallback, ChangeEvent, useEffect, useEffectEvent } from 'react';
import { DiscoverCarousel } from '../DiscoverCarousel';
import { Header } from '../Header';
import { PanelBox } from '../PanelBox';
import ToTopButton from '../ToTopButton';
import { getByID, getProjectFollowers } from '../../api/projects';
import { getProjectFollowing } from '../../api/users';

import {
  Tag, NumberDictionary, StructuredProjectInfo,
  ProjectPreview, ProjectWithFollowers,
  MePrivate
} from '@looking-for-group/shared';

import { DiscoverProjects } from '../DiscoverProjects';
import { GET } from '../../api';


//These variables should probably go somewhere else
let projects: ProjectPreview[] = [];

//Beginning is 0
let index = 0;

//Default should be 10
//Determines the number of different projects for some reason
const count = 10;

//Synchronous storing of the full project list for quick reference
let syncFullProjectList: ProjectPreview[] = [];

enum sortModes {
  "A-Z" = "A-Z",
  "Z-A" = "Z-A",
  "Newest" = "Newest",
  "Oldest" = "Oldest",
  "Followers" = "Followers",
  "Followers Ascending" = "Followers Ascending",
}

type FilterData = {
    tags: Tag[],
    excludeTags: Tag[],
    filterMode: 'Match All' | 'Match Any'
    sortMode: sortModes,
  }

//Stores current filter settings
let filterData: FilterData = {tags: [], excludeTags: [], filterMode: 'Match All', sortMode: sortModes.Newest};

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

  const [sortMode, setSortMode] = useState<sortModes>(sortModes.Newest);

  // Format data for use with SearchBar, which requires it to be: [{ data: }]
  const projectDataSet = useMemo(() => {
    return [{ data: fullProjectList }];
  }, [fullProjectList]);

  // When passing in data for project carousel, pass in the first three projects after getting their details
  // Hide the carousel while the user has an active search (non-empty search input)
  const heroContent = currentSearch.trim() === '' ? (
    <DiscoverCarousel dataList={heroProjectList} />
  ) : null;

  const [loadObj, setLoadObj] = useState<React.ReactElement>(<p>No More Projects!</p>);


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

  //Attempt at detecting when the user has scrolled to near the bottom of the screen
  const scrollEvent = useEffectEvent(() => {
    //console.log(`scrolled by ${}`);
    //document.documentElement.scrollBy() is always 0 

    //WAAAAAAIT DID I FIND IT
    const fullPage = document.querySelector('.page'); //the element that holds all of the page stuff
    if (fullPage) {
      const scrollPercent = fullPage.scrollTop / (fullPage.clientHeight / 2); //clientHeight seemed to be doubled so i halved it

      if (scrollPercent >= 0.95) {
        sortProjects();
        //console.log("load more projects");
      }
    }
  });

  //Gets the projects and updates the variables above
  const getPaginatedProjects = async (method?: string) => {
    //NOTE: the "Newest" here is a default implementation for sorting method, so the site doesn't break
    //CHANGE THIS WHEN FRONT END IS ACTUALLY IMPLEMENTED!!
    let returnedProjects;
    if (method)
      returnedProjects = await GET(`/projects/paginated/${count}/${index}/${method}`);
    else
      returnedProjects = await GET(`/projects/paginated/${count}/${index}/Newest`);

    if (returnedProjects.data && returnedProjects.data[returnedProjects.data.length - 1]) {
      index = returnedProjects.data[returnedProjects.data.length - 1].projectId;
    }

    return returnedProjects.data;
  }

  // Set the necessary data for project mode
  const setupProjectData = async (method: string, invert: boolean): Promise<void> => {
    //Doesn't check if projects are alreadys in projects so many are repeated
    //I think the weirdness below fixes it? I'm not sure since the only 3 bug is still present
    const returnedProjects: ProjectPreview[] = await getPaginatedProjects(method);

    //Probably doesn't work since it's not checking projectId?
    // returnedProjects = returnedProjects.filter((project) => !projects.includes(project));
    // projects = projects.concat(returnedProjects);

    //I need to improve this somehow
    const returnedProjectIds: number[] = returnedProjects.map((project) => project.projectId);
    const projectIds: number[] = projects.map((project) => project.projectId);

    //Only works if projects and projectIds is in the same order
    //Same with returnedProjects and returnedProjectIds
    for (let i = 0; i < returnedProjectIds.length; i++) {
      if (!projectIds.includes(returnedProjectIds[i])) {
        projects.push(returnedProjects[i]);
      }
    }
    
    if (!projects) {
      return;
    }

    const newProjectCache = projectCache;

    for (const project of projects) {
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
    for (let i = 0; i < Math.min(INITIAL_LOAD_COUNT, projects.length); i++) {
      const projectPreview = projects[i] as ProjectPreview;
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

    setLoadObj(returnedProjects.length < count ?
      <p style={{ color: 'red' }}>No More Projects!</p> :
      <button id='btn-loadmore' onClick={() => sortProjects()}>Load More Projects</button>);

    

    //sort projects
    switch (method) {
      case 'Newest':
        projects = projects.toSorted(
          (project1, project2) => project2.projectId - project1.projectId,
        );
        break;
      case 'A-Z':
        projects = projects.toSorted(
          (project1, project2) => project1.title.localeCompare(project2.title),
        );
        break;
      case 'Popular':
        { const followersList = await Promise.all(projects.map(
          project => getProjectFollowers(project.projectId)
        ));
        const projectsWithFollowers = projects.map((project, index) => {
          console.log(project.title + " " + followersList[index]);
          return {
            project,
            followers: followersList[index].data,
          };
        });
        projects = projectsWithFollowers.toSorted((project1, project2) => {
          const p1followers = project1.followers?.count ?? 0;
          const p2followers = project2.followers?.count ?? 0;
          return p2followers - p1followers;
        })
          .map(item => item.project);
        break; }
    }
    
    if (invert) {
      setFullProjectList(projects.toReversed());
      syncFullProjectList = projects.toReversed();
      setFilteredProjectList(projects.toReversed());

      getShowcaseDetails(projects.toReversed(), newProjectCache);
      setProjectCache(newProjectCache);
    }
    else {
      setFullProjectList(projects);
      syncFullProjectList = projects;
      setFilteredProjectList(projects);

      getShowcaseDetails(projects, newProjectCache);
      setProjectCache(newProjectCache);
    }
    setLoaded(true);

    //run through filters
    updateProjectList(filterData.tags, filterData.excludeTags, filterData.filterMode, filterData.sortMode);
  };

  /**
  * Changes what projects are shown to the user whenever a filter has been added or changed
  * @param activeTagFilters Tags that are shown to the user now
  */
  const updateProjectList = async (activeTagFilters: Tag[], activeExclusionFilters: Tag[], filterMode: "Match All" | "Match Any", sortMode: sortModes) => {
    if (filterData.sortMode !== sortMode) {
      sortProjects(sortMode);
    }

    //save filters
    filterData = {tags: activeTagFilters, excludeTags: activeExclusionFilters, filterMode, sortMode};
    
    const projectList = syncFullProjectList;

    // Helper: build full item list (prefer cache) and filter by tags/exclusions
    const buildAndFilter = async (sourcePreviews: ProjectPreview[]) => {
      const items: ProjectWithFollowers[] = [];
      for (const item of sourcePreviews) {
        if (projectCache[item.projectId]?.full != undefined) {
          items.push(projectCache[item.projectId].full as ProjectWithFollowers);
        } else {
          const projectData = await getByID(item.projectId);
          if (projectData.data) {
            items.push(projectData.data);
            projectCache[item.projectId] = projectCache[item.projectId] || {};
            projectCache[item.projectId].full = projectData.data;
          } else {
            console.error("Error getting project data from " + item.projectId);
          }
        }
      }

      const tagFilteredList = items.filter((item) => {
        for (const tag of activeExclusionFilters) {
          if (
            item.tags.some((projectTag) => projectTag.tagId === tag.tagId && projectTag.type === tag.type) ||
            item.mediums.some((medium) => medium.mediumId === tag.tagId && tag.type === "Project Type") ||
            item.jobs.some((job) => job.jobId === tag.tagId && tag.type === "Role") ||
            (item.context === tag.label && tag.type === "Context")
          )
            return false;
        }
        if (activeTagFilters.length === 0) return true;
        let matchesAny = false;
        let matchesAll = true;
        for (const tag of activeTagFilters) {
          if (tag.type === 'Project Type' && Array.isArray(item.mediums)) {
            const projectTypes = item.mediums.map((t) => t.label.toLowerCase());
            if (tag.label === `New`) {
              const cutOff = Date.now() - 604800000;
              const date = Date.parse(item.createdAt.toString());
              if (date > cutOff) {
                matchesAny = true;
              } else {
                matchesAll = false;
              }
            } else if (projectTypes.includes(tag.label.toLowerCase())) {
              matchesAny = true;
            } else {
              matchesAll = false;
            }
          } else if (tag.type === 'Context' && item.context) {
            const projectContext = item.context.toLowerCase();
            if (projectContext.includes(tag.label.toLowerCase())) {
              matchesAny = true;
            } else {
              matchesAll = false;
            }
          } else if (tag.type === "Positions") {
            const roles = item.jobs.map((job) => job.role);
            if (roles.find((role) => role.roleId === tag.tagId)) matchesAny = true;
            else matchesAll = false;
          } else if (tag.tagId && item.tags) {
            const tagIDs = item.tags.map((itemTag) => itemTag.tagId);
            if (tagIDs.includes(tag.tagId)) {
              matchesAny = true;
            } else {
              matchesAll = false;
            }
          }
        }
        return filterMode === "Match Any" ? matchesAny : matchesAll;
      });

      return tagFilteredList;
    };

    // If no tags are currently selected, render all projects (use syncFullProjectList)
    if (activeTagFilters.length === 0 && activeExclusionFilters.length === 0) {
      setFilteredProjectList(syncFullProjectList);
      return;
    }

    // Build and filter across the entire project list
    const filtered = await buildAndFilter(projectList);
    setFilteredProjectList(filtered);
  };

  useEffect(() => {
    sortProjects();
    setLoadObj(<button id='btn-loadmore' onClick={() => sortProjects()}>Load More Projects</button>);
  }, []);

  const sortProjects = useCallback((newSortMode?: sortModes) => {
    switch (newSortMode ?? sortMode) {
      case "A-Z":
        setupProjectData("A-Z", false);
        // Compare names
        break;
      case "Z-A":
        // Compare names inverted
        setupProjectData("A-Z", true);
        break;
      case "Newest":
        // Compare age
        setupProjectData("Newest", false);
        break;
      case "Oldest":
        // Compare age inverted
        setupProjectData("Newest", true);
        break;
      case 'Followers':
        setupProjectData("Popular", false);
        break;
      case "Followers Ascending":
        setupProjectData("Popular", true);
        break;
      default:
        //default to newest first
        setupProjectData("Newest", false);
        break;
    }
    if (newSortMode) setSortMode(newSortMode);
  }, [sortMode]);

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

    // Preload full project data for search results so the like icon state is available immediately,
    // and apply any currently active tag/exclusion filters so filters persist during search.
    (async () => {
      const newCache = projectCache;
      for (const projectId of matchIds) {
        if (!newCache[projectId]?.full) {
          try {
            const projectData = await getByID(projectId);
            if (projectData.data) {
              newCache[projectId] = newCache[projectId] || {};
              newCache[projectId].full = projectData.data;
            }
          } catch (error) {
            console.error(`Error preloading search project ${projectId}:`, error);
          }
        }
      }
      setProjectCache(newCache);

      // If there are active filters, filter the matched full items by those tags.
      if (filterData.tags.length > 0 || filterData.excludeTags.length > 0) {
        const matchedFullItems: ProjectWithFollowers[] = [];
        for (const preview of matches) {
          const cached = newCache[preview.projectId];
          if (cached?.full) matchedFullItems.push(cached.full as ProjectWithFollowers);
        }

        const tagFiltered = matchedFullItems.filter((item) => {
          for (const tag of filterData.excludeTags) {
            if (
              item.tags.some((projectTag) => projectTag.tagId === tag.tagId && projectTag.type === tag.type) ||
              item.mediums.some((medium) => medium.mediumId === tag.tagId && tag.type === "Project Type") ||
              item.jobs.some((job) => job.jobId === tag.tagId && tag.type === "Role") ||
              (item.context === tag.label && tag.type === "Context")
            )
              return false;
          }
          if (filterData.tags.length === 0) return true;
          let matchesAny = false;
          let matchesAll = true;
          for (const tag of filterData.tags) {
            if (tag.type === 'Project Type' && Array.isArray(item.mediums)) {
              const projectTypes = item.mediums.map((t) => t.label.toLowerCase());
              if (tag.label === `New`) {
                const cutOff = Date.now() - 604800000;
                const date = Date.parse(item.createdAt.toString());
                if (date > cutOff) {
                  matchesAny = true;
                } else {
                  matchesAll = false;
                }
              } else if (projectTypes.includes(tag.label.toLowerCase())) {
                matchesAny = true;
              } else {
                matchesAll = false;
              }
            } else if (tag.type === 'Context' && item.context) {
              const projectContext = item.context.toLowerCase();
              if (projectContext.includes(tag.label.toLowerCase())) {
                matchesAny = true;
              } else {
                matchesAll = false;
              }
            } else if (tag.type === "Positions") {
              const roles = item.jobs.map((job) => job.role);
              if (roles.find((role) => role.roleId === tag.tagId)) matchesAny = true;
              else matchesAll = false;
            } else if (tag.tagId && item.tags) {
              const tagIDs = item.tags.map((itemTag) => itemTag.tagId);
              if (tagIDs.includes(tag.tagId)) {
                matchesAny = true;
              } else {
                matchesAll = false;
              }
            }
          }
          return filterData.filterMode === "Match Any" ? matchesAny : matchesAll;
        });

        // Map back to the original previews for rendering
        const tagFilteredIds = new Set(tagFiltered.map((t) => t.projectId));
        const previewMatches = matches.filter((m) => tagFilteredIds.has(m.projectId));

        setFilteredProjectList(previewMatches.length > 0 ? previewMatches : []);
      } else {
        setFilteredProjectList(matches);
      }
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
    //TEMP FIX for spamming requests: use onScrollEnd
    //Looks alright but theres probably better solutions
    <main className="page discover-page" tabIndex={-1} onScrollEnd={scrollEvent}>
      {/* Search bar and profile/notification buttons */}
      <Header dataSets={projectDataSet}
        onSearch={searchProjects}
        value={currentSearch} onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentSearch(e.currentTarget.value)}
        setCurrentUserId={getAuth}
        searchOnFocus={handleSearchFocus}
        placeholderText="Search by Project"
        mobilePlaceholderText="Projects"
      />
      {/* Contains the hero display, carousel if projects, profile intro if profiles*/}
      {heroContent}

      {/* 
        Contains tag filters & button to access more filters 
        When page loads, determine if project tags or profile tags should be used
        Clicking a tag filter adds it to a list & updates panel display based on that list
        Changes to filters via filter menu are only applied after a confirmation
      */}
      <article id="main" tabIndex={-1} aria-label='main content'>
        <DiscoverProjects updateItemList={updateProjectList} />

        {/* Panel container. itemAddInterval can be whatever. 25 feels good for now */}
        <div id="discover-panel-box">
          {/* If filteredItemList isn't done loading, display a loading bar */}
          {discoverPanelContents}
        </div>

        {loadObj}
      </article>
      <ToTopButton />
    </main>
  );
}