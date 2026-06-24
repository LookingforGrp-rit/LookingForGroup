import { ProjectImageSelector } from './parts/project-image.ts';
import { ProjectMemberSelector } from './parts/project-member.ts';
import { ProjectSocialSelector } from './parts/project-social.ts';
import { ProjectVideoSelector } from './parts/project-video.ts';
import { ProjectPreviewSelector } from './project-preview.ts';

export const ProjectDetailSelector = Object.freeze({
  ...ProjectPreviewSelector,
  description: true,
  purpose: true,
  status: true,
  audience: true,
  createdAt: true,
  updatedAt: true,
  projectImages: {
    select: ProjectImageSelector,
  },
  projectVideos: {
    select: ProjectVideoSelector,
  },
  projectSocials: {
    select: ProjectSocialSelector,
  },
  members: {
    select: ProjectMemberSelector,
  },
});
