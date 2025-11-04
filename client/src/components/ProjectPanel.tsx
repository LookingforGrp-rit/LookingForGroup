import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as paths from '../constants/routes';
import placeholderThumbnail from '../images/project_temp.png';
import { addProjectFollowing, deleteProjectFollowing, getCurrentAccount, getProjectFollowing } from '../api/users.ts';

//import shares types
import usePreloadedImage from '../functions/imageLoad.tsx';
import { ProjectWithFollowers, ProjectMedium, Tag } from '@looking-for-group/shared';
import React from 'react';
import { getByID } from '../api/projects.ts';

//Component that will contain info about a project, used in the discovery page
//Smaller and more concise than ProjectCard.tsx

//Takes in a 'project' value which contains info on the project it will display
//Also takes in width (the width of this panel), and rightAlign, which determines which side the hover panel aligns with

//backend base url for getting images

interface ProjectPanelProps {
  project: ProjectWithFollowers;
}

export const ProjectPanel = ({ project }: ProjectPanelProps) => {
  const navigate = useNavigate();
  const projectURL = `${paths.routes.NEWPROJECT}?projectID=${project.projectId}`;

  const [userId, setUserId] = useState<number>();
  const [followCount, setFollowCount] = useState(project.followers?.count ?? 0);
  const [isFollowing, setFollowing] = useState(false);
  const projectId = project.projectId; //just so the useEffect doesn't loop at me for using the object directly

  // Formats follow-count based on Figma design. Returns a string
  const formatFollowCount = (followers: number): string => {
    if (followers >= 1000) {
      const multOfHundred = (followers % 100) === 0;
      const formattedNum = (followers / 1000).toFixed(1);
      return `${formattedNum}K ${multOfHundred ? '+' : ''}`;
    }
    return `${followers}`;
  };

  // Maps the tag type with associated color
  const getTagCategory = (type: string) => {
    switch(type) {
      case 'Designer Skill':
        return 'red';
      case 'Developer Skill':
        return 'yellow';
      case 'Soft Skill':
        return 'purple';
      case 'Creative':
      case 'Games':
        return 'green';
      default:
        return 'grey';
    }
  };
  //checking function for if the current user is following a project
const checkFollow = useCallback(async () => {
  if(userId){
  const followings = (await getProjectFollowing(userId)).data?.projects;

  let isFollow = false;

  if(followings !== undefined){
  for (const follower of followings){
    isFollow = (follower.project.projectId === project.projectId);
    if(isFollow) break;
  }
  }
  setFollowing(isFollow);
  return isFollow;

  }
}, [project, userId]);
useEffect(() => {
  const getProjectData = async () => {
    //get our current user for use later
    const userResp = await getCurrentAccount();
    if(userResp.data) setUserId(userResp.data.userId);
    
    //get the project itself
    const projectResp = await getByID(projectId);
    if (projectResp.data) { 
      setFollowCount(projectResp.data.followers.count);
      checkFollow();
    }
  };
    getProjectData();
}, [projectId, userId, checkFollow])


  const handleFollowClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!userId || userId === 0) {
      navigate(paths.routes.LOGIN);
      return;
    }
    const toggleFollow = !await checkFollow();
    setFollowing(toggleFollow);

    if(toggleFollow) {
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
    // <div className={'project-panel'} style={{ width: width }}>
    <div className={'project-panel'}>
      <img
        src={usePreloadedImage(`${project.thumbnail?.image}`, placeholderThumbnail)}
        alt={'project image'}
      />
      <div
        className={'project-panel-hover'}
        onClick={() => navigate(projectURL)}
      // style={rightAlign ? { width: width, right: 0 } : { width: width }}
      >
        <img
          src={usePreloadedImage(`${project.thumbnail?.image}`, placeholderThumbnail)}
          alt={'project image'}
        />
        {/* <h2>{project.title}</h2> */}
        <div className='project-title-likes'>
          <h2>{project.title}</h2>
          <div className='project-likes'>
            <p className={`follow-amt ${isFollowing ? 'following' : ''}`}>
              {formatFollowCount(followCount)}
            </p>
            <button
              className={`follow-icon ${isFollowing ? 'following' : ''}`}
              onClick={handleFollowClick}
              title={isFollowing ? "Unfollow" : "Follow"}
            >
              <i className={`fa-solid fa-heart ${isFollowing ? 'following' : ''}`}></i>
            </button>
          </div>
        </div>
        <div id="project-panel-tags">
          {project.mediums.map((medium: ProjectMedium) => (
            <div className='skill-tag-label label-blue' key={medium.mediumId}>
              {medium.label}
            </div>
          ))}
          {project.tags?.slice(0, 3)
            .map((tag: Tag) => {
              return (
                <div className={`skill-tag-label label-${getTagCategory(tag.type)}`} key={tag.tagId}>
                  {tag.label}
                </div>
              );
          })}
        </div>
        <div id="quote">{project.hook}</div>
      </div>
    </div>
  );
};
