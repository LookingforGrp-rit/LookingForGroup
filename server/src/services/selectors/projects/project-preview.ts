import { UserPreviewSelector } from '../users/user-preview.ts';
import { ProjectMediumSelector } from './parts/project-medium.ts';

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
  mediums: {
    select: ProjectMediumSelector,
  },
});
