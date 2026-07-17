import type {
  ProjectMember,
  CreateProjectMemberInput,
  CreateProjectOwnerInput,
} from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectMemberSelector } from '#services/selectors/projects/parts/project-member.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectMember } from '#services/transformers/projects/parts/project-member.ts';

type AddMemberServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;

//POST api/projects/{id}/members
const addMemberService = async (
  projectId: number,
  data: CreateProjectMemberInput | CreateProjectOwnerInput,
): Promise<ProjectMember | AddMemberServiceError> => {
  try {
    // declare newMember in outer scope so it's available after branches
    let result: ProjectMember;

    // it's creating an owner
    if ('userId' in data) {
      // create owner
      const newMember = await prisma.members.create({
        data: {
          projects: { connect: { projectId } },
          users: { connect: { userId: data.userId } },
          roles: { connect: { roleId: data.roleId } },
        },
        select: {
          ...ProjectMemberSelector,
          projectId: true,
        },
      });

      result = transformProjectMember(newMember.projectId, newMember);
    } else {
      // create new member with pending role
      // will update to correct role when invitee accepts invite
      const newMember = await prisma.members.create({
        data: {
          projects: { connect: { projectId } },
          users: { connect: { userId: data.prospectiveMemberId } },
          roles: { connect: { roleId: data.roleId } },
        },
        select: {
          ...ProjectMemberSelector,
          projectId: true,
        },
      });

      result = transformProjectMember(newMember.projectId, newMember);
    }

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
