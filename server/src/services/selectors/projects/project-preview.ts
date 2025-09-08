import { ProjectMediumSelector } from './parts/project-medium.ts';

export const ProjectPreviewSelector = Object.freeze({
  projectId: true,
  title: true,
  hook: true,
  thumbnail: true,
  mediums: {
    select: ProjectMediumSelector,
  },
});
