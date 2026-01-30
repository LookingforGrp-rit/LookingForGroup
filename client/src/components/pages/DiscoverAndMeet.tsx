import { useMemo, useState, useCallback } from 'react';
import CreditsFooter from '../CreditsFooter';
import { DiscoverCarousel } from '../DiscoverCarousel';
import { DiscoverFilters } from '../DiscoverFilters';
import { Header } from '../Header';
import { PanelBox } from '../PanelBox';
import { ThemeImage } from '../ThemeIcon';
import ToTopButton from '../ToTopButton';
import { getProjects, getByID } from '../../api/projects';
import { getUsers, getUsersById } from '../../api/users';
import { ApiResponse, Tag, NumberDictionary, StructuredProjectInfo,
    StructuredUserInfo, UserPreview, ProjectPreview, 
    UserDetail, ProjectWithFollowers } from '@looking-for-group/shared';

//import api utils
import { getCurrentUsername } from '../../api/users.ts'

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
  //Hero banner for profile display
  const profileHero = (
    <div id='discover-hero'>
      {
        <div id="profile-hero-bg1">
          <div id="profile-hero">
            <div id="profile-hero-blurb-1" className="profile-hero-blurb">
              <ThemeImage
                lightSrc={'assets/bannerImages/people1_light.png'}
                darkSrc={'assets/bannerImages/people1_dark.png'}
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
                lightSrc={'assets/bannerImages/people2_light.png'}
                darkSrc={'assets/bannerImages/people2_dark.png'}
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
                lightSrc={'assets/bannerImages/people3_light.png'}
                darkSrc={'assets/bannerImages/people3_dark.png'}
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
  //const [itemSearchData, setItemSearchData] = useState<UserAndProjectInfo[]>([]);
  const [projectSearchData, setProjectSearchData] = useState<ProjectPreview[]>([]);
  const [userSearchData, setUserSearchData] = useState<UserPreview[]>([]);

  const [heroProjectList, setHeroProjectList] = useState<ProjectWithFollowers[]>([]);

  // Stores userId for ability to follow users/projects
  const [userId, setUserId] = useState<string>('');

  // Format data for use with SearchBar, which requires it to be: [{ data: }]
  const projectDataSet = useMemo(() => {
    return [{ data: projectSearchData }];
  }, [projectSearchData]);
  const userDataSet = useMemo(() => {
    return [{ data: userSearchData }];
  }, [userSearchData]);

  // When passing in data for project carousel, pass in the first three projects after getting their details
  const heroContent =
    category === 'projects' ? <DiscoverCarousel dataList={heroProjectList} /> : profileHero;
  
  // --------------------
  // Helper functions
  // --------------------

  /**
   * Gets the user's profile by authenticateing the
   * data before setting the user's ID
   */
  const getAuth = async () => {
    if (userId != "") {
      return;
    }

    const res = await getCurrentUsername();

    if (res.status === 200 && res.data?.username && userId == "") {
      setUserId(res.data.username)
    } else {
      setUserId('guest');
    }
  }

  // Set the necessary data for project mode
  const setupProjectData = (projects : ApiResponse<ProjectPreview[]>) : void => {
    if (!projects.data) {
      return;
    }

    const newProjectCache = projectCache;
    for (let project of projects.data) {

      const cachedProject = newProjectCache[project.projectId];
      if (!cachedProject) {
        newProjectCache[project.projectId] = { preview: project };
      }
      else {
        cachedProject.preview = project;
      }
    
    }

    setFullProjectList(projects.data);
    setFilteredProjectList(projects.data);

    setProjectSearchData(projects.data);
    
    getShowcaseDetails(projects.data, newProjectCache);
    setProjectCache(newProjectCache);
  };

  // Set the necessary data for user mode
  const setupUserData = (users : ApiResponse<UserPreview[]>) : void => {
    if (!users.data) {
      return;
    }

    const newUserCache = userCache;
    for (let user of users.data) {

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
    const getData = async (force : boolean = false) => {
      // Early escape
      if (fetchedProjects && fetchedUsers && !force) {
        return;
      }

      // Get user profile
      await getAuth();

      try {
        if(category == 'projects') {
          if (!fetchedProjects || force) {
            setFetchedProjects(true);

            const projectResponse = await getProjects();
            const projects = await projectResponse;

            setupProjectData(projects);
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

    for (const result of flatResults) {
      const resultName = result?.title || result?.name || result?.value || '';
      if (!resultName) continue;

      const matchIndex = projectSearchData.findIndex(
        (item) => item.title === resultName
      );

      if (matchIndex !== -1 && fullProjectList[matchIndex]) {
        matches.push(fullProjectList[matchIndex]);
      }
    }
    
    setFilteredProjectList(matches);
  }, [projectSearchData, fullProjectList]);

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
  const getShowcaseDetails = async (projectList : ProjectPreview[], usedCache : NumberDictionary<StructuredProjectInfo>) => {
    const focusProjectDetailsList : ProjectWithFollowers[] = [];
    for (let projectPreview of projectList.slice(0, 3)) {
      if (usedCache[projectPreview.projectId].full != undefined) {
        continue;
      }

      const projectRequest : ApiResponse<ProjectWithFollowers> = await getByID(projectPreview.projectId);

      if (projectRequest.data) {
        focusProjectDetailsList.push(projectRequest.data);
        usedCache[projectPreview.projectId].full = projectRequest.data;
      } else {
        console.error("Error getting project data from " + projectPreview.projectId);
        return {} as ProjectWithFollowers;
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
    const items : ProjectWithFollowers[] = [];
    for (let item of projectList) {
      if (projectCache[item.projectId].full != undefined) {
        items.push(projectCache[item.projectId].full as ProjectWithFollowers);
        return;
      }

      const projectData = await getByID(item.projectId);
      if (projectData.data) {
        items.push(projectData.data);
        projectCache[item.projectId].full = projectData.data;
      } else {
        console.error("Error getting project data from " + item.projectId);
      }
    }

    let tagFilteredList = items.filter((item) => {
     if (activeTagFilters.length === 0) return true;
     let matchesAny = false;
      for (const tag of activeTagFilters) {
        // Check project type by name since IDs are not unique relative to tags
        // Project Type tag
        if (tag.type === 'Project Type' && Array.isArray(item.mediums)) {
            const projectTypes = item.mediums.map((t) => t.label.toLowerCase());
            if (projectTypes.includes(tag.label.toLowerCase())) {
              matchesAny = true;
          } 
        }
        // Purpose tag 
        else if (tag.type === 'Purpose' && item.purpose) {
          const projectPurpose = item.purpose.toLowerCase();
          if (projectPurpose.includes(tag.label.toLowerCase())) {
            matchesAny = true;
          }
        }
        // Tag check can be done by ID: Genre
        else if (tag.tagId && item.tags) {
            const tagIDs = item.tags.map((itemTag) => itemTag.tagId);
        
            if (tagIDs.includes(tag.tagId)) {
              matchesAny = true;
            }
        }
      
      return matchesAny;
    }});

    // If no tags are currently selected, render all projects
    // !! Needs to be skipped if searchbar has any input !!
    if (tagFilteredList.length === 0 && activeTagFilters.length === 0) {
      tagFilteredList = JSON.parse(JSON.stringify(fullProjectList));

      setProjectSearchData(fullProjectList);
      setFilteredProjectList(fullProjectList);
      return;
    }
    
    setProjectSearchData(tagFilteredList);

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
    const items : UserDetail[] = [];
    for (let item of userList) {
      if (userCache[item.userId].detail != undefined) {
        items.push(userCache[item.userId].detail as UserDetail);
        return;
      }

      const userData = await getUsersById(item.userId);
      if (userData.data) {
        items.push(userData.data);
        userCache[item.userId].detail = userData.data;
      } else {
        console.error("Error getting user data for " + item.userId);
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
        else if (tag.type === 'Developer' || tag.type === 'Designer' || tag.type === 'Soft') {
          const userSkills = item.skills?.map((s) => s?.label?.toLowerCase())
            .filter((s) => typeof s === 'string');
            
          if (userSkills.includes(tag.label.toLowerCase().trim())) {
            matchesAny = true;
          }
        }
        else if (tag.label === 'Designer' && item.designer) {
            matchesAny = true;
        }
        else if (tag.label === 'Other' && !item.designer && !item.developer) {
          matchesAny = true;
        } 
        // Check role and major by name since IDs are not unique relative to tags
        /* These appear to be unused
        else if (tag.type === 'Role' && item.job_title) { 
            if (item.job_title.toLowerCase() === tag.label.toLowerCase()) {
              matchesAny = true;
            }
        } else if (tag.type === 'Major' && item.major) {
            if (item.major.toLowerCase() === tag.label.toLowerCase()) {
              matchesAny = true;
            }
        }
        */
        return matchesAny;
      }
    });

    // If no tags are currently selected, render all projects
    // !! Needs to be skipped if searchbar has any input !!
    if (tagFilteredList.length === 0 && activeTagFilters.length === 0) {
      tagFilteredList = JSON.parse(JSON.stringify(fullUserList));

      setUserSearchData(fullUserList);
      setFilteredUserList(fullUserList);
      return;
    }

    setUserSearchData(tagFilteredList);

    // Set displayed projects
    setFilteredUserList(tagFilteredList);
  };

  let discoverPanelContents : React.ReactElement;
  if (category == 'projects') {
    if(!dataLoaded && filteredProjectList.length === 0) {
      discoverPanelContents = (<div className='spinning-loader'></div>);
    }

    discoverPanelContents = (<PanelBox category={category} itemList={filteredProjectList} itemAddInterval={25} />);
  } else {
    if(!dataLoaded && filteredUserList.length === 0) {
      discoverPanelContents = (<div className='spinning-loader'></div>);
    }
    
    discoverPanelContents = (<PanelBox category={category} itemList={filteredUserList} itemAddInterval={25} />);
  }

  // Main render function
  return (
    <div className="page">
      {/* Search bar and profile/notification buttons */}
      <Header dataSets={ category == 'projects' ? projectDataSet : userDataSet }
          onSearch={ category == 'projects' ? searchProjects : searchUsers }
          value={undefined} onChange={undefined} />
      {/* Contains the hero display, carousel if projects, profile intro if profiles*/}
      {heroContent}

      {/* 
        Contains tag filters & button to access more filters 
        When page loads, determine if project tags or profile tags should be used
        Clicking a tag filter adds it to a list & updates panel display based on that list
        Changes to filters via filter menu are only applied after a confirmation
      */}
      <DiscoverFilters category={category} updateItemList={updateItemList} />

      {/* Panel container. itemAddInterval can be whatever. 25 feels good for now */}
      <div id="discover-panel-box">
        {/* If filteredItemList isn't done loading, display a loading bar */}
        { discoverPanelContents }
      </div>
      <CreditsFooter />
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
