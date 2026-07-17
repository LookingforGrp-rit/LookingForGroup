import type { ProjectDetail } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectDetailSelector } from '#services/selectors/projects/project-detail.ts';
import { transformProjectImage } from './parts/project-image.ts';
import { transformProjectJob } from './parts/project-job.ts';
import { transformProjectMember } from './parts/project-member.ts';
import { transformProjectSocial } from './parts/project-social.ts';
import { transformProjectVideo } from './parts/project-video.ts';
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
    context: project.context,
    status: project.status,
    audience: project.audience,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    projectImages: project.projectImages.map((image) =>
      transformProjectImage(project.projectId, image),
    ),
    projectSocials: project.projectSocials.map((social) =>
      transformProjectSocial(project.projectId, social),
    ),
    projectVideos: project.projectVideos.map((video) =>
      transformProjectVideo(project.projectId, video),
    ),
    jobs: project.jobs.map((job) => transformProjectJob(project.projectId, job)),
    members: project.members.map((member) => transformProjectMember(project.projectId, member)),
    approved: project.approved,
  };
};
