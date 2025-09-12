import type { ProjectMedium } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectMediumSelector } from '#services/selectors/projects/parts/project-medium.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleMedium = prisma.mediums.findMany({
  select: ProjectMediumSelector,
});

type ProjectMediumGetPayload = Awaited<typeof sampleMedium>[number];

//map to shared type
export const transformProjectMedium = (
  projectId: number,
  { mediumId, label }: ProjectMediumGetPayload,
): ProjectMedium => {
  return {
    apiUrl: `api/project/${projectId.toString()}/mediums/${mediumId.toString()}`,
    mediumId,
    label,
  };
};
