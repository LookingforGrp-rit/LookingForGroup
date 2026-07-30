import type { ProjectMember } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectMemberSelector } from '#services/selectors/projects/parts/project-member.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectMember } from '#services/transformers/projects/parts/project-member.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//GET api/projects/{id}/members
const getMembersService = async (projectId: number): Promise<ProjectMember[] | GetServiceError> => {
  try {
    let members = await prisma.members.findMany({
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

    //Array is alphabetized by first name
    members = members.toSorted(
      (member1, member2) =>
        member1.users.firstName.charCodeAt(0) - member2.users.firstName.charCodeAt(0),
    );

    return members.map((member) => transformProjectMember(projectId, member));
  } catch (e) {
    console.error(`Error in getMemberssService: ${e as Error}`);

    return 'INTERNAL_ERROR';
  }
};

export default getMembersService;
