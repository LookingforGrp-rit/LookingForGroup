import { useState } from 'react';
import { ProjectPanel } from './ProjectPanel';
import { ProfilePanel } from './ProfilePanel';

// Item list should use "useState" so that it'll re-render on the fly
// And so that no search functionality needs to be included in this component
export const PanelBox = ({ category, itemList, itemAddInterval, userId = 0 }) => {
  // Don't display all items at first, load them in periodically
  const [displayedItems, setDisplayedItems] = useState(itemList.slice(0, itemAddInterval));
  const [itemListCopy, setItemListCopy] = useState(itemList);

  // Make sure displayedItems gets updated when itemList receives API data
  if (itemList !== itemListCopy) {
    setDisplayedItems(itemList.slice(0, itemAddInterval));
    setItemListCopy(itemList);
  }

  // Adds new items to the display if user has scrolled to bottom of currently displayed list
  // Increases by intervals of "itemAddInterval" until all items have been added
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

  // Component for the project panel on the Discover page
  const ProjectPanelBox = () => {
    return (
      <div className="project-panel-box" onScroll={addItems}>
        {displayedItems.length > 0 ? (
          displayedItems.map((project) => (
            <ProjectPanel project={project} key={project.projectId} userId={userId} />
          ))
        ) : (
          <>Sorry, no projects here</>
        )}
      </div>
    );
  };

  // Component for the profile panel on the Meet page
  const ProfilePanelBox = () => {
    return (
      <div className="profile-panel-box" onScroll={addItems}>
        {displayedItems.length > 0 ? (
          displayedItems.map((profile) => (
            <ProfilePanel profileData={profile} key={profile.userId} />
          ))
        ) : (
          <>Sorry, no people here</>
        )}
      </div>
    );
  };

  return category === 'projects' ? <ProjectPanelBox /> : <ProfilePanelBox />;
};
