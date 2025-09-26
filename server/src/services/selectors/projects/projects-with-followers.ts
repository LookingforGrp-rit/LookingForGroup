import { UserPreviewSelector } from '../users/user-preview.ts';
import { ProjectDetailSelector } from './project-detail.ts';

export const ProjectWithFollowersSelector = Object.freeze({
  _count: {
    select: {
      projectFollowings: true,
    },
  },
  ...ProjectDetailSelector,
  projectFollowings: {
    select: {
      users: {
        select: UserPreviewSelector,
      },
    },
  },
});
