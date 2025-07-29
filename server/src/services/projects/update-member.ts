import prisma from '#config/prisma.ts';
import type { Prisma } from '#prisma-models/index.js';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type UpdateMemberServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

const updateMemberService = async (
  projectId_userId: Prisma.MembersProjectIdUserIdCompoundUniqueInput,
  updates: Prisma.MembersUpdateInput,
): Promise<Prisma.MembersUpdateInput | UpdateMemberServiceError> => {
  try {
    const member = await prisma.members.findUnique({ where: { projectId_userId } });
    if (!member) return 'NOT_FOUND';

    const update = await prisma.members.update({
      where: { projectId_userId },
      data: updates,
    });

    return update;
  } catch (e) {
    console.error('Error in updateMemberService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default updateMemberService;
