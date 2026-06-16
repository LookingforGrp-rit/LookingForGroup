import type { ProjectPreview, TagCategory, TagType } from '@looking-for-group/shared';
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleUnapprovedPreview = prisma.projectsAwaitingApproval.findMany({
  include: {
    project: {
      select: ProjectPreviewSelector,
    },
  },
});

type ProjectsGetPayload = Awaited<typeof sampleProjectPreview>[number];
type AwaitApprovalPayload = Awaited<typeof sampleUnapprovedPreview>[number];

//map to shared type
export const transformProjectToPreview = (project: ProjectsGetPayload): ProjectPreview => {
  const transformedObj = {
    projectId: project.projectId,
    title: project.title,
    hook: project.hook,
    globalVisibility: project.globalVisibility,
    tags: project.tags.map((tag) =>
      transformProjectTag(project.projectId, {
        label: tag.tag.label, //tag.tag :cinema:
        tagId: tag.tagId,
        type: tag.tag.type as TagType,
        displayOrder: tag.displayOrder,
        category: tag.tag.category as TagCategory,
      }),
    ),
    owner: transformUserToPreview(project.users),
    mediums: project.mediums.map((medium) => transformProjectMedium(project.projectId, medium)),
    apiUrl: `/api/projects/${project.projectId.toString()}`,
  } as unknown as ProjectPreview;

  if (project.thumbnail)
    transformedObj.thumbnail = transformProjectImage(project.projectId, project.thumbnail);
  return transformedObj;
};

export const transformUnapprovedToPreview = (payload: AwaitApprovalPayload): ProjectPreview => {
  const project = payload.project;
  const transformedObj = {
    projectId: project.projectId,
    title: project.title,
    hook: project.hook,
    tags: project.tags.map((tag) =>
      transformProjectTag(project.projectId, {
        label: tag.tag.label, //tag.tag :cinema:
        tagId: tag.tagId,
        type: tag.tag.type as TagType,
        displayOrder: tag.displayOrder,
        category: tag.tag.category as TagCategory,
      }),
    ),
    owner: transformUserToPreview(project.users),
    mediums: project.mediums.map((medium) => transformProjectMedium(project.projectId, medium)),
    apiUrl: `/api/projects/${project.projectId.toString()}`,
  } as unknown as ProjectPreview;

  if (project.thumbnail)
    transformedObj.thumbnail = transformProjectImage(project.projectId, project.thumbnail);
  return transformedObj;
};
