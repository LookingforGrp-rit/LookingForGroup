import type { ProjectPreview } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectPreviewSelector } from '#services/selectors/projects/project-preview.ts';
import { transformUserToPreview } from '../users/user-preview.ts';
import { transformProjectImage } from './parts/project-image.ts';
import { transformProjectMedium } from './parts/project-medium.ts';
import { transformProjectTag } from './parts/project-tag.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleProjectPreview = prisma.projects.findMany({
  select: ProjectPreviewSelector,
});

type ProjectsGetPayload = Awaited<typeof sampleProjectPreview>[number];

//map to shared type
export const transformProjectToPreview = (project: ProjectsGetPayload): ProjectPreview => {
  const orderMap = new Map(
    project.tagOrder.map(({ tagId, displayOrder }) => [tagId, displayOrder]),
  );

  project.tags.sort(
    (a, b) =>
      (orderMap.get(a.tagId) ?? Number.MAX_SAFE_INTEGER) -
      (orderMap.get(b.tagId) ?? Number.MAX_SAFE_INTEGER),
  );

  const transformedObj = {
    projectId: project.projectId,
    title: project.title,
    hook: project.hook,
    tags: project.tags.map((tag) => transformProjectTag(project.projectId, tag)),
    owner: transformUserToPreview(project.users),
    mediums: project.mediums.map((medium) => transformProjectMedium(project.projectId, medium)),
    apiUrl: `/api/projects/${project.projectId.toString()}`,
  } as unknown as ProjectPreview;

  if (project.thumbnail)
    transformedObj.thumbnail = transformProjectImage(project.projectId, project.thumbnail);
  return transformedObj;
};
