import type { ProjectFollowers } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectFollowersSelector } from '#services/selectors/projects/parts/project-followers.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectToFollowers } from '#services/transformers/projects/parts/project-followers.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//GET api/projects/{id}/followers
const getProjectFollowersService = async (
  projectId: number,
): Promise<ProjectFollowers | GetServiceError> => {
  try {
    const project = await prisma.projects.findUnique({
      where: {
        projectId,
      },
      select: ProjectFollowersSelector,
    });

    if (!project) return 'NOT_FOUND';

    //return transformed projects
    const transformedFollowers = transformProjectToFollowers(project);

    //Array is alphabetized by first name
    transformedFollowers.users = transformedFollowers.users.toSorted(
      (user1, user2) => user1.user.firstName.charCodeAt(0) - user2.user.firstName.charCodeAt(0),
    );

    return transformedFollowers;
  } catch (e) {
    console.error(`Error in getProjectsService: ${e as Error}`);

    return 'INTERNAL_ERROR';
  }
};

export default getProjectFollowersService;
