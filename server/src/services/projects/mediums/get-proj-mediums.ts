import type { ProjectMedium } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectMediumSelector } from '#services/selectors/projects/parts/project-medium.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectMedium } from '#services/transformers/projects/parts/project-medium.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//GET api/projects/{id}/mediums
const getProjectMediumsService = async (
  projectId: number,
): Promise<ProjectMedium[] | GetServiceError> => {
  try {
    const project = await prisma.projects.findUnique({
      where: { projectId },
      include: {
        mediums: {
          select: ProjectMediumSelector,
          orderBy: {
            label: 'asc',
          },
        },
      },
    });

    if (project === null) {
      return 'NOT_FOUND';
    }

    return project.mediums.map((medium) => transformProjectMedium(projectId, medium));
  } catch (e) {
    console.error(`Error in getProjectMediumsService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default getProjectMediumsService;
