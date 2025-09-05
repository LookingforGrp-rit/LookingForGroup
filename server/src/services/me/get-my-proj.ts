import type { ProjectWithFollowers } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProject } from '../transformers/projects/projectTransform.ts';

type GetProjectsError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

export const getMyProjectsService = async (
  userId: number,
): Promise<ProjectWithFollowers[] | GetProjectsError> => {
  try {
    //all the projects they own
    const ownedProjects = await prisma.projects.findMany({
      where: {
        userId: userId,
      },
    });
    //all the projects they're a member of
    const memberProjects = await prisma.projects.findMany({
      where: {
        members: {
          every: {
            userId: userId,
          },
        },
      },
    });

    //all the projects
    const projects = Array.prototype.concat(ownedProjects, memberProjects);

    //return not found if they don't have any
    if (projects.length === 0) return 'NOT_FOUND';

    //user helper to transform project
    const fullProject = projects.map(transformProject);

    return fullProject;
  } catch (e) {
    console.error(`Error in getMyProjectsService: ${JSON.stringify(e)}`);
    return 'INTERNAL_ERROR';
  }
};
