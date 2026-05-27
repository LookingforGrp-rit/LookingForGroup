import type { ProjectTag } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { TagSelector } from '#services/selectors/datasets/tag.ts';
import { transformTag } from '#services/transformers/datasets/tag.ts';

//sample project tag from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleTag = prisma.tags.findMany({
  select: TagSelector,
});

type ProjectTagGetPayload = Awaited<typeof sampleTag>[number];

//map to shared type
export const transformProjectTag = (
  projectId: number,
  { label, tagId, type }: ProjectTagGetPayload,
): ProjectTag => {
  return {
    apiUrl: `/api/projects/${projectId.toString()}/tags/${tagId.toString()}`,
    ...transformTag({ label, tagId, type }),
  };
};
