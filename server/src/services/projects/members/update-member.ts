import type { ProjectMember } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { Prisma } from '#prisma-models/index.js';
import { ProjectMemberSelector } from '#services/selectors/projects/parts/project-member.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectMember } from '#services/transformers/projects/parts/project-member.ts';

type UpdateMemberServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

const updateMemberService = async (
  projectId_userId: Prisma.MembersProjectIdUserIdCompoundUniqueInput,
  updates: Prisma.MembersUpdateInput,
): Promise<ProjectMember | UpdateMemberServiceError> => {
  try {
    const member = await prisma.members.findUnique({ where: { projectId_userId } });
    if (!member) return 'NOT_FOUND';

    const updatedMember = await prisma.members.update({
      where: { projectId_userId },
      data: updates,
      select: { ...ProjectMemberSelector, projectId: true },
    });

    return transformProjectMember(updatedMember.projectId, updatedMember);
  } catch (e) {
    console.error('Error in updateMemberService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default updateMemberService;
