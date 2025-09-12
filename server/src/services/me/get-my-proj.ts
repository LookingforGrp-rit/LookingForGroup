import type { ProjectPreview } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectPreviewSelector } from '#services/selectors/projects/project-preview.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectToPreview } from '#services/transformers/projects/project-preview.ts';

type GetProjectsError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

export const getMyProjectsService = async (
  userId: number,
): Promise<ProjectPreview[] | GetProjectsError> => {
  try {
    //all the projects they own
    const ownedProjects = await prisma.projects.findMany({
      where: {
        userId: userId,
      },
      select: ProjectPreviewSelector,
    });
    //all the projects they're a member of
    const memberProjects = await prisma.projects.findMany({
      where: {
        members: {
          some: {
            userId: userId,
          },
        },
      },
      select: ProjectPreviewSelector,
    });

    //all the projects
    const projects = Array.prototype.concat(ownedProjects, memberProjects);

    //return not found if they don't have any
    if (projects.length === 0) return 'NOT_FOUND';

    //user helper to transform project
    const fullProject = projects.map(transformProjectToPreview);

    return fullProject;
  } catch (e) {
    console.error(`Error in getMyProjectsService: ${JSON.stringify(e)}`);
    return 'INTERNAL_ERROR';
  }
};
