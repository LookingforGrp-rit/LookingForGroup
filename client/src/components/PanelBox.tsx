import { useEffect, useMemo, useState } from 'react';
import { ProjectPanel } from './ProjectPanel';
import { ProfilePanel } from './ProfilePanel';
import { ApiResponse, ProjectFollower, ProjectPreview, ProjectWithFollowers, UserPreview } from '@looking-for-group/shared';
import { getByID } from '../api/projects.ts';
import { getProjectFollowing } from '../api/users.ts';

// Item list should use "useState" so that it'll re-render on the fly
// And so that no search functionality needs to be included in this component

/**
 * PanelBox component dynamically renders a scrollable list of either project panels or profile panels.
 * This component manages the displayed items using local state and progressively adds more items 
 * as the user scrolls to the bottom of the container. It handles both "projects" and "profiles" categories.
 *
 * @param category - Determines whether to render ProjectPanels or ProfilePanels.
 * @param itemList - List of items (projects or profiles) to render.
 * @param itemAddInterval - Number of items to add to the display when scrolling.
 * @returns The rendered panel box containing the items.
 */
export const PanelBox = ({ category, itemList, itemAddInterval = 0, userId }: { category: string, itemList: unknown[], itemAddInterval: number, userId: number }) => {
  // Don't display all items at first, load them in periodically
  // Currently rendered subset of items. Initially displays only a portion (controlled by itemAddInterval).
  const [displayedItems, setDisplayedItems] = useState(itemList.slice(0, itemAddInterval));
  // Keeps a copy of the incoming itemList prop to detect updates from API or parent component.
  const [itemListCopy, setItemListCopy] = useState(itemList);

  // Make sure displayedItems gets updated when itemList receives API data
  useEffect(()=>{
    if (itemList !== itemListCopy) {
    setDisplayedItems(itemList.slice(0, itemAddInterval));
    setItemListCopy(itemList);
  }

  },[displayedItems, itemListCopy])
  //console.log("PanelBox")

  /**
   * Appends more items to the displayed list when the user scrolls to the bottom.
   * 
   * Steps:
   * 1. Reads scrollTop, clientHeight, and scrollHeight from the panel container.
   * 2. Checks if the scroll position indicates the user has reached the bottom.
   * 3. Slices the next `itemAddInterval` items from the full itemList and appends them
   *    to the displayedItems array.
   * 
   * Important notes:
   * - Uses `document.querySelector` to locate the scroll container (can be replaced by useRef for better React practices)
   * - The original `startIndex` calculation should be `displayedItems.length` to avoid skipping items.
   */
  const addItems = () => {
    const panelBoxName = `${category === 'projects' ? 'project' : 'profile'}-panel-box`;
    const { scrollTop, scrollHeight, clientHeight } = document.querySelector(panelBoxName)!;

    // Check if the user has scrolled to the bottom of the panel box
    if (scrollTop + clientHeight >= scrollHeight) {
      const startIndex = displayedItems.length - 1;
      const newItems = itemList.slice(startIndex, startIndex + itemAddInterval);
      setDisplayedItems(displayedItems.concat(newItems));
    }
  };

  /**
   * Renders the list of ProjectPanel components inside a scrollable container.
   * Attaches the addItems scroll handler to implement lazy loading.
   * 
   * @returns JSX element containing the project panels
   */
  const ProjectPanelBox = () => {
    //console.log("Project Panel");
    if (itemList.length === 0)
      return <div className="project-panel-box" onScroll={addItems}><>Sorry, no projects here</></div>

    //maps out the project panels with only one project's data
    const panelProjects = itemList.map((project) => {
      //console.log((project as ProjectWithFollowers).projectId);

      //variables needed for the proejct panel
      let followers: number;
      let isFollow = false;

      const GetProjectsDetails = async () => {
        //grabs the project by the one id
        const projectResp = await getByID((project as ProjectWithFollowers).projectId);
        const followings = (await getProjectFollowing(userId)).data?.projects;
        if (projectResp.data) {
          followers = projectResp.data.followers.count;
        }

        if (followings !== undefined) {
          for (const follower of followings) {
            isFollow = (follower.project.projectId === (project as ProjectWithFollowers).projectId);
            if (isFollow) break;
          }
        }
      }

      GetProjectsDetails();
      return (
        <ProjectPanel
          project={project as ProjectWithFollowers}
          key={(project as ProjectWithFollowers).projectId}
          currentUserId={userId} />
      );
    })
    return <div className="project-panel-box" onScroll={addItems} >{panelProjects}</div>
    // return (
    //   <div className="project-panel-box" onScroll={addItems}>
    //     {itemList.length > 0 ? (
    //       {panelProjects}
    //     ) : (
    //       <>Sorry, no projects here</>
    //     )}
    //   </div>
    // );
  };

  /**
   * Renders the list of ProfilePanel components inside a scrollable container.
   * Attaches the addItems scroll handler to implement lazy loading.
   * 
   * @returns JSX element containing the profile panels
   */
  const ProfilePanelBox = () => {
    return (
      <div className="profile-panel-box" onScroll={addItems}>
        {displayedItems.length > 0 ? (
          displayedItems.map((profile) => (
            <ProfilePanel profileData={profile as UserPreview} key={(profile as UserPreview).userId} />
          ))
        ) : (
          <>Sorry, no people here</>
        )}
      </div>
    );
  };

  // console.log(itemList, " Projects");
  // console.log(displayedItems, " Users");
  return category === 'projects' ? <ProjectPanelBox /> : <ProfilePanelBox />;
};
