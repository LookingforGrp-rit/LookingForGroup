import prisma from '#config/prisma.ts';
import type { Prisma } from '#prisma-models/index.js';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type AddMemberServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

const addMemberService = async (
  data: Prisma.MembersCreateInput,
): Promise<Prisma.MembersCreateManyJobTitlesInput | AddMemberServiceError> => {
  try {
    const result = await prisma.members.create({ data });
    return result;
  } catch (e) {
    console.error('Error in addMemberService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default addMemberService;
