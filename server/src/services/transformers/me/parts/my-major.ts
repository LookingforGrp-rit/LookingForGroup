import type { MyMajor } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { MyMajorSelector } from '#services/selectors/me/parts/my-major.ts';
import { transformMajor } from '#services/transformers/datasets/major.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleMajor = prisma.majors.findMany({
  select: MyMajorSelector,
});

type UserMajorGetPayload = Awaited<typeof sampleMajor>[number];

//map to shared type
export const transformMyMajor = ({ label, majorId }: UserMajorGetPayload): MyMajor => {
  return {
    apiUrl: `api/me/majors/${majorId.toString()}`,
    ...transformMajor({ label, majorId }),
  };
};
