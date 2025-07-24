import '../Styles/pages.css';
import '../Styles/projects.css';
import '../Styles/general.css'

// import { MyProjectsDisplay } from "../MyProjectsDisplay";
// import { profiles } from "../../constants/fakeData";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { PagePopup, openClosePopup } from "../PagePopup";
import ToTopButton from '../ToTopButton';
import CreditsFooter from '../CreditsFooter';
import MyProjectsDisplayList from '../MyProjectsDisplayList';
import MyProjectsDisplayGrid from '../MyProjectsDisplayGrid';
import { Header } from '../Header';
import { ThemeIcon } from '../ThemeIcon';
import { Select, SelectButton, SelectOptions } from '../Select';
import { LeaveDeleteContext } from '../../contexts/LeaveDeleteContext';

import { ProjectCreatorEditor } from '../ProjectCreatorEditor/ProjectCreatorEditor';
import { User } from '../Sidebar'; // For use with project creation button

//import api utils
import { getCurrentUsername } from '../../api/users.ts'

const MyProjects = () => {

  const navigate = useNavigate();

  // Taken from Sidebar.tsx
  const [userData, setUserData] = useState<User>();

  // const [UID, setUID] = useState(profiles[0]._id);
  // const [activePage, setActivePage] = useState(0);

  // const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);

  const [displayMode, setDisplayMode] = useState('grid');
  // Can be:
  // - grid
  // - list
  const [sortMethod, setSortMethod] = useState('newest');
  // Can be:
  // - newest
  // - oldest
  // - a-z
  // - z-a
  const [projectsList, setProjectsList] = useState();
  const [currentSearch, setCurrentSearch] = useState('');
  // const [bannerImage, setBannerImage] = useState(require("../../images/projects_header_light.png"));

  // Here to prevent reloading data after every re-render
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loggedIn, setLoggedIn] = useState(0);

  const [createError, setCreateError] = useState(false);

  // --------------------
  // Helper functions
  // --------------------
  // Checks if user is logged in and pulls all relevant data
  const getUserProjects = async () => {
    try {
      const res = await getCurrentUsername();


      // User is logged in, pull their data
      if (res.status === 200 && res.data?.username && res.data.userId) {
        setLoggedIn(res.data.userId);
        const projectsURL = `/api/users/${res.data.userId}/projects`;
        const projectsRes = await fetch(projectsURL);
        const data = await projectsRes.json();

        if ((data.status === 200) && (data.data[0] !== undefined)) {
          setProjectsList(data.data);
        }
      } else {
        //guest
        setLoggedIn(0);
      }

    } catch (e) {
      console.error('error getting projecrs', e);
      setCreateError(true);
    }

    setDataLoaded(true);
  }

  // USES OLD AUTH ROUTE
  //  const getUserProjects = async () => {
  //   const authResponse = await fetch('/api/auth');
  //   const authData = await authResponse.json();

  //   // User is logged in, pull their data
  //   if (authData.status === 200) {
  //     setLoggedIn(authData.data);
  //     const projectsURL = `/api/users/${authData.data}/projects`;
  //     const projectsRes = await fetch(projectsURL);
  //     const data = await projectsRes.json();

  //     if ((data.status === 200) && (data.data[0] !== undefined)) {
  //       setProjectsList(data.data);
  //     }
  //   }

  //   if (authResponse.status != 401) setCreateError(false);
  //   else setCreateError(true);

  //   setDataLoaded(true);
  // }

  // const getProjects = async (userID: number) => {
  //   const url = `/api/users/${userID}/projects`;
  //   try {
  //     const response = await fetch(url);

  //     const rawData = await response.json();
  //     setProjectsList(rawData.data);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  if (!dataLoaded) {
    getUserProjects();
  }
  // else {
  //     if (projectsList.length < 20) {
  //         let tempList = new Array(0);
  //         for (let i = 0; i < 20; i++) {
  //             if (i < projectsList.length) {
  //                 tempList.push(projectsList[i]);
  //             }
  //             else {
  //                 tempList.push({
  //                     created_at: "2024-10-01T17:33:11.000Z",
  //                     hook: "",
  //                     thumbnail: "",
  //                     title: "Test",
  //                     project_id: 1,
  //                 });
  //             }
  //         }
  //         setProjectsList(tempList);
  //     }
  // }

  // Compare words: check if the snippet is found in the title
  const checkIfAnyWordStartsWith = (title: string, snippit: string) => {
    const words = title.split(' ');
    for (let i = 0; i < words.length; i++) {
      if (words[i].substring(0, snippit.length) == snippit) {
        return true;
      }
    }
    return false;
  };

  // Sort projects: variety of methods
  const sortProjects = (projects) => {
    if (projects !== undefined) {
      const tempList = new Array(0);

      if (currentSearch) {
        // No search has been made, just use all results
        for (let i = 0; i < projects.length; i++) {
          tempList.push(projects[i]);
        }
      } else {
        // Filter list based on search results
        for (let i = 0; i < projects.length; i++) {
          if (
            checkIfAnyWordStartsWith(
              projects[i].title.toLowerCase(),
              currentSearch.toLowerCase()
            )
          ) {
            tempList.push(projects[i]);
          }
        }
      }

      // Sort depending on type selected by user. Default is Newest -> Oldest
      switch (sortMethod) {
        case 'oldest':
          return tempList.toSorted((a, b) => {
            const aTime = new Date(a.created_at).getTime();
            const bTime = new Date(b.created_at).getTime();
            return bTime - aTime;
          });
          break;

        case 'a-z':
          return tempList.toSorted((a, b) =>
            a.title.toLowerCase().localeCompare(b.title.toLowerCase())
          );
          break;

        case 'z-a':
          return tempList.toSorted((a, b) =>
            b.title.toLowerCase().localeCompare(a.title.toLowerCase())
          );
          break;
        default:
          return tempList.toSorted((a, b) => {
            const aTime = new Date(a.created_at).getTime();
            const bTime = new Date(b.created_at).getTime();
            return aTime - bTime;
          });
          break;
      }
    }
  };

  // Set the display mode: list or grid
  const toggleDisplayMode = () => {
    if (displayMode === 'grid') {
      setDisplayMode('list');
    } else if (displayMode === 'list') {
      setDisplayMode('grid');
    }
  };

  // Projects in grid display
  const GridDisplay = ({ userProjects }) => {
    return (
      <>
        <div className='my-projects-grid'>
          {userProjects.map(project => {
            // Check if user is the owner of this project
            const isOwner = (project.user_id === loggedIn);

            return (
              <LeaveDeleteContext.Provider
                value={{
                  isOwner,
                  projId: project.project_id,
                  userId: loggedIn,
                  reloadProjects: getUserProjects,
                }}
              >
                <MyProjectsDisplayGrid
                  projectData={project}
                />
              </LeaveDeleteContext.Provider>
            );
          })}
        </div>
      </>
    );
  };

  // Projects in list display
  const ListDisplay = ({ userProjects }) => {
    return (
      <>
        {/* Projects List header */}
        <div className="my-projects-list-header">
          <div className="project-header-label title">Project Title</div>
          <div className="project-header-label status">Status</div>
          <div className="project-header-label date">Date Created</div>
          <div className="project-header-label options"></div>
        </div>

        <div className='my-projects-list'>
          {userProjects.map(project => {
            // Check if user is the owner of this project
            const isOwner = (project.user_id === loggedIn);

            return (
              <LeaveDeleteContext.Provider
                value={{
                  isOwner,
                  projId: project.project_id,
                  userId: loggedIn,
                  reloadProjects: getUserProjects,
                }}
              >
                <MyProjectsDisplayList
                  projectData={project}
                />
              </LeaveDeleteContext.Provider>
            );
          })}
        </div>
      </>
    );
  };

  // Return sorted projects either in Grid or List mode
  const ProjectListSection = ({ userProjects }) => {
    // Sort projects based on the method selected
    const sortedProjects = sortProjects(userProjects);

    if (sortedProjects) {
      if (displayMode === 'grid') {
        return <GridDisplay userProjects={sortedProjects} />;
      }

      return <ListDisplay userProjects={sortedProjects} />;
    }

    return <></>;
  };

  // `let projectListSection = <></>;
  // if (displayMode === 'grid') {`
  //   const tempList = sortProjects();
  //   projectListSection = (
  //     <>
  //       {/* Projects List */}
  //       <div className="my-projects-grid">
  //         {tempList === undefined
  //           ? ''
  //           : tempList.map((project) => {
  //             return <MyProjectsDisplayGrid projectData={project}></MyProjectsDisplayGrid>;
  //           })}
  //       </div>
  //     </>
  //   );
  // } else if (displayMode === 'list') {
  //   const tempList = sortProjects();
  //   projectListSection = (
  //     <>
  //       {/* Projects List Header */}
  //       <div className="my-projects-list-header">
  //         <div className="project-header-label title">Project Title</div>
  //         <div className="project-header-label status">Status</div>
  //         <div className="project-header-label date">Date Created</div>
  //         <div className="project-header-label options"></div>
  //       </div>

  //       {/* Projects List */}
  //       <div className="my-projects-list">
  //         {tempList === undefined
  //           ? ''
  //           : tempList.map((project) => {
  //             return <MyProjectsDisplayList projectData={project}></MyProjectsDisplayList>;
  //           })}
  //       </div>
  //     </>
  //   );
  // }

  return (
    <div className="page" id="my-projects">
      {/* Top Bar */}
      {/* <div className="my-projects-top-bar"> */}
      {/* Search Bar */}
      {/* <div className="my-projects-search">
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <input type="text" className="my-projects-searchbar"
                        value={currentSearch} onChange={(e) => {setCurrentSearch(e.target.value)}} placeholder="Search"></input>
                </div> */}

      {/* Profile */}
      {/* <div className="my-projects-profile">
                    <i className="fa-solid fa-circle-user"></i>
                    <i className="fa-solid fa-caret-down"></i>
                </div> */}
      {/* </div> */}
      <Header dataSets={[{ projectsList }]} onSearch={setCurrentSearch} />

      {/* Banner */}
    <div className="projects-banner-outer">
    <div className="projects-banner-wrapper">
      <ThemeIcon
        light={'/assets/projects_header_light.png'}
        dark={'/assets/projects_header_dark.png'}
        alt={'My Projects Banner'}
        addClass={'my-projects-banner'}
      />
    </div>
    </div>

      {/* Header */}
      <div className="my-projects-header-row">
        {/* All Projects Button */}
        <button className="my-projects-all-projects-button" onClick={(e) => { }}>
          All Projects
        </button>

        {/* Sort By Drop Down */}
        <Select>
          <SelectButton
            placeholder='Sort by'
            initialVal=''
            buttonId='my-projects-sort-btn'
          />
          <SelectOptions
            callback={(e) => setSortMethod(e.target.value)}
            options={[
              {
                markup: <><i className="fa-solid fa-arrow-down-short-wide"></i>Newest</>,
                value: 'newest',
                disabled: false,
              },
              {
                markup: <><i className="fa-solid fa-arrow-down-wide-short"></i>Oldest</>,
                value: 'oldest',
                disabled: false,
              },
              {
                markup: <><i className="fa-solid fa-arrow-down-a-z"></i>A-Z</>,
                value: 'a-z',
                disabled: false,
              },
              {
                markup: <><i className="fa-solid fa-arrow-down-z-a"></i>Z-A</>,
                value: 'z-a',
                disabled: false,
              },
            ]}
          />
        </Select>

        {/* <Dropdown>
          <DropdownButton className='my-projects-sort-list'>
            {sortMethodHTML}
            <i
              className="fa-solid fa-angle-down"
              style={{
                position: 'absolute',
                right: '15px',
                bottom: '15px',
              }}
            ></i>
          </DropdownButton>
          <DropdownContent>
            <div className='my-projects-sort-list-dropdown'>
              <button
                className='my-projects-sort-list-btn top'
                value={'newest'}
                onClick={(e) => {
                  setSortMethod(e.target.value);
                  setSortMethodHTML(
                    <>
                      <i className={e.target.firstChild.className}></i>
                      {e.target.innerText}
                    </>
                  );
                }}
              >
                <i className="fa-solid fa-arrow-down-short-wide"></i>Newest
              </button>
              <button
                className='my-projects-sort-list-btn'
                value={'oldest'}
                onClick={(e) => {
                  setSortMethod(e.target.value);
                  setSortMethodHTML(
                    <>
                      <i className={e.target.firstChild.className}></i>
                      {e.target.innerText}
                    </>
                  );
                }}
              >
                <i className="fa-solid fa-arrow-down-wide-short"></i>Oldest
              </button>
              <button
                className='my-projects-sort-list-btn'
                value={'a-z'}
                onClick={(e) => {
                  setSortMethod(e.target.value);
                  setSortMethodHTML(
                    <>
                      <i className={e.target.firstChild.className}></i>
                      {e.target.innerText}
                    </>
                  );
                }}
              >
                <i className="fa-solid fa-arrow-down-a-z"></i>A-Z
              </button>
              <button
                className='my-projects-sort-list-btn bottom'
                value={'z-a'}
                onClick={(e) => {
                  setSortMethod(e.target.value);
                  setSortMethodHTML(
                    <>
                      <i className={e.target.firstChild.className}></i>
                      {e.target.innerText}
                    </>
                  );
                }}
              >
                <i className="fa-solid fa-arrow-down-z-a"></i>Z-A
              </button>
            </div>
          </DropdownContent>
        </Dropdown> */}

        {/* Display Switch */}
        <div
          className="my-projects-display-switch"
          onClick={(e) => {
            toggleDisplayMode();
          }}
        >
          <div className="display-switch-option list" id={displayMode === 'list' ? 'selected' : ''}>
            <i className="fa-solid fa-bars"></i>
          </div>
          <div className="display-switch-option grid" id={displayMode === 'grid' ? 'selected' : ''}>
            <i className="fa-solid fa-border-all"></i>
          </div>
        </div>

        {/*Create Project Button*/}
        {/* All of the following options end up replacing the button with the ProjectCreatorEditor button -
        this is because that component always creates a SPECIFIC button, and cannot be hooked up to ANY button.
        Right now, teams have been told to avoid touching that file.*/}

        {/*Create New Project button - Implementation 0 - Currently, the button is set to always appear, non-functional. */}
        {/*<>
          <button className="my-projects-new-project-button">
            + New Project
          </button>
        </>*/}

        {/*/*Create New Project button - Implementation 1 - Redirects user when not logged in.*/}
        {!loggedIn ? (
          <>
            <button className="my-projects-new-project-button" onClick={() => navigate('/login')}>
              + New Project
            </button>
          </>
        ) : (<div className="my-projects-create-btn">
          <ProjectCreatorEditor newProject={createError} buttonCallback={getUserProjects} user={userData} />
        </div>)
        }

        {/*Create Project Button - Implementation 2 - Only works if user is logged in. No error message is displayed for logged out users.*/}
        {/*!loggedIn ? (
          <>
            <button className="my-projects-new-project-button" onClick={() => {
              console.log("read me if you're not logged in");
            }}>
              + New Project
            </button>
          </>
        ) : <ProjectCreatorEditor newProject={true} buttonCallback={getUserProjects} user={userData} />
        */}

        {/*Create Project Button - Implementation 3 - Only APPEARS if user is logged in.*/}
        {/*loggedIn ? (
          <>
            <button className="my-projects-new-project-button" onClick={() => {
              <ProjectCreatorEditor newProject={true} buttonCallback={getUserProjects} user={userData} />
            }}>
              + New Project
            </button>
          </>
        ) : <> </>/* Do nothing */
        }


        {/* <button className="delete" onClick={() => setIsDeletePopupOpen(true)}>
          -Delete Project test
        </button>
        <DeleteProjectPopup show={isDeletePopupOpen} setShow={setIsDeletePopupOpen} /> */}
      </div>

      <hr />

      {/* Project Grid/List */}
      <div>
        {(!dataLoaded) ? (
          <div
            className='placeholder-spacing'
            style={{ justifyContent: 'center' }}
          >
            <div className='spinning-loader'></div>
          </div>
        ) : (
          // Check if user is logged in, and display text if not
          (!loggedIn) ? (
            <div className='placeholder-spacing'>
              <p>You have no projects, you're not logged in!</p>
            </div>
          ) : (
            <ProjectListSection userProjects={projectsList} />
          )
        )}
      </div>
      <CreditsFooter />
      <ToTopButton />
    </div>
  );
}

export default MyProjects;