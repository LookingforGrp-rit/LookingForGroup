import type { ProjectTag } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectTagSelector } from '#services/selectors/projects/parts/project-tag.ts';

//sample project tag from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleTag = prisma.tags.findMany({
  select: ProjectTagSelector,
});

type ProjectTagGetPayload = Awaited<typeof sampleTag>[number];

//map to shared type
export const transformProjectTag = (
  projectId: number,
  { label, tagId, type }: ProjectTagGetPayload,
): ProjectTag => {
  return {
    apiUrl: `/api/projects/${projectId.toString()}/tags/${tagId.toString()}`,
    tagId,
    label,
    type,
  };
};
