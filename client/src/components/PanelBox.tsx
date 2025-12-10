import { useState } from 'react';
import { ProjectPanel } from './ProjectPanel';
import { ProfilePanel } from './ProfilePanel';
import { ProjectWithFollowers, UserPreview} from '@looking-for-group/shared';

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
export const PanelBox = ({ category, itemList, itemAddInterval = 0 } : {category: string, itemList: unknown[], itemAddInterval: number}) => {
  // Don't display all items at first, load them in periodically
  // Currently rendered subset of items. Initially displays only a portion (controlled by itemAddInterval).
  const [displayedItems, setDisplayedItems] = useState(itemList.slice(0, itemAddInterval));
  // Keeps a copy of the incoming itemList prop to detect updates from API or parent component.
  const [itemListCopy, setItemListCopy] = useState(itemList);

  // Make sure displayedItems gets updated when itemList receives API data
  if (itemList !== itemListCopy) {
    setDisplayedItems(itemList.slice(0, itemAddInterval));
    setItemListCopy(itemList);
  }

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
    return (
      <div className="project-panel-box" onScroll={addItems}>
        {displayedItems.length > 0 ? (
          displayedItems.map((project) => (
            <ProjectPanel project={project as ProjectWithFollowers} key={(project as ProjectWithFollowers).projectId}/>
          ))
        ) : (
          <>Sorry, no projects here</>
        )}
      </div>
    );
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

  return category === 'projects' ? <ProjectPanelBox /> : <ProfilePanelBox />;
};
