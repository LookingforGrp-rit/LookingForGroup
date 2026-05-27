import { UserPreviewSelector } from '../users/user-preview.ts';
import { ProjectMediumSelector } from './parts/project-medium.ts';
import { ProjectTagOrderSelector } from './parts/project-tag-order.ts';
import { ProjectTagSelector } from './parts/project-tag.ts';

export const ProjectPreviewSelector = Object.freeze({
  projectId: true,
  title: true,
  hook: true,
  users: {
    select: UserPreviewSelector,
  },
  thumbnail: true,
  thumbnailId: true,
  userId: true,
  tags: {
    select: ProjectTagSelector,
  },
  tagOrder: {
    select: ProjectTagOrderSelector,
    orderBy: {
      displayOrder: 'asc' as const,
    },
  },
  mediums: {
    select: ProjectMediumSelector,
  },
});
