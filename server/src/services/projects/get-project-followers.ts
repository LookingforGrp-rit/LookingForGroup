import type { ProjectFollowers } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectFollowersSelector } from '#services/selectors/projects/parts/project-followers.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectToFollowers } from '#services/transformers/projects/parts/project-followers.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

const getProjectsService = async (
  projectId: number,
): Promise<ProjectFollowers[] | GetServiceError> => {
  try {
    const result = await prisma.projects.findMany({
      where: {
        projectId,
      },
      select: ProjectFollowersSelector,
    });

    //return transformed projects
    const transformedFollowers = result.map(transformProjectToFollowers);
    return transformedFollowers;
  } catch (e) {
    console.error(`Error in getProjectsService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default getProjectsService;
