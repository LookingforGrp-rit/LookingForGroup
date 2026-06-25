// import { profiles } from "../../constants/fakeData";
import { useState, useMemo, ChangeEvent, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
// import { PagePopup, openClosePopup } from "../PagePopup";
import ToTopButton from '../ToTopButton';
import MyProjectsDisplayList from '../MyProjectsDisplayList';
import MyProjectsDisplayGrid from '../MyProjectsDisplayGrid';
import { Header } from '../Header';
import { ThemeIcon, ThemeImage } from '../ThemeIcon';
import { Select, SelectButton, SelectOptions } from '../Select';
import { LeaveDeleteContext } from '../../contexts/LeaveDeleteContext';

import { ProjectCreatorEditor } from '../ProjectCreatorEditor/ProjectCreatorEditor';

//import api utils
import { getCurrentUsername, getProjectsByUser } from '../../api/users.ts'
import { MePrivate, ProjectDetail } from '@looking-for-group/shared';
import { deleteProject } from '../../api/projects.ts';

/**
 * My Projects page. Creates a customizable page that showcases the user's projects.
 * @returns JSX Element
 */
const MyProjects = (userProfile: any) => {

  //const navigate = useNavigate();

  // Taken from Sidebar.tsx

  // const [UID, setUID] = useState(profiles[0]._id);
  // const [activePage, setActivePage] = useState(0);

  // const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false);

  // Type of display used. Can be grid or list
  const [displayMode, setDisplayMode] = useState('grid');

  // Type of sort for items. Can be newest, oldest, A-Z, or Z-A
  const [sortMethod, setSortMethod] = useState('newest');

  // List of user's projects
  const [projectsList, setProjectsList] = useState<ProjectDetail[]>([]);

  // Projects filtered by search
  const [filteredProjects, setFilteredProjects] = useState<ProjectDetail[]>([]);

  // Current search query
  const [currentSearch, setCurrentSearch] = useState('');

  // const [bannerImage, setBannerImage] = useState(require("../../images/projects_header_light.png"));

  // Here to prevent reloading data after every re-render
  const [dataLoaded, setDataLoaded] = useState(false);
  const [loggedIn, setLoggedIn] = useState(0);

  // If we arrived here with ?create=1 (e.g. the user clicked "Create Project"
  // while logged out and just finished signing in), open the create editor
  // immediately. Read it once on mount, then strip it from the URL so a refresh
  // or closing the editor doesn't reopen it.
  const [searchParams, setSearchParams] = useSearchParams();
  const [autoStartCreate] = useState(searchParams.get('create') === '1');
  useEffect(() => {
    if (searchParams.get('create') === '1') {
      searchParams.delete('create');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [_createError, setCreateError] = useState(false);

  const [projectMode, setProjectMode] = useState("All");
  const [userId, setUserId] = useState<string>('');

  // --------------------
  // Helper functions
  // --------------------
  /**
   * Checks if user is logged in and pulls all relevant data
   */
  const getUserProjects = async () => {
    try {
      const res = await getCurrentUsername();
      setUserProjects({ ...res.data } as MePrivate)

    } catch (e) {
      console.error('error getting projects', e);
      setCreateError(true);
    }
  }

  const setUserProjects = async (data: MePrivate | undefined) => {
    // User is logged in, pull their data
    if (data) {
      setLoggedIn(data.userId);
      let projectsRes = await getProjectsByUser();

      //Get invalid projects
      const invalidProjects = projectsRes.data?.filter((project) =>
        project.title === "My Project" && project.hook.length === 0 && project.description.length === 0);

      //Delete invalid projects
      //If invalidProjects is undefined, there are none
      if (invalidProjects !== undefined) {
        for (let i = 0; i < invalidProjects?.length; i++) {
          //Delete the project from the database
          deleteProject(invalidProjects[i].projectId);

          //Removes the deleted project from projectsRes so it's not displayed
          projectsRes.data = projectsRes.data?.filter((project) => !invalidProjects.includes(project));
        }
      }

      if (projectsRes.data && projectsRes.data !== undefined) {
        setProjectsList(projectsRes.data)
      };

      console.log(projectsRes.data);
      setUserId(data.username);
    } else {
      //guest
      setUserId("guest");
      setLoggedIn(0);
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

  //drop a project from local state — used right after a successful delete/leave
  const removeProject = useCallback((projectId: number) => {
    setProjectsList((prev) => prev.filter((p) => p.projectId !== projectId));
    setFilteredProjects((prev) => prev.filter((p) => p.projectId !== projectId));
  }, []);

  // Keep the filtered list in sync when the underlying project list changes
  useEffect(() => {
    if (projectMode === "All") return;
    const filtered = projectsList.filter((item) => {
      if (projectMode === "Joined") {
        for (const member of item.members) {
          if (member.user.username === userId && item.owner.username !== userId) return true;
        }
        return false;
      }
      if (projectMode === "Owned") return item.owner.username === userId;
      return false;
    });
    setFilteredProjects(filtered);
  }, [projectsList, projectMode, userId]);
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

  /**
   * Checks if any word in "title" starts with "snippet", and returns that answer as a boolean.
   * @param title Project title
   * @param snippet Beginning letters to search for
   * @returns true if title starts with snippet
   */
  const checkIfAnyWordStartsWith = (title: string, snippet: string) => {
    const words = title.split(' ');
    for (let i = 0; i < words.length; i++) {
      if (words[i].substring(0, snippet.length) == snippet) {
        return true;
      }
    }
    return false;
  };

  /**
   * Sorts the projects by the current sort method
   * @param projects Projects to sort
   * @returns Sorted array of projects
   */
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
            return aTime - bTime;
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
            return bTime - aTime;
          });
      }
    }
  };

  /**
   * Toggles display mode between "list" and "grid"
   */
  const toggleDisplayMode = () => {
    if (displayMode === 'grid') {
      setDisplayMode('list');
    } else if (displayMode === 'list') {
      setDisplayMode('grid');
    }
  };

  /**
   * Creates a grid that showcases the user's current projects.
   * @param userProjects Projects to display
   * @returns JSX Element
   */
  const GridDisplay = ({ userProjects }: { userProjects: ProjectDetail[] }) => { //it's a parameter here but a property down there
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
                  removeProject,
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

  /**
   * Creates a list that showcases the user's current projects.
   * @param userProjects Projects to display 
   * @returns JSX Element
   */
  const ListDisplay = ({ userProjects }: { userProjects: ProjectDetail[] }) => {
    return (
      <>
        {/* Projects List header */}
        <div id="my-projects-header-and-list">
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
                    removeProject,
                  }}
                >
                  <MyProjectsDisplayList
                    projectData={project}
                  />
                </LeaveDeleteContext.Provider>
              );
            })}
          </div></div>
      </>
    );
  };

  /**
   * Sorts the projects based on whether the user has selected "grid" or "list." Defaults to "list" view.
   * @param userProjects Projects to display 
   * @returns GridDisplay or ListDisplay components. Nothing if there is an error.
   */
  const ProjectListSection = ({ userProjects }: { userProjects: ProjectDetail[] }) => {
    // Sort projects based on the method selected
    const sortedProjects = sortProjects(userProjects) as ProjectDetail[];
    if (sortedProjects.length == 0) {
      return <div className='my-projects-no-project'>No {projectMode === "All" ? "" : projectMode} projects!</div>;
    }

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

  /**
   * Updates the projects shown with the search results.
   * @param results Search results
   */
  const handleSearch = (results: unknown[][]) => {
    // results[0] is the filtered array
    setFilteredProjects(results[0] as ProjectDetail[]);
  };

  const projectsModeSwitch = useCallback((newMode: string) => {
    const newFilteredProjects = projectsList.filter((item) => {
      if (newMode === "All") return true;

      if (newMode === "Joined") {
        for (let member of item.members) {
          if (member.user.username === userId && item.owner.username !== userId) return true;
        }
      }

      if (newMode === "Owned") return item.owner.username === userId;


      return false;
    });

    setProjectMode(newMode);
    setFilteredProjects(newFilteredProjects);
  }, [projectMode, filteredProjects, userId, projectsList]);

  const projectsToDisplay = (currentSearch.trim() !== '' || projectMode !== "All") ? filteredProjects : projectsList;

  return (
    <div className="page" id="my-projects" tabIndex={-1}>
      {/* Top Bar */}
      <Header
        dataSets={projectDataSet}
        onSearch={handleSearch}
        value={currentSearch}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setCurrentSearch(e.currentTarget.value)}
        setCurrentUserId={setUserProjects}
      />

      {/* Banner */}
      <div className="projects-banner-outer">
        <div className="projects-banner-wrapper">
          <ThemeImage
            lightSrc={'/assets/projects_header_light.png'}
            darkSrc={'/assets/projects_header_dark.png'}
            className={'my-projects-banner'}
            alt={'My Projects Banner'}
          />
        </div>
      </div>

      {/* Header */}
      <div className="my-projects-header-row">

        {/* Filters */}
        <div className="my-projects-filters">
          {/* All Projects Button */}
          <button className={"my-projects-all-projects-button" + (projectMode === "All" ? " my-projects-all-projects-selected" : "")} onClick={() => projectsModeSwitch("All")}>
            All Projects
          </button>
          <button className={"my-projects-all-projects-button" + (projectMode === "Owned" ? " my-projects-all-projects-selected" : "")} onClick={() => projectsModeSwitch("Owned")}>
            Owned Projects
          </button>
          <button className={"my-projects-all-projects-button" + (projectMode === "Joined" ? " my-projects-all-projects-selected" : "")} onClick={() => projectsModeSwitch("Joined")}>
            Joined Projects
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
            <ProjectCreatorEditor
              newProject={true}
              mobileView={false}
              autoStart={autoStartCreate}
            />
          </div>
        </div>
      </div>

      {/* <hr id='my-projects-hr' /> */}

      {/* Project Grid/List */}
      <main id="main">
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
      </main>
      <ToTopButton />
    </div>
  );
}

export default MyProjects;