import React, { useMemo, useState, useCallback, ChangeEvent } from 'react';
// import { DiscoverFilters } from '../DiscoverFilters';
import { Header } from '../Header';
import { PanelBox } from '../PanelBox';
import { ThemeImage } from '../ThemeIcon';
import ToTopButton from '../ToTopButton';

import { getUsers, getUsersById, } from '../../api/users';
import {
  NumberDictionary,
  StructuredUserInfo, UserPreview,
  UserDetail,
  MePrivate,
  Skill
} from '@looking-for-group/shared';
import { DiscoverProfiles } from '../DiscoverProfiles';

enum sortModes {
  "A-Z" = "A-Z",
  "Z-A" = "Z-A",
  "Newest" = "Newest",
  "Oldest" = "Oldest",
}

type FilterData = {
  skills: Skill[],
  filterMode: 'Match All' | 'Match Any'
  sortMode: sortModes,
}

//Stores current filter settings
let filterData: FilterData = { skills: [], filterMode: 'Match All', sortMode: sortModes.Newest };

export const ProfileMeetPage = () => {
  //banner for the meets page
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
                alt={'"Explore Profiles"'}
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
                alt={'"Follow Users"'}
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
                alt={'"Find your Group!"'}
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

  //all of the needed states
  const [loaded, setLoaded] = useState<boolean>(false);
  const [currentSearch, setCurrentSearch] = useState('');
  const [fullUserList, setFullUserList] = useState<UserPreview[]>([]);
  const [userCache, setUserCache] = useState<NumberDictionary<StructuredUserInfo>>({});

  const [filteredUserList, setFilteredUserList] = useState<UserPreview[]>([]);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const userDataSet = useMemo(() => {
    return [{ data: fullUserList }];
  }, [fullUserList]);

  /**
 * Loads the current user and their followed projects so follow icons render immediately.
 */
  const getAuth = async (data: MePrivate | undefined) => {
    if (data) {
      setCurrentUserId(data.userId);
    } else {
      setCurrentUserId(-1);
    }
  };

  // Set the necessary data for user mode
  const setupUserData = async (method: string, invert: boolean) => {
    const userRes = await getUsers(method);

    if (!userRes.data) {
      return;
    }

    const newUserCache = userCache;
    for (const user of userRes.data) {

      const cachedUser = newUserCache[user.userId];
      if (!cachedUser) {
        newUserCache[user.userId] = { preview: user };
      }
      else {
        cachedUser.preview = user;
      }

    }
    setUserCache(newUserCache);

    if (invert) {
      setFullUserList(userRes.data.toReversed());
      setFilteredUserList(userRes.data.toReversed());
    }
    else {
      setFullUserList(userRes.data);
      setFilteredUserList(userRes.data);
    }

    setLoaded(true);
  };

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

      const matchIndex = fullUserList.findIndex(
        (item) => item.username === resultName
      );

      if (matchIndex !== -1 && fullUserList[matchIndex]) {
        matches.push(fullUserList[matchIndex]);
      }
    }

    setFilteredUserList(matches);
  }, [fullUserList]);

  /**
 * Changes what items are shown to the user whenever a filter has been added or changed
 * @param activeTagFilters Tags that are shown to the user now
 */
  const updateUserList = async (activeSkillFilters: Skill[], activeExclusionFilters: Skill[], filterMode: "Match All" | "Match Any", sortMode: sortModes) => {
    if (filterData.sortMode !== sortMode) {
      sortPeople(sortMode);
    }

    filterData = { skills: activeSkillFilters, filterMode, sortMode };

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
      for (let tag of activeExclusionFilters) {
        if ((item.title === tag.label && tag.type === "Role") ||
          item.majors.some(major => major.label === tag.label && major.majorId === tag.skillId) ||
          item.skills.some(skill => skill.type === tag.type && tag.category === "Other") || //.type used instead of .skillId to accomodate for people tab filters, which reference general types and not specific skillIds
          item.skills.some(skill => skill.skillId === tag.skillId))
          return false;
      }
      if (activeSkillFilters.length === 0) return true;
      let matchesAny = false;
      let matchesAll = true;

      for (const tag of activeSkillFilters) {
        // Check for broad filter label Developer
        if (tag.label === 'Developer') {
          if (item.developer)
            matchesAny = true;
          else
            matchesAll = false;
        }
        else if (tag.label === 'Designer') {
          if (item.designer)
            matchesAny = true;
          else
            matchesAll = false;
        }
        else if (tag.label === 'Audio') {
          //TODO: replace with an item boolean like with designer or developer, probably a backend task
          const userSkills = item.skills?.map((s) => s?.type?.toLowerCase())
            .filter((s) => typeof s === 'string');

          if (userSkills.includes(tag.label.toLowerCase().trim()))
            matchesAny = true;
          else
            matchesAll = false;
        }
        else if (tag.label === 'Engineer') {
          //TODO: replace with an item boolean like with designer or developer, probably a backend task
          const userSkills = item.skills?.map((s) => s?.type?.toLowerCase())
            .filter((s) => typeof s === 'string');

          if (userSkills.includes(tag.label.toLowerCase().trim()))
            matchesAny = true;
          else
            matchesAll = false;
        }
        else if (tag.label === 'Other') {
          const types = item.skills?.map(s => s.type);
          if (types.includes("Audio") || types.includes("Designer") || types.includes("Developer") || types.includes("Engineer"))
            matchesAll = false;
          else
            matchesAny = true;
        }
        // Check role and major by name since IDs are not unique relative to tags
        else if (tag.type === 'Role') {
          if (item.title === tag.label)
            matchesAny = true;
          else
            matchesAll = false;
        }
        else if ((tag as { label: string, type: string }).type === 'Major') {
          const userMajors = item.majors?.map((s) => s?.label?.toLowerCase())
            .filter((s) => typeof s === 'string');
          if (userMajors.includes(tag.label.toLowerCase()))
            matchesAny = true;
          else
            matchesAll = false;
        }
        // Check for specific skills
        else {
          const userSkills = item.skills?.map((s) => s?.label?.toLowerCase())
            .filter((s) => typeof s === 'string');

          if (userSkills.includes(tag.label.toLowerCase().trim()))
            matchesAny = true;
          else
            matchesAll = false
        }
      }
      if (filterMode === "Match All")
        return matchesAll;
      else
        return matchesAny;
    });

    // If no tags are currently selected, render all projects
    // !! Needs to be skipped if searchbar has any input !!
    if (activeExclusionFilters.length === 0 && activeSkillFilters.length === 0) {
      tagFilteredList = JSON.parse(JSON.stringify(fullUserList));

      setFilteredUserList(fullUserList);
      return;
    }
    //doing both updates messes with the display updating
    //setUserSearchData(tagFilteredList);

    // Set displayed projects
    setFilteredUserList(tagFilteredList);
  };

  const sortPeople = useCallback((newSortMode?: sortModes) => {
    switch (newSortMode ?? filterData.sortMode) {
      case "A-Z":
        setupUserData("A-Z", false);
        // Compare names
        break;
      case "Z-A":
        // Compare names inverted
        setupUserData("A-Z", true);
        break;
      case "Newest":
        // Compare age
        setupUserData("Newest", false);
        break;
      case "Oldest":
        // Compare age inverted
        setupUserData("Newest", true);
        break;
      default:
        //default to newest first
        setupUserData("Newest", false);
        break;
    }
    if (newSortMode) filterData = { ...filterData, sortMode: newSortMode };
  }, [filterData]);

  useMemo(() => sortPeople(), []);

  let discoverPanelContents: React.ReactElement;
  if (!loaded) {
    discoverPanelContents = (
      <div className='placeholder-spacing'>
        <div className='spinning-loader'></div>
      </div>
    );
  } else {
    discoverPanelContents = (<PanelBox category={'profiles'} itemList={filteredUserList} userId={currentUserId ?? -1} />);
  }

  return (
    <div className="page" tabIndex={-1}>
      {/* Search bar and profile/notification buttons */}
      <Header dataSets={userDataSet}
        onSearch={searchUsers}
        value={currentSearch} onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentSearch(e.currentTarget.value)}
        setCurrentUserId={getAuth}
        placeholderText="Search by Name"
        mobilePlaceholderText="People"
        searchBlocklist={[/*"username"*/]} />
      {/* Contains the hero display, carousel if projects, profile intro if profiles*/}
      {profileHero}

      {/* 
        Contains tag filters & button to access more filters 
        When page loads, determine if project tags or profile tags should be used
        Clicking a tag filter adds it to a list & updates panel display based on that list
        Changes to filters via filter menu are only applied after a confirmation
      */}
      <main id="main" tabIndex={-1} aria-label='main content'>
        <DiscoverProfiles updateItemList={updateUserList} />

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