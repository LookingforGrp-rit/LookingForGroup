import { useMemo, useState, useEffect, useCallback } from 'react';
import CreditsFooter from '../CreditsFooter';
import { DiscoverCarousel } from '../DiscoverCarousel';
import { DiscoverFilters } from '../DiscoverFilters';
import { Header } from '../Header';
import { PanelBox } from '../PanelBox';
import { ThemeImage } from '../ThemeIcon';
import ToTopButton from '../ToTopButton';
import { getProjects, getByID } from '../../api/projects';
import { getUsers, getUsersById } from '../../api/users';
import { ApiResponse, Tag, UserPreview, ProjectPreview, 
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
  //const [fullItemList, setFullItemList] = useState<UserAndProjectInfo[]>([]);
  //const [filteredItemList, setFilteredItemList] = useState<UserAndProjectInfo[]>([]);
  
  const [fullProjectList, setFullProjectList] = useState<ProjectPreview[]>([]);
  const [filteredProjectList, setFilteredProjectList] = useState<ProjectPreview[]>([]);

  const [fullUserList, setFullUserList] = useState<UserPreview[]>([]);
  const [filteredUserList, setFilteredUserList] = useState<UserPreview[]>([]);


  // Need this for searching ?? why in
  //const tempItemList: UserAndProjectInfo[] = fullItemList;

  // List that holds trimmed data for searching. Empty before fullItemList is initialized
  //const [itemSearchData, setItemSearchData] = useState<UserAndProjectInfo[]>([]);
  const [projectSearchData, setProjectSearchData] = useState<ProjectPreview[]>([]);
  const [userSearchData, setUserSearchData] = useState<UserPreview[]>([]);

  // Stores userId for ability to follow users/projects
  const [_userId, setUserId] = useState<string>('guest');

  // Format data for use with SearchBar, which requires it to be: [{ data: }]
  const projectDataSet = useMemo(() => {
    return [{ data: projectSearchData }];
  }, [projectSearchData]);
  const userDataSet = useMemo(() => {
    return [{ data: userSearchData }];
  }, [userSearchData]);

  // When passing in data for project carousel, just pass in first three projects
  const heroContent =
    category === 'projects' ? <DiscoverCarousel dataList={fullProjectList.slice(0, 3) as ProjectWithFollowers[]} /> : profileHero;

  // --------------------
  // Helper functions
  // --------------------

  /**
   * Gets the user's profile by authenticateing the
   * data before setting the user's ID
   */
  const getAuth = async () => {
    const res = await getCurrentUsername();

    if (res.status === 200 && res.data?.username) {
      setUserId(res.data.username)
    } else {
      setUserId('guest');
    }
  }

  // Limits React state update warning
  useEffect(() => {
    getAuth();
  }, []);

  // Set the necessary data for project mode
  const setupProjectData = (projects : ApiResponse<ProjectPreview[]>) : void => {
    if (!projects.data) {
      return;
    }
    setFullProjectList(projects.data);
    setFilteredProjectList(projects.data);

    setProjectSearchData(projects.data);
  };

  // Set the necessary data for user mode
  const setupUserData = (users : ApiResponse<UserPreview[]>) : void => {
    if (!users.data) {
      return;
    }
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
  useEffect(() => {
    const getData = async () => {
      // Get user profile
      await getAuth();

      try {
        if(category == 'projects') {
          const projectResponse = await getProjects();
          const projects = await projectResponse;

          setupProjectData(projects);
        }
        else {
          const userResponse = await getUsers();
          const users = await userResponse;

          setupUserData(users);
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
    getData();
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
  
  /**
   * Changes what projects are shown to the user whenever a filter has been added or changed
   * @param activeTagFilters Tags that are shown to the user now
   */
  const updateProjectList = async (activeTagFilters: Tag[]) => {
    
    const projectList = fullProjectList;

    // Get project and user info to match with tags
    const items : ProjectWithFollowers[] = await Promise.all(
      projectList.map(async (item) => {
        const projectData = await getByID(item.projectId as number);
        if (projectData.data) {
          return projectData.data;
        } else {
          console.error("Error getting project data from " + item.projectId);
          return {} as ProjectWithFollowers;
        }
      })
    );

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

    // Get project and user info to match with tags
    const items : UserDetail[] = await Promise.all(
      userList.map(async (item) => {
        const userData = await getUsersById(item.userId);
        if (userData.data) {
          return userData.data;
        }
        else {
          console.error("Error getting user data for " + item.userId);
          return {} as UserDetail;
        }
      })
    );

    let tagFilteredList = items.filter((item) => {
      if (activeTagFilters.length === 0) return true;
      let matchesAny = false;
      
      for (const tag of activeTagFilters) {
        // Check for tag label Developer
        if (tag.label === 'Developer' && item.developer) {
          matchesAny = true;
        }
        // // Check for specific skills
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
