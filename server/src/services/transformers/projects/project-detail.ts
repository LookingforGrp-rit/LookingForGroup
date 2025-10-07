import type { ProjectDetail } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectDetailSelector } from '#services/selectors/projects/project-detail.ts';
import { transformUserToPreview } from '../users/user-preview.ts';
import { transformProjectImage } from './parts/project-image.ts';
import { transformProjectJob } from './parts/project-job.ts';
import { transformProjectMember } from './parts/project-member.ts';
import { transformProjectSocial } from './parts/project-social.ts';
import { transformProjectTag } from './parts/project-tag.ts';
import { transformProjectToPreview } from './project-preview.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleProjectDetail = prisma.projects.findMany({
  select: ProjectDetailSelector,
});

type ProjectsGetPayload = Awaited<typeof sampleProjectDetail>[number];

//map to shared type
export const transformProjectToDetail = (project: ProjectsGetPayload): ProjectDetail => {
  return {
    ...transformProjectToPreview(project),
    description: project.description,
    purpose: project.purpose,
    status: project.status,
    audience: project.audience,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    owner: transformUserToPreview(project.users),
    tags: project.tags.map((tag) => transformProjectTag(project.projectId, tag)),
    projectImages: project.projectImages.map((image) =>
      transformProjectImage(project.projectId, image),
    ),
    projectSocials: project.projectSocials.map((social) =>
      transformProjectSocial(project.projectId, social),
    ),
    jobs: project.jobs.map((job) => transformProjectJob(project.projectId, job)),
    members: project.members.map((member) => transformProjectMember(project.projectId, member)),
  };
};
