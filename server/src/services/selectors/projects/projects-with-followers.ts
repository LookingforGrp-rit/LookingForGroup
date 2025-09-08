import { ProjectFollowerSelector } from './parts/project-follower.ts';
import { ProjectDetailSelector } from './project-detail.ts';

export const ProjectWithFollowersSelector = Object.freeze({
  _count: {
    select: {
      projectFollowings: true,
    },
  },
  ...ProjectDetailSelector,
  projectFollowings: {
    select: ProjectFollowerSelector,
  },
});
