import { UserPreviewSelector } from '../users/user-preview.ts';
import { ProjectMediumSelector } from './parts/project-medium.ts';
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
  mediums: {
    select: ProjectMediumSelector,
  },
});
