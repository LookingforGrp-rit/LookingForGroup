import type { ProjectPreview } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectPreviewSelector } from '#services/selectors/projects/project-preview.ts';
import { transformProjectMedium } from './parts/project-medium.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleProjectPreview = prisma.projects.findMany({
  select: ProjectPreviewSelector,
});

type ProjectsGetPayload = Awaited<typeof sampleProjectPreview>[number];

//map to shared type
export const transformProjectToPreview = (project: ProjectsGetPayload): ProjectPreview => {
  return {
    projectId: project.projectId,
    title: project.title,
    hook: project.hook,
    owner: project.owner,
    thumbnail: project.thumbnail,
    mediums: project.mediums.map((medium) => transformProjectMedium(project.projectId, medium)),
    apiUrl: `/api/projects/${project.projectId.toString()}`,
  };
};
