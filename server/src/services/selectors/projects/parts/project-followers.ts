import { UserPreviewSelector } from '../../users/user-preview.ts';

export const ProjectFollowersSelector = Object.freeze({
  projectId: true,
  _count: {
    select: {
      projectFollowings: true,
    },
  },
  projectFollowings: {
    select: {
      users: {
        select: UserPreviewSelector,
      },
    },
  },
});
