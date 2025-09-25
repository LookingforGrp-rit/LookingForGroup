import { RoleSelector } from '#services/selectors/datasets/role.ts';
import { UserPreviewSelector } from '#services/selectors/users/user-preview.ts';

export const ProjectJobSelector = Object.freeze({
  jobId: true,
  roles: {
    select: RoleSelector,
  },
  availability: true,
  duration: true,
  location: true,
  compensation: true,
  contact: {
    select: {
      users: UserPreviewSelector,
    },
  },
  description: true,
  createdAt: true,
  updatedAt: true,
});
