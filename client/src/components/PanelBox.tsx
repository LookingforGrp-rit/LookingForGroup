import { useCallback, useEffect, useRef, useState } from 'react';
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

  // Intersection Observer pattern for infinite scrolling
  const interObsRef = useRef<HTMLDivElement>(null);

  // Make sure displayedItems gets updated when itemList receives API data
  if (itemList !== itemListCopy) {
    setDisplayedItems(itemList.slice(0, itemAddInterval));
    setItemListCopy(itemList);
  }

  // Replaces the scroll behaviour
  const loadMoreItems = useCallback(() => {
    setDisplayedItems((prevItems) => {
      const startIndex = prevItems.length;

      // Ensure there is more to load
      if (startIndex < itemList.length) {
        const newItems = itemList.slice(startIndex, startIndex + itemAddInterval);
        return [...prevItems, ...newItems];
      }

      // Just return same list if there is nothing more to load
      return prevItems;
    });
  }, [itemList, itemAddInterval]);

  // Actual observer code
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // If the div is visible on screen, load more
        if (entries[0].isIntersecting)
          loadMoreItems();
      },
      { threshold: 0.1 } // Fires as soon as 10% of the marker is visible
    );

    if (interObsRef.current)
      observer.observe(interObsRef.current);

    return () => {
      if (interObsRef.current) observer.unobserve(interObsRef.current);
    };
  }, [loadMoreItems]);

  // Return directly instead of deferring
  if (category === 'projects') {
    return (
      <div className="project-panel-box">
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
        <div ref={interObsRef} style={{ height: '20px', width: '100%' }} />
      </div>
    );
  }

  // Functional else statement
  return (
    <div className="profile-panel-box">
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
      <div ref={interObsRef} style={{ height: '20px', width: '100%' }} />
    </div>
  );
};
