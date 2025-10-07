import type { AddProjectMediumsInput, ProjectMedium } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectMediumSelector } from '#services/selectors/projects/parts/project-medium.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectMedium } from '#services/transformers/projects/parts/project-medium.ts';

type AddMediumsServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;

const addMediumsService = async (
  projectId: number,
  data: AddProjectMediumsInput,
): Promise<ProjectMedium[] | AddMediumsServiceError> => {
  try {
    const result = await prisma.projects.update({
      where: {
        projectId,
      },
      data: {
        mediums: {
          connect: { mediumId: data.mediumId },
        },
      },
      include: {
        mediums: {
          where: data,
          select: ProjectMediumSelector,
        },
      },
    });

    return result.mediums.map((medium) => transformProjectMedium(projectId, medium));
  } catch (e) {
    if (e instanceof Object && 'code' in e) {
      if (e.code === 'P2025') {
        return 'NOT_FOUND';
      }

      if (e.code === 'P2002') {
        return 'CONFLICT';
      }
    }

    console.error('Error in addMediumsService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default addMediumsService;
