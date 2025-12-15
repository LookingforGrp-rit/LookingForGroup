import type { ProjectWithFollowers } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectWithFollowersSelector } from '#services/selectors/projects/projects-with-followers.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectToWithFollowers } from '#services/transformers/projects/project-with-followers.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//GET api/projects/{id}
const getProjectByIdService = async (
  projectId: number,
): Promise<ProjectWithFollowers | GetServiceError> => {
  try {
    const project = await prisma.projects.findUnique({
      where: { projectId },
      select: ProjectWithFollowersSelector,
    });

    //check if project exists
    if (!project) return 'NOT_FOUND';

    //return transformed project
    return transformProjectToWithFollowers(project);
  } catch (e) {
    console.error(`Error in getProjectByIdService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default getProjectByIdService;
