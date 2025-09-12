import type { Tag, TagType } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { TagSelector } from '#services/selectors/datasets/tag.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleTags = prisma.tags.findMany({
  select: TagSelector,
});

type TagsGetPayload = Awaited<typeof sampleTags>[number];

//map to shared type
export const transformTag = ({ tagId, label, type }: TagsGetPayload): Tag => {
  return {
    tagId,
    label,
    type: type as TagType,
  };
};
