import type { ProjectFollowers } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectFollowersSelector } from '#services/selectors/projects/parts/project-followers.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectToFollowers } from '#services/transformers/projects/parts/project-followers.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

const getProjectsService = async (
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
    return transformedFollowers;
  } catch (e) {
    console.error(`Error in getProjectsService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default getProjectsService;
