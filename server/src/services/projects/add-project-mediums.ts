import type { ProjectMedium } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectMediumSelector } from '#services/selectors/projects/parts/project-medium.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectMedium } from '#services/transformers/projects/parts/project-medium.ts';

type AddMediumsServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;

//the mediums (or their ids anyway)
type MediumInputs = {
  mediumIds?: number[];
};

const addMediumsService = async (
  projectId: number,
  data: MediumInputs,
): Promise<ProjectMedium[] | AddMediumsServiceError> => {
  try {
    if (!data.mediumIds) return 'NOT_FOUND';

    //had to do this one like the tags because
    //unlike user skills mediums are not tied to the project
    //so we're updating the project's mediums param rather than creating new objects
    const allMediumIds = [];
    for (let i = 0; i < data.mediumIds.length; i++) {
      allMediumIds[i] = { mediumId: data.mediumIds[i] };
    }

    const newMediums = await prisma.projects.update({
      where: {
        projectId: projectId,
      },
      data: {
        mediums: {
          connect: allMediumIds,
        },
      },
      include: {
        mediums: {
          where: {
            mediumId: {
              in: data.mediumIds,
            },
          },
          select: ProjectMediumSelector,
        },
      },
    });

    return newMediums.mediums.map((medium) => transformProjectMedium(projectId, medium));
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
