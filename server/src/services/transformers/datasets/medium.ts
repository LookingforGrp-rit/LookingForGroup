import type { Medium } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { MediumSelector } from '#services/selectors/datasets/medium.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleMediums = prisma.mediums.findMany({
  select: MediumSelector,
});

type MediumsGetPayload = Awaited<typeof sampleMediums>[number];

//map to shared type
export const transformMedium = ({ mediumId, label }: MediumsGetPayload): Medium => {
  return {
    mediumId,
    label,
  };
};
