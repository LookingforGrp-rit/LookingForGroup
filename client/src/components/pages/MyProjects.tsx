// import { profiles } from "../../constants/fakeData";
import { useState, useMemo } from 'react';
// import { PagePopup, openClosePopup } from "../PagePopup";
import ToTopButton from '../ToTopButton';
import CreditsFooter from '../CreditsFooter';
import MyProjectsDisplayList from '../MyProjectsDisplayList';
import MyProjectsDisplayGrid from '../MyProjectsDisplayGrid';
import { Header } from '../Header';
import { ThemeIcon, ThemeImage } from '../ThemeIcon';
import { Select, SelectButton, SelectOptions } from '../Select';
import { LeaveDeleteContext } from '../../contexts/LeaveDeleteContext';

import { ProjectCreatorEditor } from '../ProjectCreatorEditor/ProjectCreatorEditor';

//import api utils
import { getCurrentUsername, getProjectsByUser } from '../../api/users.ts'
import { ProjectDetail} from '@looking-for-group/shared';

const MyProjects = () => {

  //const navigate = useNavigate();

  // Taken from Sidebar.tsx

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
  const [projectsList, setProjectsList] = useState<ProjectDetail[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectDetail[]>([]);
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
      if (res.data) {
        setLoggedIn(res.data.userId);
        const projectsRes = await getProjectsByUser();

        if (projectsRes.data && projectsRes.data !== undefined) setProjectsList(projectsRes.data);
        
        //console.log(projectsRes.data);
        
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
  const sortProjects = (projects: ProjectDetail[]) => {
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
          return tempList.sort((a: ProjectDetail, b: ProjectDetail) => {
            const aTime = new Date(a.createdAt).getTime();
            const bTime = new Date(b.createdAt).getTime();
            return bTime - aTime;
          });

        case 'a-z':
          return tempList.sort((a: ProjectDetail, b: ProjectDetail) =>
            a.title.toLowerCase().localeCompare(b.title.toLowerCase())
          );

        case 'z-a':
          return tempList.sort((a: ProjectDetail, b: ProjectDetail) =>
            b.title.toLowerCase().localeCompare(a.title.toLowerCase())
          );
        default:
          return tempList.sort((a: ProjectDetail, b: ProjectDetail) => {
            const aTime = new Date(a.createdAt).getTime();
            const bTime = new Date(b.createdAt).getTime();
            return aTime - bTime;
          });
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
  const GridDisplay = ({userProjects} : {userProjects: ProjectDetail[]}) => { //it's a parameter here but a property down there
    return (
      <>
        <div className='my-projects-grid'>
          {userProjects.map(project => {
            // Check if user is the owner of this project
            const isOwner = (project.owner.userId === loggedIn);

            return (
              <LeaveDeleteContext.Provider
                key={project.projectId}
                value={{
                  isOwner,
                  projId: project.projectId,
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
  const ListDisplay = ({userProjects} : {userProjects: ProjectDetail[]}) => {
    return (
      <>
        {/* Projects List header */}
        <div className="my-projects-list-header">
          <div className="project-header-label title">Project Title</div>
          <div className="project-header-label status">Status</div>
          <div className="project-header-label date">Date Created</div>
        </div>

        <div className='my-projects-list'>
          {userProjects.map(project => {
            // Check if user is the owner of this project
            const isOwner = (project.owner.userId === loggedIn);

            return (
              <LeaveDeleteContext.Provider
                key={project.projectId}
                value={{
                  isOwner,
                  projId: project.projectId,
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
  const ProjectListSection = ({userProjects} : {userProjects: ProjectDetail[]}) => {
    // Sort projects based on the method selected
    const sortedProjects = sortProjects(userProjects) as ProjectDetail[];

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

  const projectDataSet = useMemo(() => [{ data: projectsList }], [projectsList]);

  const handleSearch = (results: unknown[][]) => {
    // results[0] is the filtered array
    setFilteredProjects(results[0] as ProjectDetail[]);
  };

  const projectsToDisplay = currentSearch.trim() !== '' ? filteredProjects : projectsList;

  return (
    <div className="page" id="my-projects">
      {/* Top Bar */}
      <Header 
        dataSets={projectDataSet} 
        onSearch={handleSearch} 
        value={currentSearch}
        onChange={(e) => setCurrentSearch(e.target.value)}
      />

      {/* Banner */}
    <div className="projects-banner-outer">
    <div className="projects-banner-wrapper">
      <ThemeImage
        lightSrc={'assets/projects_header_light.png'}
        darkSrc={'assets/projects_header_dark.png'}
        className={'my-projects-banner'}
        alt={'My Projects Banner'}
      />
    </div>
    </div>

      {/* Header */}
      <div className="my-projects-header-row">

        {/* Filters */}
        <div className="my-projects-filters">
          {/* TODO: keep this button? or add other filters (like Owned and Joined) */}
          {/* this button does nothing currently i think we should trash it */}
          {/* All Projects Button */}
          <button className="my-projects-all-projects-button" onClick={() => { }}>
            All Projects
          </button>
        </div>

        {/* Buttons */}
        <div className="my-projects-action-buttons">
          {/* Sort By Drop Down */}
          <Select>
            <SelectButton
              placeholder='Sort by'
              initialVal=''
              buttonId='my-projects-sort-btn'
              type='dropdown'
            />
            <SelectOptions
              callback={(e) => setSortMethod((e.target as HTMLButtonElement).value)}
              options={[
                {
                  markup:
                  <>
                    <ThemeIcon
                      id="clock"
                      width={18}
                      height={18}
                      className="mono-stroke"
                      ariaLabel="Sort by newest"
                    />
                    Newest
                  </>,
                  value: 'newest',
                  disabled: false,
                },
                {
                  markup:
                  <>
                    <ThemeIcon
                      id="clock"
                      width={18}
                      height={18}
                      className="mono-stroke"
                      ariaLabel="Sort by oldest"
                    />
                    Oldest
                  </>,
                  value: 'oldest',
                  disabled: false,
                },
                {
                  markup:
                  <>
                    <ThemeIcon
                      id="direction-arrow"
                      width={18}
                      height={18}
                      className="mono-stroke arrow-az"
                      ariaLabel="Sort A-Z"
                    />
                    A-Z
                  </>,
                  value: 'a-z',
                  disabled: false,
                },
                {
                  markup:
                  <>
                    <ThemeIcon
                      id="direction-arrow"
                      width={18}
                      height={18}
                      className="mono-stroke arrow-za"
                      ariaLabel="Sort Z-A"
                    />
                    Z-A
                  </>,
                  value: 'z-a',
                  disabled: false,
                },
              ]}
            />
          </Select>

          {/* Display Switch */}
          <div
            className="my-projects-display-switch"
            onClick={() => {
              toggleDisplayMode();
            }}
          >
            <div className="display-switch-option list" id={displayMode === 'list' ? 'selected' : ''}>
              <i className="fa-solid fa-bars fa-lg"></i>
            </div>
            <div className="display-switch-option grid" id={displayMode === 'grid' ? 'selected' : ''}>
              <i className="fa-solid fa-border-all fa-xl"></i>
            </div>
          </div>

          {/*Create Project Button*/}
          <div className="my-projects-create-btn">
            <ProjectCreatorEditor newProject={true}/>
          </div>
        </div>
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
            <ProjectListSection userProjects={projectsToDisplay} />
          )
        )}
      </div>
      <CreditsFooter />
      <ToTopButton />
    </div>
  );
}

export default MyProjects;