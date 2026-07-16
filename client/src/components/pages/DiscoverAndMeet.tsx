import { useMemo, useState, useCallback, ChangeEvent } from 'react';
import { DiscoverCarousel } from '../DiscoverCarousel';
import { DiscoverFilters } from '../DiscoverFilters';
import { Header } from '../Header';
import { PanelBox } from '../PanelBox';
import { ThemeImage } from '../ThemeIcon';
import ToTopButton from '../ToTopButton';
import { getProjects, getByID } from '../../api/projects';
import { getUsers, getUsersById, getProjectFollowing } from '../../api/users';
import {
  ApiResponse, Tag, NumberDictionary, StructuredProjectInfo,
  StructuredUserInfo, UserPreview, ProjectPreview,
  UserDetail, ProjectWithFollowers,
  MePrivate
} from '@looking-for-group/shared';

//import api utils
// Current auth and follow state are loaded with getCurrentAccount/getProjectFollowing


type DiscoverAndMeetProps = {
  category: 'projects' | 'profiles';
};

/**
 * Page template for the Discover and Meet pages. Sets up the functionality
 * for the filters and user profiles for discover and meet pages.
 * @param category "projects" for Discover, "profiles" for Meet
 * @returns JSX Element
 */
const DiscoverAndMeet = ({ category }: DiscoverAndMeetProps) => {
  // --------------------
  // Components
  // --------------------
  const [currentSearch, setCurrentSearch] = useState('');

  //Hero banner for profile display
  const profileHero = (
    <div id='discover-hero'>
      {
        <div id="profile-hero-bg1">
          <div id="profile-hero">
            <div id="profile-hero-blurb-1" className="profile-hero-blurb">
              <ThemeImage
                lightSrc={'/assets/bannerImages/people1_light.png'}
                darkSrc={'/assets/bannerImages/people1_dark.png'}
                id={'profile-hero-img-1'}
                alt={'banner image'}
              />
              {/* <div>
                <span className='profile-hero-highlight'>Explore profiles</span> to see each other's personality, expertise, and project history.
              </div> */}
            </div>

            <div id="profile-hero-blurb-2" className="profile-hero-blurb">
              {/* <h2>Look for people to work with!</h2> */}
              <ThemeImage
                lightSrc={'/assets/bannerImages/people2_light.png'}
                darkSrc={'/assets/bannerImages/people2_dark.png'}
                id={'profile-hero-img-2'}
                alt={'banner image'}
              />
              {/* <div className="panel-text">
                Find someone interesting? <span className='profile-hero-highlight'>Send a message!</span><br/>
                <div id='spacer'></div>
                <span className='profile-hero-highlight'>Introduce yourself</span>, share project ideas, and show interest in working together!
              </div> */}
            </div>

            <div id="profile-hero-blurb-3" className="profile-hero-blurb">
              <ThemeImage
                lightSrc={'/assets/bannerImages/people3_light.png'}
                darkSrc={'/assets/bannerImages/people3_dark.png'}
                id={'profile-hero-img-3'}
                alt={'banner image'}
              />
              {/* <div>
                Keep your profile up to date with your skills, project preferences, and interests to 
                <span className='profile-hero-highlight'> find your group!</span>
              </div> */}
            </div>
          </div>
        </div>
      }
    </div>
  );

  // --------------------
  // Global variables
  // --------------------
  // Important for ensuring data has properly loaded
  const [dataLoaded, setDataLoaded] = useState(false);

  // Full data and displayed data based on filter/search query
  const [fullProjectList, setFullProjectList] = useState<ProjectPreview[]>([]);
  const [projectCache, setProjectCache] = useState<NumberDictionary<StructuredProjectInfo>>({});
  const [fetchedProjects, setFetchedProjects] = useState<boolean>(false);

  const [filteredProjectList, setFilteredProjectList] = useState<ProjectPreview[]>([]);

  const [fullUserList, setFullUserList] = useState<UserPreview[]>([]);
  const [userCache, setUserCache] = useState<NumberDictionary<StructuredUserInfo>>({});
  const [fetchedUsers, setFetchedUsers] = useState<boolean>(false);

  const [filteredUserList, setFilteredUserList] = useState<UserPreview[]>([]);

  // List that holds trimmed data for searching. Empty before fullItemList is initialized
  const [projectSearchData, setProjectSearchData] = useState<ProjectPreview[]>([]);
  const [userSearchData, setUserSearchData] = useState<UserPreview[]>([]);

  const [heroProjectList, setHeroProjectList] = useState<ProjectWithFollowers[]>([]);

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [followedProjectIds, setFollowedProjectIds] = useState<Set<number>>(new Set());

  // Format data for use with SearchBar, which requires it to be: [{ data: }]
  const projectDataSet = useMemo(() => {
    return [{ data: projectSearchData }];
  }, [projectSearchData]);
  const userDataSet = useMemo(() => {
    return [{ data: userSearchData }];
  }, [userSearchData]);

  // When passing in data for project carousel, pass in the first three projects after getting their details
  // Hide the carousel while the user has an active search (non-empty search input)
  const heroContent =
    category === 'projects'
      ? (currentSearch && currentSearch.trim() !== '')
        ? null
        : <DiscoverCarousel dataList={heroProjectList} />
      : profileHero;

  // --------------------
  // Helper functions
  // --------------------

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

  // Set the necessary data for project mode
  const setupProjectData = async (projects: ApiResponse<ProjectPreview[]>): Promise<void> => {
    if (!projects.data) return;

    const newProjectCache = projectCache;
    for (const project of projects.data) {

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
    for (let i = 0; i < Math.min(INITIAL_LOAD_COUNT, projects.data.length); i++) {
      const projectPreview = projects.data[i] as ProjectPreview;
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

    setFullProjectList(projects.data);
    setFilteredProjectList(projects.data);

    setProjectSearchData(projects.data);

    getShowcaseDetails(projects.data, newProjectCache);
    setProjectCache(newProjectCache);
  };

  // Set the necessary data for user mode
  const setupUserData = (users: ApiResponse<UserPreview[]>): void => {
    if (!users.data) {
      return;
    }

    const newUserCache = userCache;
    for (const user of users.data) {

      const cachedUser = newUserCache[user.userId];
      if (!cachedUser) {
        newUserCache[user.userId] = { preview: user };
      }
      else {
        cachedUser.preview = user;
      }

    }
    setUserCache(newUserCache);

    setFullUserList(users.data);
    setFilteredUserList(users.data);

    setUserSearchData(users.data);
  };

  /*
    Fetches data from the server to populate the discover page.
    The data is filtered based on the selected category (projects or profiles).
    The function also handles errors and updates the state with the fetched data.
    It uses the getAuth function to get the user ID for follow functionality.
  */
  const getData = async (force: boolean = false) => {
    // Early escape
    if (fetchedProjects && fetchedUsers && !force) return;

    // Get user profile
    //await getAuth();

    try {
      if (category == 'projects') {
        if (!fetchedProjects || force) {
          setFetchedProjects(true);

          const projectResponse = await getProjects();
          const projects = await projectResponse;

          await setupProjectData(projects);
        }
      }
      else {
        if (!fetchedUsers || force) {
          setFetchedUsers(true);
          const userResponse = await getUsers();
          const users = await userResponse;

          setupUserData(users);
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.log(`Unknown error: ${error}`);
      }
    }

    setDataLoaded(true);
  };

  useMemo(() => getData(), []);

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

      const matchIndex = projectSearchData.findIndex(
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
  }, [projectSearchData, fullProjectList, projectCache]);

  /**
   * Updates the filtered project list with new search information
   * @param searchResults
   */
  const searchUsers = useCallback((searchResults: any[][]) => {
    if (!searchResults || !Array.isArray(searchResults)) return;

    // Flatten the nested arrays
    const flatResults = searchResults.flat();
    const matches: UserPreview[] = [];

    for (const result of flatResults) {
      const resultName = result?.username || result?.value || '';
      if (!resultName) continue;

      const matchIndex = userSearchData.findIndex(
        (item) => item.username === resultName
      );

      if (matchIndex !== -1 && fullUserList[matchIndex]) {
        matches.push(fullUserList[matchIndex]);
      }
    }

    setFilteredUserList(matches);
  }, [userSearchData, fullUserList]);

  /**
   * Changes what items are shown to the user whenever a filter has been added or changed
   * @param activeTagFilters Tags that are shown to the user now
   */
  const updateItemList = async (activeTagFilters: Tag[]) => {
    if (category == 'projects') {
      return updateProjectList(activeTagFilters);
    }
    return updateUserList(activeTagFilters);
  };

  // Update the showcased projects after getting more info from the server
  const getShowcaseDetails = async (projectList: ProjectPreview[], usedCache: NumberDictionary<StructuredProjectInfo>) => {
    const focusProjectDetailsList: ProjectWithFollowers[] = [];

    // remove projects without open positions
    // const filteredProjectList = projectList.filter(a => a.jobs.length > 1);

    // create a copy of the array for the carousel
    const carouselProjectList = projectList.slice();

    // Go through carouselProjectList and only keep 3 projects with open positions
    for (const projectPreview of carouselProjectList.sort(() => Math.random() - 0.5)) {
      const cachedFull = usedCache[projectPreview.projectId].full;

      if (cachedFull != undefined) {
        if (cachedFull.jobs.length > 0) {
          focusProjectDetailsList.push(cachedFull);
        }
      }
      else {
        const projectRequest: ApiResponse<ProjectWithFollowers> = await getByID(projectPreview.projectId);

        if (projectRequest.data) {
          if (projectRequest.data.jobs.length > 0) {
            focusProjectDetailsList.push(projectRequest.data);
          }
          usedCache[projectPreview.projectId].full = projectRequest.data;
        } else {
          console.error("Error getting project data from " + projectPreview.projectId);
          return {} as ProjectWithFollowers;
        }
      }

      // Once 3 projects have been added to carousel, break out of loop
      if (focusProjectDetailsList.length == 3) {
        break;
      }
    }

    setHeroProjectList(focusProjectDetailsList);
  }

  /**
   * Changes what projects are shown to the user whenever a filter has been added or changed
   * @param activeTagFilters Tags that are shown to the user now
   */
  const updateProjectList = async (activeTagFilters: Tag[]) => {
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
      //let matchesAny = false;
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
            if (date < cutOff) {
              //matchesAny = true;
              matchesAll = false;
            }
          }
          else if (!projectTypes.includes(tag.label.toLowerCase())) {
            //matchesAny = true;
            matchesAll = false;
          }
        }
        // Purpose tag 
        else if (tag.type === 'Purpose' && item.purpose) {
          const projectPurpose = item.purpose.toLowerCase();
          if (!projectPurpose.includes(tag.label.toLowerCase())) {
            //matchesAny = true;
            matchesAll = false;
          }
        }
        // Tag check can be done by ID: Genre
        else if (tag.tagId && item.tags) {
          const tagIDs = item.tags.map((itemTag) => itemTag.tagId);

          if (!tagIDs.includes(tag.tagId)) {
            //matchesAny = true;
            matchesAll = false;
          }
        }


      }
      //return matchesAny;
      return matchesAll;
    });

    // If no tags are currently selected, render all projects
    // !! Needs to be skipped if searchbar has any input !!
    if (tagFilteredList.length === 0 && activeTagFilters.length === 0) {
      tagFilteredList = JSON.parse(JSON.stringify(fullProjectList));

      setProjectSearchData(fullProjectList);
      setFilteredProjectList(fullProjectList);
      return;
    }

    //doing both updates messes with the display updating
    //setProjectSearchData(tagFilteredList);

    // Set displayed projects
    setFilteredProjectList(tagFilteredList);
  };

  /**
   * Changes what items are shown to the user whenever a filter has been added or changed
   * @param activeTagFilters Tags that are shown to the user now
   */
  const updateUserList = async (activeTagFilters: Tag[]) => {
    const userList = fullUserList;

    // Get user info to match with tags
    const items: UserDetail[] = [];
    for (const item of userList) {
      if (userCache[item.userId].detail != undefined) {
        items.push(userCache[item.userId].detail as UserDetail);
        //return;
      }
      else {
        const userData = await getUsersById(item.userId);
        if (userData.data) {
          items.push(userData.data);
          userCache[item.userId].detail = userData.data;
        } else {
          console.error("Error getting user data for " + item.userId);
        }
      }
    }

    let tagFilteredList = items.filter((item) => {
      if (activeTagFilters.length === 0) return true;
      let matchesAny = false;

      for (const tag of activeTagFilters) {
        // Check for tag label Developer
        if (tag.label === 'Developer' && item.developer) {
          matchesAny = true;
        }
        // Check for specific skills
        else if (tag.type === 'Developer' || tag.type === 'Designer' || tag.type === 'Soft' || tag.type === 'Audio') {
          const userSkills = item.skills?.map((s) => s?.label?.toLowerCase())
            .filter((s) => typeof s === 'string');

          if (userSkills.includes(tag.label.toLowerCase().trim())) {
            matchesAny = true;
          }
        }
        else if (tag.label === 'Designer' && item.designer) {
          matchesAny = true;
        }
        else if (tag.label === 'Audio') {
          //TODO: replace with an item boolean like with designer or developer, probably a backend task
          const userSkills = item.skills?.map((s) => s?.type?.toLowerCase())
            .filter((s) => typeof s === 'string');

          if (userSkills.includes(tag.label.toLowerCase().trim())) matchesAny = true;
        }
        else if (tag.label === 'Soft') {
          //TODO: replace with an item boolean like with designer or developer, probably a backend task
          const userSkills = item.skills?.map((s) => s?.type?.toLowerCase())
            .filter((s) => typeof s === 'string');

          if (userSkills.includes(tag.label.toLowerCase().trim())) matchesAny = true;
        }
        else if (tag.label === 'Other' && !item.designer && !item.developer) {
          matchesAny = true;
        }
        // Check role and major by name since IDs are not unique relative to tags
        /* it seems roles are not yet implemented
        else if (tag.type === 'Role' && item.title) { 
            if (item.bio === tag.label.toLowerCase()) {
              matchesAny = true;
            }
        } */
        else if (tag.type === 'Major' && item.majors) {
          const userMajors = item.majors?.map((s) => s?.label?.toLowerCase())
            .filter((s) => typeof s === 'string');
          if (userMajors.includes(tag.label.toLowerCase())) {
            matchesAny = true;
          }
        }
      }
      return matchesAny;
    });

    // If no tags are currently selected, render all projects
    // !! Needs to be skipped if searchbar has any input !!
    if (tagFilteredList.length === 0 && activeTagFilters.length === 0) {
      tagFilteredList = JSON.parse(JSON.stringify(fullUserList));

      setUserSearchData(fullUserList);
      setFilteredUserList(fullUserList);
      return;
    }
    //doing both updates messes with the display updating
    //setUserSearchData(tagFilteredList);

    // Set displayed projects
    setFilteredUserList(tagFilteredList);
  };

  let discoverPanelContents: React.ReactElement;
  if (category == 'projects') {
    if (!dataLoaded && filteredProjectList.length === 0) {
      discoverPanelContents = (
        <div className='placeholder-spacing'>
          <div className='spinning-loader'></div>
        </div>
      );
    }
    else {
      discoverPanelContents = (
        <PanelBox
          category={category}
          itemList={filteredProjectList}
          projectCache={projectCache}
          followedProjectIds={followedProjectIds}
          userId={currentUserId ?? -1}
        />
      );
    }
  } else {
    if (!dataLoaded && filteredUserList.length === 0) {
      discoverPanelContents = (
        <div className='placeholder-spacing'>
          <div className='spinning-loader'></div>
        </div>
      );
    }
    else {
      discoverPanelContents = (<PanelBox category={category} itemList={filteredUserList} userId={currentUserId ?? -1} />);
    }
  }

  // Main render function
  return (
    <div className="page discover-page" tabIndex={-1} >
      {/* Search bar and profile/notification buttons */}
      <Header dataSets={category == 'projects' ? projectDataSet : userDataSet}
        onSearch={category == 'projects' ? searchProjects : searchUsers}
        value={currentSearch} onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentSearch(e.currentTarget.value)}
        setCurrentUserId={getAuth}
        placeholderText={category == 'projects' ? "Search by Project" : "Search by Name"}
      />
      {/* Contains the hero display, carousel if projects, profile intro if profiles*/}
      {heroContent}

      {/* 
        Contains tag filters & button to access more filters 
        When page loads, determine if project tags or profile tags should be used
        Clicking a tag filter adds it to a list & updates panel display based on that list
        Changes to filters via filter menu are only applied after a confirmation
      */}
      <main id="main" className="discover-main" tabIndex={-1} aria-label='main content'>
        <DiscoverFilters category={category} updateItemList={updateItemList} />

        {/* Panel container. itemAddInterval can be whatever. 25 feels good for now */}
        <div id="discover-panel-box">
          {/* If filteredItemList isn't done loading, display a loading bar */}
          {discoverPanelContents}
        </div>
      </main>
      <ToTopButton />
    </div>
  );
};

// Return projects category
export const Discover = () => {
  return <DiscoverAndMeet category={'projects'} />;
};

// Return profiles category
export const Meet = () => {
  return <DiscoverAndMeet category={'profiles'} />;
};