import type { Major } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { MajorSelector } from '#services/selectors/datasets/major.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleMajors = prisma.majors.findMany({
  select: MajorSelector,
});

type MajorsGetPayload = Awaited<typeof sampleMajors>[number];

//map to shared type
export const transformMajor = ({ majorId, label }: MajorsGetPayload): Major => {
  return {
    majorId,
    label,
  };
};
