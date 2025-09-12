import { UserPreviewSelector } from '../../users/user-preview.ts';

export const ProjectMemberSelector = Object.freeze({
  users: {
    select: UserPreviewSelector,
  },
  roles: {
    select: {
      roleId: true,
      label: true,
    },
  },
  createdAt: true,
});
