//Styles
import '../Styles/credits.css';
import '../Styles/discoverMeet.css';
import '../Styles/emailConfirmation.css';
import '../Styles/general.css';
import '../Styles/loginSignup.css';
import '../Styles/messages.css';
import '../Styles/notification.css';
import '../Styles/profile.css';
import '../Styles/projects.css';
import '../Styles/settings.css';
import '../Styles/pages.css';

import { useMemo, useState, useEffect } from 'react';
import CreditsFooter from '../CreditsFooter';
import { DiscoverCarousel } from '../DiscoverCarousel';
import { DiscoverFilters } from '../DiscoverFilters';
import { Header } from '../Header';
import { PanelBox } from '../PanelBox';
import { ThemeIcon } from '../ThemeIcon';
import ToTopButton from '../ToTopButton';
import { devSkills, desSkills } from '../../constants/tags';

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
  interface Tag {
    tag: string;
    color: string;
    id: number;
  }

  interface Skill {
    id: number;
    name: string;
  }

  interface ProjectType {
    project_type: string;
  }

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
              <ThemeIcon
                light={'/assets/bannerImages/people1_light.png'}
                dark={'/assets/bannerImages/people1_dark.png'}
                id={'profile-hero-img-1'}
                alt={'banner image'}
              />
              {/* <div>
                            <span className='profile-hero-highlight'>Explore profiles</span> to see each other's personality, expertise, and project history.
                            </div> */}
            </div>

            <div id="profile-hero-blurb-2" className="profile-hero-blurb">
              {/* <h2>Look for people to work with!</h2> */}
              <ThemeIcon
                light={'/assets/bannerImages/people2_light.png'}
                dark={'/assets/bannerImages/people2_dark.png'}
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
              <ThemeIcon
                light={'/assets/bannerImages/people3_light.png'}
                dark={'/assets/bannerImages/people3_dark.png'}
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
  let tempItemList: Item[] = fullItemList;

  // List that holds trimmed data for searching. Empty before fullItemList is initialized
  const [itemSearchData, setItemSearchData] = useState([]);

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
  const getData = async () => {
    // Get user profile
    await getAuth();

    const url = `/api/${category === 'projects' ? 'projects' : 'users'}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      // Don't assign if there's no array returned
      if (data.data !== undefined) {
        setFullItemList(data.data);
        setFilteredItemList(data.data);
        setItemSearchData(

          // loop through JSON, get data based on category
          data.data.map((item) => {
            if (category === 'projects') {
              return { name: item.title, description: item.hook };
            } else {
              return {
                name: `${item.first_name} ${item.last_name}`,
                username: item.username,
                bio: item.bio,
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

  if (!dataLoaded) {
    getData();
  }

  // Updates filtered project list with new search info
  const searchItems = (searchResults) => {
    // Clear list before handling search
    tempItemList = [];

    for (const result of searchResults[0]) {
      for (const item of itemSearchData) {
        if (result === item) {
          tempItemList.push(fullItemList[itemSearchData.indexOf(item)]);
          continue;
        }
      }
    }

    // If no items were found
    if (tempItemList.length === 0) {
      setFilteredItemList([]); // Clear the displayed list
      console.log('No matching items found.');
    } else {
      // setFilteredItemList(tempItemList);
      updateItemList([]); // Don't check for tags after searching
    }
  };

  // Updates filtered project list with new tag info
  const updateItemList = (activeTagFilters) => {
    let tagFilteredList = tempItemList.filter((item) => {
      let tagFilterCheck = true;

      for (const tag of activeTagFilters) {
        if (category === 'projects') {
          // Check project type by name since IDs are not unique relative to tags
          if (tag.type === 'Project Type') {
            if (item.project_types) {
              const projectTypes = item.project_types.map((tag) => tag.project_type.toLowerCase());

              if (!projectTypes.includes(tag.label.toLowerCase())) {
                tagFilterCheck = false;
                break;
              }
            } else {
              tagFilterCheck = false;
              break;
            }
          }

          // Tag check can be done by ID
          if (tag.tag_id) {
            if (item.tags) {
              const tagIDs = item.tags.map((tag) => tag.id);

              if (!tagIDs.includes(tag.tag_id)) {
                tagFilterCheck = false;
                break;
              }
            } else {
              tagFilterCheck = false;
              break;
            }
          }
        } else {
          // Check for tag label Developer
          if (tag.label === 'Developer') {
            if (item.skills) {
              // Get all skills from users
              const userSkills = item.skills.map((skill) => skill?.skill?.toLowerCase?.())
                .filter((label) => typeof label === 'string');

              // Check if skills match developer skills
              const matched = devSkills.some((dev) => userSkills.includes(dev.toLowerCase().trim()));

              if (!matched) {
                // No match: exclude from results
                tagFilterCheck = false;
                break;
              }
            }
            else {
              // No skills: exclude from results
              tagFilterCheck = false;
              break;
            }
          }
          // Check for specific skills
          else if (tag.type === 'Developer Skill' || tag.type === 'Designer Skill' || tag.type === 'Soft Skill') {
            const userSkills = item.skills?.map((s) => s?.skill?.toLowerCase())
            .filter((s) => typeof s === 'string');

            const matched = userSkills?.includes(tag.label.toLowerCase());

            if (!matched) {
              // No match: exclude from results
              tagFilterCheck = false;
              break;
            }
          }
          // Check for tag label Designer
          else if (tag.label === 'Designer') {
            if (item.skills) {
              // Get all skills from user
              const userSkills = item.skills.map((skill) => skill?.skill?.toLowerCase?.())
                .filter((label) => typeof label === 'string');

              // Check if skills match designer skills
              const matched = desSkills.some((des) => userSkills.includes(des.toLowerCase()));

              if (!matched) {
                // No match: exclude from results
                tagFilterCheck = false;
                break;
              }
            } else {
              // No match: exclude from results
              tagFilterCheck = false;
              break;
            }
          }
          // Check role and major by name since IDs are not unique relative to tags
          else if (tag.type === 'Role') {
            if (item.job_title) {
              if (item.job_title.toLowerCase() !== tag.label.toLowerCase()) {
                tagFilterCheck = false;
                break;
              }
            } else {
              tagFilterCheck = false;
              break;
            }
          } else if (tag.type === 'Major') {
            if (item.major) {
              if (item.major.toLowerCase() !== tag.label.toLowerCase()) {
                tagFilterCheck = false;
                break;
              }
            } else {
              tagFilterCheck = false;
              break;
            }
          } else if (tag.tag_id) {
            // Skill check can be done by ID
            if (item.skills) {
              const skillIDs = item.skills.map((skill) => skill.id);

              if (!skillIDs.includes(tag.tag_id)) {
                tagFilterCheck = false;
                break;
              }
            } else {
              tagFilterCheck = false;
              break;
            }
          }
        }
      }

      return tagFilterCheck;
    });

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
          <PanelBox category={category} itemList={filteredItemList} itemAddInterval={25} userId={userId} />
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
