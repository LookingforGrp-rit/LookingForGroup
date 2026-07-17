import { UserPreviewSelector } from '../users/user-preview.ts';
import { ProjectJobSelector } from './parts/project-job.ts';
import { ProjectMediumSelector } from './parts/project-medium.ts';
import { ProjectTagSelector } from './parts/project-tag.ts';

export const ProjectPreviewSelector = Object.freeze({
  projectId: true,
  title: true,
  hook: true,
  globalVisibility: true,
  jobs: {
    select: ProjectJobSelector,
  },
  users: {
    select: UserPreviewSelector,
  },
  thumbnail: true,
  thumbnailId: true,
  userId: true,
  tags: {
    select: ProjectTagSelector,
    orderBy: {
      displayOrder: 'asc' as const,
    },
  },
  mediums: {
    select: ProjectMediumSelector,
  },
});
