import { useEffect, useMemo, useState } from 'react';
import { ProjectPanel } from './ProjectPanel';
import { ProfilePanel } from './ProfilePanel';
import { ProjectWithFollowers, UserPreview, NumberDictionary, StructuredProjectInfo } from '@looking-for-group/shared';
import { createImmutableStateInvariantMiddleware } from '@reduxjs/toolkit';

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
export const PanelBox = ({ category, itemList, itemAddInterval = 0, projectCache, followedProjectIds, userId }:
  {
    category: string, itemList: unknown[], itemAddInterval: number, projectCache?: NumberDictionary<StructuredProjectInfo>,
    followedProjectIds?: Set<number>, userId: number,
  }) => {
  //console.log(itemList);
  // Don't display all items at first, load them in periodically
  // Currently rendered subset of items. Initially displays only a portion (controlled by itemAddInterval).
  const [displayedItems, setDisplayedItems] = useState(itemList.slice(0, itemAddInterval));
  // Keeps a copy of the incoming itemList prop to detect updates from API or parent component.
  const [itemListCopy, setItemListCopy] = useState(itemList);
  //console.log(itemList !== itemListCopy);

  // Make sure displayedItems gets updated when itemList receives API data
  useEffect(() => {
    //console.log(displayedItems);
    if (itemList !== itemListCopy) {
      setDisplayedItems(itemList.slice(0, itemAddInterval));
      setItemListCopy(itemList);
    }
  }, [itemList])

  // Updated to use native react events
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;

    if (Math.ceil(scrollTop) + clientHeight >= scrollHeight - 5) {
      const startIndex = displayedItems.length;
      
      // Only add if there is something left
      if (startIndex < itemList.length) {
        const newItems = itemList.slice(startIndex, startIndex + itemAddInterval);
        setDisplayedItems(prevItems => prevItems.concat(newItems));
      }
    }
  };

  // Return directly instead of deferring
  if (category === 'projects') {
    return (
      <div className="project-panel-box" onScroll={handleScroll}>
        {displayedItems.length > 0 ? (
          displayedItems.map((item) => {
            const projectId = (item as ProjectWithFollowers).projectId;
            const project = projectCache?.[projectId]?.full || (item as ProjectWithFollowers);
            return (
              <ProjectPanel
                project={project}
                initialIsFollowing={followedProjectIds?.has(projectId)}
                key={projectId}
                currentUserId={userId}
              />
            );
          })
        ) : (
          <>Sorry, no projects here</>
        )}
      </div>
    );
  }

  // Functional else statement
  return (
    <div className="profile-panel-box" onScroll={handleScroll}>
      {displayedItems.length > 0 ? (
        displayedItems.map((profile) => (
          <ProfilePanel 
            profileData={profile as UserPreview} 
            currentUserId={userId} 
            key={(profile as UserPreview).userId} 
          />
        ))
      ) : (
        <>Sorry, no people here</>
      )}
    </div>
  );
};
