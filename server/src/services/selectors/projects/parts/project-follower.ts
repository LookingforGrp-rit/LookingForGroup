import { UserPreviewSelector } from '../../users/user-preview.ts';

export const ProjectFollowerSelector = Object.freeze({
  users: {
    select: UserPreviewSelector,
  },
  followedAt: true,
});
