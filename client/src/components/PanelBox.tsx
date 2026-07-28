import { VirtuosoMasonry } from '@virtuoso.dev/masonry';
import { ProjectPanel } from './ProjectPanel';
import { ProfilePanel } from './ProfilePanel';
import { ProjectWithFollowers, UserPreview, NumberDictionary, StructuredProjectInfo } from '@looking-for-group/shared';
import { useMediaQuery } from './UseMediaQuery';
import { BugPanel } from './BugPanel';
import { BugReport } from '@looking-for-group/shared';

interface MasonryContext {
  category: string;
  projectCache?: NumberDictionary<StructuredProjectInfo>;
  followedProjectIds?: Set<number>;
  userId: number;
}

// This is the actual thing that will be rendered
// It is defined outside the function so that it doesn't have to keep remounting
const MasonryItem = ({ data: item, context }: { data: unknown; context: MasonryContext }) => {
  const { category, projectCache, followedProjectIds, userId } = context;

  if (category === 'projects') {
    const projectId = (item as ProjectWithFollowers).projectId;
    const project = projectCache?.[projectId]?.full || (item as ProjectWithFollowers);
    //console.log(context);
    
    return (
      <div>
        <ProjectPanel
          project={project}
          initialIsFollowing={followedProjectIds?.has(projectId)}
          currentUserId={userId}
        />
      </div>
    );
  }
  else if (category === 'bugs')
  {
    const reportId = (item as BugReport).reportId;
    const reporterId = (item as BugReport).userId;
    return(
    <div>
      <BugPanel
        currentUserId={userId}
        reporterId={reporterId}
        reportId={reportId}
      />
    </div>);
  }
  else {
    return (
      <div>
        <ProfilePanel 
          profileData={item as UserPreview} 
          currentUserId={userId} 
        />
      </div>
    );
  }
};

/**
 * PanelBox component dynamically renders a scrollable list of either project panels or profile panels.
 * This component manages the displayed items using local state and progressively adds more items 
 * as the user scrolls to the bottom of the container. It handles both "projects" and "profiles" categories.
 *
 * @param category - Determines what type of items to display (projects, bugs, profiles)
 * @param itemList - List of items (projects or profiles) to render.
 * @returns The rendered panel box containing the items.
 */
export const PanelBox = ({ category, itemList, projectCache, followedProjectIds, userId}: 
  { category: string, itemList: unknown[], projectCache?: NumberDictionary<StructuredProjectInfo>, followedProjectIds?: Set<number>, userId: number}) => {
  // Test these
  const isMobile = useMediaQuery('(max-width: 500px)');
  const isTablet = useMediaQuery('(max-width: 1000px)');
  const isTabletProfile = useMediaQuery('(max-width: 1050px)');
  const isSmallDesktop = useMediaQuery('(max-width: 1360px');
  const isMediumDesktop = useMediaQuery('(max-width: 1640px');

  // Sanitize the list
  const validItemList = itemList?.filter(item => item !== undefined) || [];

  // Early return
  if (!itemList || itemList.length === 0) {
    return <>{category === 'projects' ? 'Sorry, no projects here' : 'Sorry, no people here'}</>;
  }

  // Dynamically determine column count
  let columns = 3; // Default for desktop

  if(category == 'profiles'){
    columns = 5; // large desktop
    if (isMediumDesktop) columns = 4;
    if (isSmallDesktop) columns = 3;
    if (isMobile) columns = 1;
    else if (isTabletProfile) columns = 2;
  }
  //This is for projects and bugs
  else{
    if (isMobile) columns = 1;
    else if (isTablet) columns = 2;
  }

  const masonryContext: MasonryContext = {
    category,
    projectCache,
    followedProjectIds,
    userId
  };

  /* 
  * This key will regenerate every time the list changes
  * Forcing Virtuoso to remount
  */
  const firstItemId = (validItemList[0] as any)?.projectId || (validItemList[0] as any)?.userId || 'empty';
  const masonryKey = `${category}-grid-${validItemList.length}-${firstItemId}`;

  // Finally! A masonry grid!
  return (
    <VirtuosoMasonry
      key={masonryKey}
      data={itemList}
      columnCount={columns}
      className="masonry"
      context={masonryContext}
      ItemContent={MasonryItem}
    />
  );
};
