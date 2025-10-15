import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as paths from '../constants/routes';
import placeholderThumbnail from '../images/project_temp.png';
import { sendDelete, sendPost } from '../functions/fetch';
import { addProjectFollowing, deleteProjectFollowing } from '../api/users.ts';

//import shares types
import usePreloadedImage from '../functions/imageLoad.tsx';
import { ProjectWithFollowers, ProjectTag, ProjectGenres } from '@looking-for-group/shared';
import * as React from 'react';

//Component that will contain info about a project, used in the discovery page
//Smaller and more concise than ProjectCard.tsx

//Takes in a 'project' value which contains info on the project it will display
//Also takes in width (the width of this panel), and rightAlign, which determines which side the hover panel aligns with

//backend base url for getting images
const API_BASE = `http://localhost:8081`;

interface ProjectPanelProps {
  project: ProjectWithFollowers;
  userId: number;
}

export const ProjectPanel = ({ project, userId }: ProjectPanelProps) => {
  const navigate = useNavigate();
  const projectURL = `${paths.routes.NEWPROJECT}?projectID=${project.projectID}`;

  const [followCount, setFollowCount] = useState(project.followers?.count ?? 0);
  //const [isFollowing, setFollowing] = useState(project.followers.isFollowing);
  const [isFollowing, setFollowing] = useState(project.followers?.isFollowing ?? false);

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

  const handleFollowClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!userId || userId === 0) {
      navigate(paths.routes.LOGIN);
      return;
    }

    if(!isFollowing) {
      addProjectFollowing(project.projectId).then(res => {
        if (res.status === 200) {
          setFollowing(true);
          setFollowCount(followCount + 1);
        }
      });
    } else { 
      deleteProjectFollowing(project.projectId).then(res => {
        if (res.status === 200) {
          setFollowing(false);
          setFollowCount(followCount - 1);
        }
      });
    }
  };

  return (
    // <div className={'project-panel'} style={{ width: width }}>
    <div className={'project-panel'}>
      <img
        src={usePreloadedImage(`${API_BASE}/images/thumbnails/${project.thumbnail}`, placeholderThumbnail)}
        alt={'project image'}
      />
      <div
        className={'project-panel-hover'}
        onClick={() => navigate(projectURL)}
      // style={rightAlign ? { width: width, right: 0 } : { width: width }}
      >
        <img
          src={usePreloadedImage(`${API_BASE}/images/thumbnails/${project.thumbnail}`, placeholderThumbnail)}
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
          {project.projectTypes?.map((genre: ProjectGenres) => (
            <div className='skill-tag-label label-blue' key={genre.typeId}>
              {genre.label}
            </div>
          ))}
          {project.tags?.sort((a: ProjectTag, b: ProjectTag) => a.position - b.position)
            .slice(0, 3)
            .map((tag: ProjectTag) => {
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
