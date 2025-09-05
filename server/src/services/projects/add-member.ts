import prisma from '#config/prisma.ts';
import type { Prisma } from '#prisma-models/index.js';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type AddMemberServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;

const addMemberService = async (
  data: Prisma.MembersCreateInput,
): Promise<Prisma.MembersCreateManyRolesInput | AddMemberServiceError> => {
  try {
    const result = await prisma.members.create({ data });
    return result;
  } catch (e) {
    if (e instanceof Object && 'code' in e) {
      if (e.code === 'P2025') {
        return 'NOT_FOUND';
      }

      if (e.code === 'P2002') {
        return 'CONFLICT';
      }
    }

    console.error('Error in addMemberService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default addMemberService;
