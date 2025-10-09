import type { ProjectMember } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectMemberSelector } from '#services/selectors/projects/parts/project-member.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectMember } from '#services/transformers/projects/parts/project-member.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

const getMembersService = async (projectId: number): Promise<ProjectMember[] | GetServiceError> => {
  try {
    const members = await prisma.members.findMany({
      where: { projectId },
      select: ProjectMemberSelector,
      orderBy: {
        users: {
          firstName: 'asc',
        },
      },
    });

    if (members.length === 0) {
      return 'NOT_FOUND';
    }

    return members.map((member) => transformProjectMember(projectId, member));
  } catch (e) {
    console.error(`Error in getMemberssService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default getMembersService;
