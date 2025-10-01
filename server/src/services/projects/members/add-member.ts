import type { ProjectMember, CreateProjectMemberInput } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectMemberSelector } from '#services/selectors/projects/parts/project-member.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectMember } from '#services/transformers/projects/parts/project-member.ts';

type AddMemberServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;

const addMemberService = async (
  projectId: number,
  data: CreateProjectMemberInput,
): Promise<ProjectMember | AddMemberServiceError> => {
  try {
    const newMember = await prisma.members.create({
      data: {
        projects: { connect: { projectId } },
        users: { connect: { userId: data.userId } },
        roles: { connect: data.roleId ? { roleId: data.roleId } : { label: 'Member' } },
      },
      select: {
        ...ProjectMemberSelector,
        projectId: true,
      },
    });
    const result = transformProjectMember(newMember.projectId, newMember);

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
