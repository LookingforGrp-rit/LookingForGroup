import { RoleSelector } from '#services/selectors/datasets/role.ts';
import { UserPreviewSelector } from '../../users/user-preview.ts';

export const ProjectMemberSelector = Object.freeze({
  users: {
    select: UserPreviewSelector,
  },
  roles: {
    select: RoleSelector,
  },
  createdAt: true,
});
