import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as paths from '../constants/routes';
import placeholderThumbnail from '../images/project_temp.png';
import { addProjectFollowing, deleteProjectFollowing, getCurrentAccount, getProjectFollowing } from '../api/users.ts';
import { Tag as TagElement } from './Tag';

//import shares types
import usePreloadedImage from '../functions/imageLoad.tsx';
import { ProjectWithFollowers, ProjectMedium } from '@looking-for-group/shared';
import React from 'react';
import { getByID } from '../api/projects.ts';
import { ThemeIcon } from './ThemeIcon.tsx';

//Component that will contain info about a project, used in the discovery page
//Takes in a 'project' value which contains info on the project it will display
//Also takes in width (the width of this panel), and rightAlign, which determines which side the hover panel aligns with

interface ProjectPanelProps {
  project: ProjectWithFollowers;
  initialIsFollowing?: boolean;
  currentUserId: number;
}

/**
 * Displays a preview panel for a project, used in discovery pages.
 * Shows project thumbnail, title, follow count, and top tags/mediums.
 * Allows users to follow/unfollow the project and navigate to the full project page.
 *
 * @param project - ProjectWithFollowers object containing project info, thumbnail, tags, and follower data
 * @returns JSX element rendering a clickable project preview panel with follow functionality
 */
export const ProjectPanel = ({ project, initialIsFollowing, currentUserId }: ProjectPanelProps) => {
  const navigate = useNavigate();
  const projectURL = `${paths.routes.PROJECT}?projectID=${project.projectId}`;

  // Current user ID (for follow logic)
  const [userId, setUserId] = useState<number>(currentUserId);
  // Local state for follow count and current user's follow status
  const [followCount, setFollowCount] = useState(project.followers?.count ?? 0);
  const [isFollowing, setFollowing] = useState(initialIsFollowing ?? false);

  useEffect(() => {
    setFollowing(initialIsFollowing ?? false);
  }, [initialIsFollowing]);

  const shouldCheckFollow = initialIsFollowing === undefined;
  // Avoid looping useEffect by separating projectId
  const projectId = project.projectId; //just so the useEffect doesn't loop at me for using the object directly


  /**
   * Formats the follow count for display
   * - Uses "K" notation for thousands
   * - Appends '+' if number is an exact multiple of 100
   *
   * @param followers - number of followers
   * @returns formatted string for UI
   */
  const formatFollowCount = (followers: number): string => {
    if (followers >= 1000) {
      const multOfHundred = (followers % 100) === 0;
      const formattedNum = (followers / 1000).toFixed(1);
      return `${formattedNum}K ${multOfHundred ? '+' : ''}`;
    }
    return `${followers}`;
  };

  /**
   * Checks whether the current user is following this project
   * - Uses `getProjectFollowing` API
   * - Updates `isFollowing` state
   *
   * @returns boolean indicating follow status
   */
  const checkFollow = useCallback(async () => {
    if (userId !== -1 && userId) {
      const followings = (await getProjectFollowing(userId)).data?.projects;

      let isFollow = false;

      if (followings !== undefined) {
        for (const follower of followings) {
          isFollow = (follower.project.projectId === project.projectId);
          if (isFollow) break;
        }
      }
      setFollowing(isFollow);
      return isFollow;

    }
  }, [project, userId]);

  // Fetch current user ID and up-to-date project follower info
  useEffect(() => {
    const getProjectData = async () => {
      //get our current user for use later
      if (!userId && userId !== -1) {
        const userResp = await getCurrentAccount();
        if (userResp.data) setUserId(userResp.data.userId);
      }

      // Check if we already have full project data with followers
      // If not, fetch it to get the current follower count
      if (!project.followers) {
        const projectResp = await getByID(projectId);
        if (projectResp.data) {
          setFollowCount(projectResp.data.followers.count);
        }
      } else {
        setFollowCount(project.followers.count);
      }
      
      if (shouldCheckFollow) {
        checkFollow();
      }

      if (project.title == "thumbnail") {
        console.log("Thumbnail project's thumbnail:");
        console.log(project.thumbnail);
      }
    };
    getProjectData();
  }, [projectId, userId, checkFollow, project.followers, shouldCheckFollow])

  /**
   * Handles click on the follow/unfollow button
   * - Stops propagation to prevent navigating to project page
   * - Redirects to login if user is not logged in
   * - Updates local follow state and server via API
   */
  const handleFollowClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!userId || userId === -1) {
      navigate(paths.routes.LOGIN);
      return;
    }
    const toggleFollow = !await checkFollow();
    setFollowing(toggleFollow);

    if (toggleFollow) {
      await addProjectFollowing(project.projectId);
      setFollowing(true);
      setFollowCount(followCount + 1);

    } else {
      await deleteProjectFollowing(project.projectId);
      setFollowing(false);
      setFollowCount(followCount - 1);
    }
  };

  return (
    <a href={projectURL} className='project-link'>
      <div className={'project-panel'}>
        <div className="project-image-container">
          <img
            src={usePreloadedImage(`${project.thumbnail?.image}`, placeholderThumbnail)}
            alt={'project image'}
          />
          <div className={'project-panel-hover'}>
            <div id="quote">{project.hook}</div>
          </div>
        </div>

        <div className='project-title-likes'>
          <a href={projectURL}><h2>{project.title}</h2></a>
          <div className='project-likes'>
            <p className={`follow-amt ${isFollowing ? 'following' : ''}`}>
              {formatFollowCount(followCount)}
            </p>
            <a href="javascript:void(0)">
            {isFollowing ? (
              <ThemeIcon
                width={28}
                height={25}
                id={"heart-filled"}
                ariaLabel="following"
                onClick={(e) => handleFollowClick((e as unknown) as React.MouseEvent<HTMLButtonElement, MouseEvent>)}
              />
            ) : (
              <ThemeIcon
                width={28}
                height={25}
                id={"heart-empty"}
                ariaLabel="following"
                onClick={(e) => handleFollowClick((e as unknown) as React.MouseEvent<HTMLButtonElement, MouseEvent>)}
              />
            )}
            </a>
          </div>
        </div>
        <a href={projectURL}>
          <ProjectPanelMeta project={project} />
        </a>
      </div>
    </a>
  );
};

type MetaItem = { label: string; type: string };

/**
 * Renders the bottom row of the project card: the leading medium tag, a `+X`
 * collapsed indicator for the off-hover state, and as many extra tags as
 * physically fit on one line for the on-hover state (with a smaller `+Y`
 * trailing chip for any that don't fit). Uses a hidden ghost row to measure
 * each candidate tag's width and recomputes when the meta row resizes.
 */
const ProjectPanelMeta = ({ project }: { project: ProjectWithFollowers }) => {
  const allExtras = useMemo<MetaItem[]>(() => {
    const fromMediums = (project.mediums ?? []).slice(1).map((m) => ({
      label: (m as ProjectMedium).label,
      type: 'medium',
    }));
    const fromTags = (project.tags ?? []).map((t) => ({
      label: t.label,
      type: t.type?.toLowerCase() ?? '',
    }));
    return [...fromMediums, ...fromTags];
  }, [project.mediums, project.tags]);

  const remaining = allExtras.length;
  const metaRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(remaining);

  useLayoutEffect(() => {
    if (remaining === 0) return;

    const compute = () => {
      const meta = metaRef.current;
      const ghost = ghostRef.current;
      if (!meta || !ghost) return;

      // Look up the live sibling elements we need to size against.
      const card = meta.closest('.project-panel') as HTMLElement | null;
      const titleLikes = card?.querySelector('.project-title-likes') as HTMLElement | null;
      const hookOverlay = card?.querySelector('.project-panel-hover') as HTMLElement | null;
      if (!card || !titleLikes || !hookOverlay) return;

      const styles = getComputedStyle(meta);
      const padTop = parseFloat(styles.paddingTop || '0');
      const padBottom = parseFloat(styles.paddingBottom || '0');
      const padLeft = parseFloat(styles.paddingLeft || '0');
      const padRight = parseFloat(styles.paddingRight || '0');
      const gap = parseFloat(styles.rowGap || styles.gap || '0') || 6;

      const cardH = card.getBoundingClientRect().height;
      const titleH = titleLikes.getBoundingClientRect().height;
      // Natural height of the hook overlay's content - what the hook needs in
      // order to render without cropping.
      const hookH = hookOverlay.scrollHeight;

      const availableMetaH = cardH - titleH - hookH;
      const availableMetaW = meta.clientWidth - padLeft - padRight;

      if (availableMetaH <= padTop + padBottom || availableMetaW <= 0) {
        setVisibleCount(0);
        return;
      }

      const ghostChildren = Array.from(ghost.children) as HTMLElement[];
      if (ghostChildren.length < 2) return;
      // Layout in ghost: [medium, ...extras, +N placeholder]
      const widthOf = (el: HTMLElement) => el.getBoundingClientRect().width;
      const heightOf = (el: HTMLElement) => el.getBoundingClientRect().height;
      const mediumWidth = widthOf(ghostChildren[0]);
      const plusWidth = widthOf(ghostChildren[ghostChildren.length - 1]);
      const extraWidths = ghostChildren.slice(1, -1).map(widthOf);
      const tagH = heightOf(ghostChildren[0]);

      // Simulate flex-wrap layout: how many rows do `widths` take?
      const simulateRows = (widths: number[]) => {
        let rows = 1;
        let used = 0;
        for (const w of widths) {
          const incr = used > 0 ? gap + w : w;
          if (used + incr > availableMetaW) {
            rows++;
            used = w;
          } else {
            used += incr;
          }
        }
        return rows;
      };

      const heightForRows = (rows: number) =>
        rows * tagH + Math.max(0, rows - 1) * gap + padTop + padBottom;

      // First pass: does the full set fit with no overflow chip?
      const allRows = simulateRows([mediumWidth, ...extraWidths]);
      if (heightForRows(allRows) <= availableMetaH) {
        setVisibleCount(extraWidths.length);
        return;
      }

      // Second pass: scan down for the largest N where N visible extras +
      // a trailing +Y chip still fits within the available height.
      for (let n = extraWidths.length - 1; n >= 0; n--) {
        const items = [mediumWidth, ...extraWidths.slice(0, n), plusWidth];
        const rows = simulateRows(items);
        if (heightForRows(rows) <= availableMetaH) {
          setVisibleCount(n);
          return;
        }
      }
      setVisibleCount(0);
    };

    compute();
    // Re-measure once web fonts settle; fallback widths can mis-size tags.
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => compute()).catch(() => {});
    }
    const observer = new ResizeObserver(compute);
    if (metaRef.current) observer.observe(metaRef.current);
    return () => observer.disconnect();
  }, [remaining, allExtras, project.hook]);

  const shown = allExtras.slice(0, visibleCount);
  const overflow = remaining - shown.length;

  return (
    <div className='project-panel-meta' ref={metaRef}>
      {project.mediums?.[0] && (
        <TagElement type="medium" selected={true}>
          <p>{(project.mediums[0] as ProjectMedium).label}</p>
        </TagElement>
      )}

      {remaining > 0 && (
        <>
          <TagElement selected={true} className='project-panel-meta-plus'>
            <p>+{remaining}</p>
          </TagElement>

          <div className='project-panel-meta-extra'>
            {shown.map((item, i) => (
              <TagElement key={i} type={item.type} selected={true}>
                <p>{item.label}</p>
              </TagElement>
            ))}
            {overflow > 0 && (
              <TagElement selected={true} className='project-panel-meta-plus'>
                <p>+{overflow}</p>
              </TagElement>
            )}
          </div>

          {/* Hidden measurement copy: contains every candidate so we can read
              their real rendered widths and decide how many fit on-hover. */}
          <div className='project-panel-meta-ghost' ref={ghostRef} aria-hidden>
            <TagElement type="medium" selected={true}>
              <p>{(project.mediums?.[0] as ProjectMedium | undefined)?.label ?? ''}</p>
            </TagElement>
            {allExtras.map((item, i) => (
              <TagElement key={`g-${i}`} type={item.type} selected={true}>
                <p>{item.label}</p>
              </TagElement>
            ))}
            <TagElement selected={true} className='project-panel-meta-plus'>
              <p>+{remaining}</p>
            </TagElement>
          </div>
        </>
      )}
    </div>
  );
};