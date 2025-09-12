import { UserPreviewSelector } from '../users/user-preview.ts';
import { ProjectImageSelector } from './parts/project-image.ts';
import { ProjectJobSelector } from './parts/project-job.ts';
import { ProjectMemberSelector } from './parts/project-member.ts';
import { ProjectSocialSelector } from './parts/project-social.ts';
import { ProjectTagSelector } from './parts/project-tag.ts';
import { ProjectPreviewSelector } from './project-preview.ts';

export const ProjectDetailSelector = Object.freeze({
  ...ProjectPreviewSelector,
  description: true,
  purpose: true,
  status: true,
  audience: true,
  users: {
    select: UserPreviewSelector,
  },
  createdAt: true,
  updatedAt: true,
  tags: {
    select: ProjectTagSelector,
  },
  projectImages: {
    select: ProjectImageSelector,
  },
  projectSocials: {
    select: ProjectSocialSelector,
  },
  jobs: {
    select: ProjectJobSelector,
  },
  members: {
    select: ProjectMemberSelector,
  },
});
