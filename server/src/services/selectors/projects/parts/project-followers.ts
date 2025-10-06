import { ProjectFollowerSelector } from './project-follower.ts';

export const ProjectFollowersSelector = Object.freeze({
  projectId: true,
  _count: {
    select: {
      projectFollowings: true,
    },
  },
  projectFollowings: {
    select: ProjectFollowerSelector,
  },
});
