import { ProjectCard } from '../ProjectCard';
import { ProfileCard } from '../ProfileCard';
import { ProjectPanel } from '../ProjectPanel';
import { ProfilePanel } from '../ProfilePanel';
import { DiscoverButton } from '../DiscoverButton';
import { SearchBar } from '../SearchBar';
import { TagFilter } from '../TagFilter';
import { projects } from '../../constants/fakeData'; // FIXME: use project data in db
import { profiles } from '../../constants/fakeData'; // FIXME: use user data in db
import { useState } from 'react';
import { useEffect } from 'react';
import CreditsFooter from '../CreditsFooter';
import ToTopButton from '../ToTopButton';

//These values need to be outside the component, otherwise they get reset every time it re-renders
//List that holds project data that will be displayed. Changes along with search parameters
let projectList = projects;
//Variable that tracks what position we are at in the above array
let projectListPosition: number = 0;

//List that holds profile data that will be displayed. Changes along with search parameters
let profileList = profiles;
//Variable that tracks what position we are at in the above array
let profileListPosition: number = 0;
//Create array of profiles to help track the order they were added
const displayedProfileList: { profile; height: number }[] = [];
//Create array of height trackers to track total height in each column
let heightTrackers: number[];

//the main discover page- see a list of people and projects
const Home = (props) => {
  const username = 'placeholder';

  /* useEffect(() => {
        console.log("edfsefgsergf");
        const fetchUsername = async () => {
            console.log("fetchUsername launched");
            try {
                console.log("gobbledegook");
                const response = await fetch("/api/users/get-username-session");
                console.log("gobbledegook 2");
                console.log(response);
                // The response was commented out
                if (!response.ok) {
                    throw new Error("Bad response");
                }
                console.log("gobbledegook 3");
                const data = await response.json();
                console.log(data);
                username = data;
                console.log(username);
            }   catch (err) {
                if (err instanceof Error) {
                    
                }
            }
        }

        // This block was commented out
        fetch("api/users/get-username-session")
            .then((response) => {
                return response.json();
            })
            .then((data) => {
                console.log(data);
                username = data;
            })

        sendGet("/api/users/get-username-sessio");

        //username = GET("api/users/get-username-session");
        fetchUsername();
        console.log(username);
    }, []); */

  // Sets the default content of the page to be 'projects' and
  // listens to changes in the tab
  const DEFAULT_TAB = 'Projects';
  const [selectedTab, setSelectedTab] = useState(DEFAULT_TAB);

  // --- Searching ---

  const [filteredProjects, setFilteredProjects] = useState(projects);
  const [filteredProfiles, setFilteredProfiles] = useState(profiles);

  const HandleSearch = (results) => {
    setFilteredProjects(results[0]);
    setFilteredProfiles(results[1]);
  };

  //--------------------------

  //To-do:
  //Ensure that each project is only displayed once*
  //Integrate search functionality
  //Maybe add tag filter functionality too? (and combine with search?)
  //Ensure it at least works with mobile view

  //Gets the width of the scrollbar
  //Obtained from https://stackoverflow.com/questions/13382516/getting-scroll-bar-width-using-javascript
  function getScrollbarWidth() {
    // Creating invisible container
    const outer = document.createElement('div');
    outer.style.visibility = 'hidden';
    outer.style.overflow = 'scroll'; // forcing scrollbar to appear
    outer.style.msOverflowStyle = 'scrollbar'; // needed for WinJS apps
    document.body.appendChild(outer);

    // Creating inner element and placing it in the container
    const inner = document.createElement('div');
    outer.appendChild(inner);

    // Calculating difference between container's full width and the child width
    const scrollbarWidth = outer.offsetWidth - inner.offsetWidth;

    // Removing temporary elements from the DOM
    if(outer.parentNode) outer.parentNode.removeChild(outer);

    return scrollbarWidth;
  }

  //Find out the width of the flexbox container
  let flexboxWidth: number = window.innerWidth - 220 - getScrollbarWidth();
  //tracks the width of items in the current flexbox row
  let widthTracker: number = -20;
  //tracks the number of "full" flexbox rows
  let rowTracker: number = 0;
  //tracks the number of project panels that will be placed in a row
  let projectTracker: number = 0;

  //Loads a new set of project panels to render
  //Calls when page first loads & when a new list of projects is being used (e.g. after a search)
  const firstContent = (newProjectList) => {
    //Set new project list to run through
    projectList = newProjectList;
    //Reset projectListPosition
    projectListPosition = 0;

    //empty list of projects to display
    //(Will also include project data when actual projects are used)
    const projectsToDisplay: { project; width: number; adjust: number; row: number }[] = [];

    //Reset variables, if needed
    widthTracker = -20;
    rowTracker = 0;
    projectTracker = 0;

    //Set up initial project (ensures first row has something in it)
    const firstPanelWidth = Math.floor(Math.random() * 200 + 200);
    widthTracker += firstPanelWidth + 24;
    projectsToDisplay.push({
      project: projectList[projectListPosition],
      width: firstPanelWidth,
      adjust: 0,
      row: rowTracker,
    });
    projectListPosition++;
    projectTracker++;

    //Start iterating through projects
    //(For testing purposes, will just loop until break condition is met)
    while (rowTracker <= 5 && projectListPosition < projectList.length) {
      //Get a width value based on the project's display image's aspect ratio
      //Formula for getting width from image:
      /*
            (image height) / X = 100px
            (image height) = 100px * X
            X = (image height) / 100px;
            (image width) / X = final width

            (image width) / ((image height) / 100px) = final width


            (image height) * X = 100px
            X = 100px / (image height)

            (image width) * (100px / (image height)) = final width [we'll use this one]
            */
      //(For testing's sake, width will be randomized)
      ///let panelWidth = imageWidth * (100 / imageHeight); [Use this when images are integrated]
      const panelWidth = Math.floor(Math.random() * 200 + 200);
      //Add (width value + flexbox gap value + borders) to width tracker
      //Note - borders & other factors may add extra width, double check calculations using inspector
      widthTracker += panelWidth + 24;
      //if width tracker > flexbox width, make final adjustments to row before moving to next
      if (widthTracker > flexboxWidth) {
        //Calculate flexboxWidth - total width of all projects
        const flexboxDifference = flexboxWidth - (widthTracker - (panelWidth + 24));
        //Divide difference to split among project panels' widths (and the remainder);
        const widthAdjustment = Math.floor(flexboxDifference / projectTracker);
        let widthAdjustmentRemainder = flexboxDifference % projectTracker;
        //Loop through all projects inside the most recently completed row
        for (const project of projectsToDisplay) {
          //Find projects of the current row being adjusted
          if (project.row === rowTracker) {
            //Divide difference evenly amongst all project's widths
            //project.width += widthAdjustment + widthAdjustmentRemainder;
            project.adjust = widthAdjustment + widthAdjustmentRemainder;
            //remove remainder once it is used once
            widthAdjustmentRemainder = 0;
          }
        }
        //Increment row tracker
        rowTracker++;
        //Reset width tracker to negative of the flexbox gap value
        widthTracker = panelWidth + 4;
        //Reset project tracker
        projectTracker = 0;
      }
      //if row tracker < a designated row count...
      if (rowTracker < 5) {
        //Add current project to list of projects to display
        //(Will include actual projects later)
        projectsToDisplay.push({
          project: projectList[projectListPosition],
          width: panelWidth,
          adjust: 0,
          row: rowTracker,
        });
        projectListPosition++;
        projectTracker++;
      } else {
        //otherwise...
        //Break project iteration loop
        break;
      }
    }

    return projectsToDisplay;
  };

  //Holds data for currently displayed projects
  const [displayedProjects, setDisplayedProjects] = useState<
    { project; width: number; adjust: number; row: number }[]
  >(() => firstContent(projects));

  //Function that adds more panels to render, called when the user scrolls to the bottom of the page
  const addContent = () => {
    const { scrollTop, scrollHeight, clientHeight } = document.querySelector('.page');

    if (scrollTop + clientHeight >= scrollHeight) {
      //calls profile adding instead if on profile tab, may change if pages are separated
      if (selectedTab === 'eee') {
        addProfiles();
        return;
      }

      const newProjectsToDisplay: { project; width: number; adjust: number; row: number }[] = [];

      //Reset calculation values
      widthTracker = -20;
      const lastRow = displayedProjects[displayedProjects.length - 1].row + 1;
      rowTracker = displayedProjects[displayedProjects.length - 1].row + 1;
      projectTracker = 0;

      while (rowTracker <= lastRow + 5 && projectListPosition < projectList.length) {
        //Get a width value based on the project's display image's aspect ratio
        //let panelWidth = imageWidth * (100 / imageHeight); [Use this when images are integrated]
        const panelWidth = Math.floor(Math.random() * 200 + 200);
        //Add (width value + flexbox gap value + borders) to width tracker
        widthTracker += panelWidth + 24;
        if (widthTracker > flexboxWidth) {
          const flexboxDifference = flexboxWidth - (widthTracker - (panelWidth + 24));
          //Divide difference to split among project panels' widths (and the remainder);
          const widthAdjustment = Math.floor(flexboxDifference / projectTracker);
          let widthAdjustmentRemainder = flexboxDifference % projectTracker;
          //Loop through all projects inside the most recently completed row
          for (const project of newProjectsToDisplay) {
            if (project.row === rowTracker) {
              //Divide difference evenly amongst all project's widths
              project.adjust = widthAdjustment + widthAdjustmentRemainder;
              widthAdjustmentRemainder = 0;
            }
          }
          rowTracker++;
          widthTracker = panelWidth + 4;
          projectTracker = 0;
        }
        if (rowTracker < lastRow + 5) {
          //Add current project to list of projects to display
          newProjectsToDisplay.push({
            project: projectList[projectListPosition],
            width: panelWidth,
            adjust: 0,
            row: rowTracker,
          });
          projectListPosition++;
          projectTracker++;
        } else {
          break;
        }
      }

      //Append new project list to existing one
      setDisplayedProjects(displayedProjects.concat(newProjectsToDisplay));
    }
  };

  //Whenever window gets resized, updates the display of project panels
  //Tracks the time of the most recent call
  let lastResizeCall: number = 0;

  //Adjusts display to fit resized window, called whenever window size is adjusted
  const resizeDisplay = () => {
    //Get time this function was called
    const thisCall: number = new Date().getTime();
    lastResizeCall = thisCall;
    //Set timer to check whether to continue this call or not
    setTimeout(() => {
      //If this is no longer the most recent call, stop this call
      if (lastResizeCall !== thisCall) {
        return;
      }

      //For testing use, may change if projects & profiles are on separate pages
      //If current tab is on profiles, run profile resizing instead
      if (selectedTab === 'People') {
        resizeProfiles();
        return;
      }

      //Similar to initial project panel rendering, just uses all currently displays projects
      //instead of adding new ones
      //Array holding edited project details
      const resizedProjects: { project; width: number; adjust: number; row: number }[] = [];
      //Calculate new flexbox width
      flexboxWidth = window.innerWidth - 220 - getScrollbarWidth();
      //Reset tracker variables (widthTracker, rowTracker, projectTracker)
      widthTracker = -20;
      rowTracker = 0;
      projectTracker = 0;
      //Iterate through all currently displayed projects
      //For each project...
      for (const project of displayedProjects) {
        //Add width to widthTracker
        widthTracker += project.width + 24;
        //If widthTracker > flexbox width...
        if (widthTracker > flexboxWidth) {
          //Calculate remaining width (minus current project, that moves to next row)
          const flexboxDifference = flexboxWidth - (widthTracker - (project.width + 24));
          //Divide remaining width amongst current row's project panels (add remainder to first panel)
          const widthAdjustment = Math.floor(flexboxDifference / projectTracker);
          let widthRemainder = flexboxDifference % projectTracker;
          for (const rowProject of resizedProjects) {
            if (rowProject.row === rowTracker) {
              rowProject.adjust = widthAdjustment + widthRemainder;
              widthRemainder = 0;
            }
          }
          //Increment & reset tracker variables
          rowTracker++;
          widthTracker = project.width + 4;
          projectTracker = 0;
        }
        //Add project to resized projects &  increment projectTracker
        resizedProjects.push({
          project: project.project,
          width: project.width,
          adjust: 0,
          row: rowTracker,
        });
        projectTracker++;
      }
      //Perform width adjustment on last row
      //Calculate remaining width
      const flexboxDifference = flexboxWidth - widthTracker;
      //Divide remaining width amongst current row's project panels (add remainder to first panel)
      const widthAdjustment = Math.floor(flexboxDifference / projectTracker);
      let widthRemainder = flexboxDifference % projectTracker;
      for (const rowProject of resizedProjects) {
        if (rowProject.row === rowTracker) {
          rowProject.adjust = widthAdjustment + widthRemainder;
          widthRemainder = 0;
        }
      }

      //Set displayed projects state
      setDisplayedProjects(resizedProjects);
    }, 100);
  };

  //Runs resizing function whenever window width changes
  //Don't add dependencies to it - it causes state to be reset for some reason (I don't know why)
  useEffect(() => {
    window.addEventListener('resize', resizeDisplay);
    return () => {
      window.removeEventListener('resize', resizeDisplay);
    };
  });

  //Variables and functions past this point will be used for profile panel displays
  //Profile rendering will use multiple flexbox columns

  const firstProfiles = (newProfileList) => {
    profileList = newProfileList;
    profileListPosition = 0;
    //Reset height trackers
    heightTrackers = [];
    //Calculate the width of available space (flexboxWidth contains this in this file)
    //Divide that width and determine how many columns can fit
    const totalColumns = Math.floor(flexboxWidth / 224);
    //Create a number of arrays to hold profile panels equal to the number of columns
    //Also, create height trackers for each column
    const columnsToDisplay: { profile; height: number }[][] = [];
    for (let i = 0; i < totalColumns; i++) {
      columnsToDisplay.push([]);
      heightTrackers.push(0);
    }
    //Start iterating through profiles (set limit of 30 profiles at first render)
    //For each profile... (until all profiles are used or 30 are used)
    for (let i = 0; i < 30; i++) {
      //If there are no more profiles to use, break this loop
      if (profileListPosition >= profileList.length) {
        break;
      }
      //Calculate height based off of image + any extra space for info
      //(For testing purposes, height is randomized)
      const panelHeight = Math.floor(Math.random() * 300 + 200);
      //Check which column has the least height currently (if multiple have same, use first)
      let shortestColumn = 0;
      for (let j = 1; j < heightTrackers.length; j++) {
        if (heightTrackers[j] < heightTrackers[shortestColumn]) {
          shortestColumn = j;
        }
      }
      //Add current profile to column with least height
      columnsToDisplay[shortestColumn].push({ profile: profileList[i], height: panelHeight });
      //Also add current profile to displayedProfileList
      displayedProfileList.push({ profile: profileList[i], height: panelHeight });
      profileListPosition++;
      //Add profile height to column's height tracker
      heightTrackers[shortestColumn] += panelHeight;
    }

    //Return full set of arrays
    return columnsToDisplay;
  };

  const [profileColumns, setProfileColumns] = useState<{ profile; height: number }[][]>(() =>
    firstProfiles(profiles)
  );

  //Function that handles resizing of profile panels
  const resizeProfiles = () => {
    //Check current flexbox width & number of columns it can hold
    flexboxWidth = window.innerWidth - 224 - getScrollbarWidth();
    const newColumns = Math.floor(flexboxWidth / 224);
    //If number of columns available has changed...
    if (newColumns !== heightTrackers.length) {
      //Construct new array to contain resized column info
      const resizedColumnsToDisplay: { profile; height: number }[][] = [];
      //Reset all height trackers
      for (let i = 0; i < heightTrackers.length; i++) {
        heightTrackers[i] = 0;
      }
      //Check if more or less columns are available
      //If less...
      if (newColumns < heightTrackers.length) {
        //Remove height trackers that go beyond limit
        while (heightTrackers.length > newColumns) {
          heightTrackers.pop();
        }
      } else {
        //else (if more)...
        //Add height trackers to match new limit
        while (heightTrackers.length < newColumns) {
          heightTrackers.push(0);
        }
      }
      //Fill new column info array with empty arrays
      for (let i = 0; i < heightTrackers.length; i++) {
        resizedColumnsToDisplay.push([]);
      }
      //Get current set of displayed profiles (not profileColumns, need an unaltered list)
      //For each profile...
      for (const profile of displayedProfileList) {
        //Check which column has the least height currently (use first if there's a tie)
        let shortestColumn = 0;
        for (let i = 1; i < heightTrackers.length; i++) {
          if (heightTrackers[i] < heightTrackers[shortestColumn]) {
            shortestColumn = i;
          }
        }
        //Add profile to the least tallest column currently
        resizedColumnsToDisplay[shortestColumn].push({
          profile: profile.profile,
          height: profile.height,
        });
        //Add profile height to the column's height tracker
        heightTrackers[shortestColumn] += profile.height;
      }
      //Set profileColumns to newly created resized columns
      setProfileColumns(resizedColumnsToDisplay);
    }
  };

  //Function that handles adding new profiles when scrolling to the bottom of the page
  const addProfiles = () => {
    //Get current set of displayed profiles
    const newProfilePanels: { profile; height: number }[][] = JSON.parse(
      JSON.stringify(profileColumns)
    );
    //Find where we left off on the profile list
    //Start iterating through profiles
    //For each profile... (until 30 or used or list is exhausted)
    for (let i = 0; i < 30; i++) {
      //If there are no more profiles, break this loop
      if (profileListPosition >= profileList.length) {
        break;
      }
      //Calculate panel height based off image
      //(height is randomized for now)
      const panelHeight = Math.floor(Math.random() * 300 + 200);
      //Find column with shortest height
      let shortestColumn = 0;
      for (let j = 1; j < heightTrackers.length; j++) {
        if (heightTrackers[j] < heightTrackers[shortestColumn]) {
          shortestColumn = j;
        }
      }
      //Add profile to column with shortest height
      newProfilePanels[shortestColumn].push({
        profile: profileList[profileListPosition],
        height: panelHeight,
      });
      //Add profile to displayedProfileList
      displayedProfileList.push({ profile: profileList[profileListPosition], height: panelHeight });
      profileListPosition++;
      //Add profile's height to column's height tracker
      heightTrackers[shortestColumn] += panelHeight;
    }
    //Set profileColumns with newly added profiles
    setProfileColumns(newProfilePanels);

    console.log(profileListPosition, profileList.length);
  };

  // This displays all of the projects (on project cards) from the static fakeData.ts dataset
  // Eventually the discover page should display a select number of cards instead of all
  const projectContent = (
    <>
      {
        /* projects ?
            projects.length > 0 ?
                filteredProjects.map((project) => (
                    <ProjectCard project={project}></ProjectCard>
                ))
                // If the projects array/object does not exist or has no content then nothing is displayed
                : null
            : null */

        //For each project in project display list... (use map)
        displayedProjects.map((project) => (
          //Create a Project Panel component
          <ProjectPanel width={project.width + project.adjust}></ProjectPanel>
        ))
      }
    </>
  );

  // This displays all of the profiles (on profile cards) from the static fakeData.ts dataset
  // Eventually the discover page should display a select number of cards instead of all
  const profileContent = (
    <>
      {
        /* profiles ?
            profiles.length > 0 ?
                filteredProfiles.map((profile) => (
                    <ProfileCard profile={profile}></ProfileCard>
                ))
                // If the profiles array/object does not exist or has no content then nothing is displayed
                : null
            : null */

        //For each array in profileColumns...
        profileColumns.map((column) => (
          //Create a column element & map through profiles in array
          <div>
            {column.map((profile) => (
              <ProfilePanel height={profile.height}></ProfilePanel>
            ))}
          </div>
        ))
      }
    </>
  );

  // Sets the content of the page depending on which tab is selected
  const discoverContent = selectedTab === 'Projects' ? projectContent : profileContent;

  // Function to change highlighted tab
  const handleButtonClick = (selectedButton) => {
    setSelectedTab(selectedButton);
  };

  return (
    <div className="page" onScroll={addContent}>
      <h1 className="page-title">{username}</h1>

      <h2>{username}</h2>

      {/* Discover Buttons change the content of the page based on which one is highlighted */}
      <div id="discover-button-wrapper">
        <DiscoverButton
          isActive={selectedTab === 'Projects'}
          onClick={() => handleButtonClick('Projects')}
        >
          Projects
        </DiscoverButton>
        <DiscoverButton
          isActive={selectedTab === 'People'}
          onClick={() => handleButtonClick('People')}
        >
          Peopleeee
        </DiscoverButton>
        <SearchBar
          dataSets={[{ data: projects }, { data: profiles }]}
          onSearch={HandleSearch}
        ></SearchBar>
      </div>

      {/* Prints all projects in the fake dataset on screen */}
      {/* 
            Add padding to discover-panel-box later
            Breakpoints occur every 200 pixels
            Formula for padding will be: (windowWidth - (sidebarWidth + currentBreakpointFlexboxWidth)) / 2
            How to implement breakpoints, thought?
            */}
      <div id="discover-panel-box">{discoverContent}</div>

      {/* Footer of the page made exclusively to navigate to a project credits page. */}
      {/* This link should probably be moved to settings in the future but its in this footer for ease of access for now */}
      <CreditsFooter />

      {/* Scroll To Top button */}
      <ToTopButton />
    </div>
  );
};

export default Home;
