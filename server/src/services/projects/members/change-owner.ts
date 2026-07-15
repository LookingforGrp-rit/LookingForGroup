import type { ProjectMember } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { Prisma } from '#prisma-models/index.js';
import { ProjectMemberSelector } from '#services/selectors/projects/parts/project-member.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectMember } from '#services/transformers/projects/parts/project-member.ts';

type UpdateMemberServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//PATCH api/projects/{id}/members/{userId}
const changeOwnerService = async (
  projectId_userId: Prisma.MembersProjectIdUserIdCompoundUniqueInput,
): Promise<ProjectMember | UpdateMemberServiceError> => {
  try {
    const member = await prisma.members.findUnique({
      where: { projectId_userId },
      select: { ...ProjectMemberSelector, projectId: true },
    });
    if (!member) return 'NOT_FOUND';

    await prisma.projects.update({
      data: {
        userId: projectId_userId.userId,
      },
      where: {
        projectId: projectId_userId.projectId,
      },
    });

    return transformProjectMember(member.projectId, member);
  } catch (e) {
    console.error('Error in updateMemberService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default changeOwnerService;
