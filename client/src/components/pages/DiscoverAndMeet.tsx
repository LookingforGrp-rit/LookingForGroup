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
import { Tag, Skill, UserPreview, ProjectPreview } from '@looking-for-group/shared';

//import api utils
import { getCurrentUsername } from '../../api/users.ts'

type DiscoverAndMeetProps = {
  category: 'projects' | 'profiles';
};

const DiscoverAndMeet = ({ category }: DiscoverAndMeetProps) => {
  // Should probably move Interfaces to separate file to prevent duplicates
  // --------------------
  // Interfaces
  // --------------------
  interface ProjectType {
    project_type: string;
  }

  //what is this
  interface Item {
    tags?: Tag[];
    title?: string;
    hook?: string;
    project_types?: ProjectType[];
    job_title?: string;
    major?: string;
    skills?: Skill[];
    first_name?: string;
    last_name?: string;
    username?: string;
    bio?: string;
  }

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
  const [fullItemList, setFullItemList] = useState<Item[]>([]);
  const [filteredItemList, setFilteredItemList] = useState<Item[]>([]);

  // Need this for searching
  const tempItemList: Item[] = fullItemList;

  // List that holds trimmed data for searching. Empty before fullItemList is initialized
  const [itemSearchData, setItemSearchData] = useState<Item[]>([]);

  // Stores userId for ability to follow users/projects
    const [userId, setUserId] = useState<string>('guest');

  // Format data for use with SearchBar, which requires it to be: [{ data: }]
  const dataSet = useMemo(() => {
    return [{ data: itemSearchData }];
  }, [itemSearchData]);

  // When passing in data for project carousel, just pass in first three projects
  const heroContent =
    category === 'projects' ? <DiscoverCarousel dataList={fullItemList.slice(0, 3)} /> : profileHero;

  // --------------------
  // Helper functions
  // --------------------

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
      const response = (category == 'projects') ? await getProjects() : await getUsers();
      console.log(response);
      
      const data = await response;
      console.log('data.data', data.data);

      // Don't assign if there's no array returned
      console.log(data.data == null);
      if (data.data !== null) {
        setFullItemList(data.data!);
        setFilteredItemList(data.data!);
        setItemSearchData(

          // loop through JSON, get data based on category
          data.data.map((item) => {
            if (category === 'projects') {
              const project = item as ProjectPreview;
              return { name: project.title, description: project.hook };
            } else {
              const user = item as UserPreview;
              return {
                name: `${user.firstName} ${user.lastName}`,
                username: user.username,
                //bio: user.bio, //bios are in UserDetail, not in UserPreview. plus why would you need bios fo this little blurb anyway
              };
            }
          })
        );
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

  // Updates filtered project list with new search info
  const searchItems = useCallback((searchResults: any[][]) => { 
    if (!searchResults || !Array.isArray(searchResults)) return;

    // Flatten the nested arrays
    const flatResults = searchResults.flat();
    const matches: Item[] = [];

    for (const result of flatResults) {
      const resultName = result?.name || result?.username || result?.value || '';
      if (!resultName) continue;

      const matchIndex = itemSearchData.findIndex(
        (item) => item.name === resultName || item.username === resultName
      );

      if (matchIndex !== -1 && fullItemList[matchIndex]) {
        matches.push(fullItemList[matchIndex]);
      }
    }

    setFilteredItemList(matches.length ? matches : []);
  }, [itemSearchData, fullItemList]);

  // Updates filtered project list with new tag info
  const updateItemList = async (activeTagFilters: Tag[]) => {
    
    // Get project and user info to match with tags
    const items = await Promise.all(
      tempItemList.map(async (item) => {
        if (category === 'projects') {
          const projectData = await getByID(item.projectId);
          return { ...item, projectData };
        }
        else {
        const userData = await getUsersById(item.userId);
        return { ...item, userData };
        }
      })
    )

    let tagFilteredList = items.filter((item) => {     
     if (activeTagFilters.length === 0) return true;
     let matchesAny = false;
      for (const tag of activeTagFilters) {
        if (category === 'projects') {
          // Check project type by name since IDs are not unique relative to tags
          // Project Type tag
          if (tag.type === 'Project Type' && Array.isArray(item.mediums)) {
              const projectTypes = item.mediums.map((t) => t.label.toLowerCase());
              if (projectTypes.includes(tag.label.toLowerCase())) {
                matchesAny = true;
            } 
          }
          // Purpose tag 
          else if (tag.type === 'Purpose' && item.projectData.data.purpose) {
            const projectPurpose = item.projectData.data.purpose.toLowerCase();
            if (projectPurpose.includes(tag.label.toLowerCase())) {
              matchesAny = true;
            }
          }
          // Tag check can be done by ID: Genre
         else if (tag.tagId && item.projectData.data.tags) {
              const tagIDs = item.projectData.data.tags.map((t) => t.tagId);

              if (tagIDs.includes(tag.tagId)) {
                matchesAny = true;
              }
          }
      } else {
          // Check for tag label Developer
          if (tag.label === 'Developer' && item.developer) {
             matchesAny = true;
          }
          // // Check for specific skills
          else if (tag.type === 'Developer' || tag.type === 'Designer' || tag.type === 'Soft') {
            const userSkills = item.userData.data.skills?.map((s) => s?.label?.toLowerCase())
            .filter((s) => typeof s === 'string');

            if (userSkills.includes(tag.label.toLowerCase().trim())) {
              matchesAny = true;
            }
        }
          // Check for tag label Designer
          else if (tag.label === 'Designer' && item.designer) {
              matchesAny = true;
          }
          else if (tag.label === 'Other' && !item.designer && !item.developer) {
            matchesAny = true;
          } 
          // Check role and major by name since IDs are not unique relative to tags
          //i think i'm beginning to understand
          //did the old team combine all the separate kinds of designations (roles, majors, skills, etc) into just "tags"?
          //which is why all of these are expected to be types that come from a Tag[]?
          //what do i do about that... it sounds like this would have to fundamentally be changed to work with the new system
          else if (tag.type === 'Role' && item.job_title) { 
              if (item.job_title.toLowerCase() === tag.label.toLowerCase()) {
                matchesAny = true;
              }
          } else if (tag.type === 'Major' && item.major) {
              if (item.major.toLowerCase() === tag.label.toLowerCase()) {
                matchesAny = true;
              }
          } 
      }

      return matchesAny;
    }});

    // If no tags are currently selected, render all projects
    // !! Needs to be skipped if searchbar has any input !!
    if (tagFilteredList.length === 0 && activeTagFilters.length === 0) {
      tagFilteredList = JSON.parse(JSON.stringify(fullItemList));
    }

    // Set displayed projects
    setFilteredItemList(tagFilteredList);
  };

  // Main render function
  return (
    <div className="page">
      {/* Search bar and profile/notification buttons */}
      <Header dataSets={dataSet} onSearch={searchItems} />
      {/* Contains the hero display, carousel if projects, profile intro if profiles*/}
      {heroContent}

      {/* Contains tag filters & button to access more filters 
                When page loads, determine if project tags or profile tags should be used
                Clicking a tag filter adds it to a list & updates panel display based on that list
                Changes to filters via filter menu are only applied after a confirmation
            */}
      <DiscoverFilters category={category} updateItemList={updateItemList} />

      {/* Panel container. itemAddInterval can be whatever. 25 feels good for now */}
      <div id="discover-panel-box">
        {/* If filteredItemList isn't done loading, display a loading bar */}
        {(!dataLoaded && filteredItemList.length === 0) ? (
          <div className='spinning-loader'></div>
        ) : (
          <PanelBox category={category} itemList={filteredItemList} itemAddInterval={25} userId={Number(userId)} />
        )}
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
