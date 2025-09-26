import { RoleSelector } from '#services/selectors/datasets/role.ts';
import { ProjectPreviewSelector } from '#services/selectors/projects/project-preview.ts';

export const UserMemberSelector = Object.freeze({
  userId: true,
  projects: {
    select: ProjectPreviewSelector,
  },
  profileVisibility: true,
  roles: {
    select: RoleSelector,
  },
  createdAt: true,
});
