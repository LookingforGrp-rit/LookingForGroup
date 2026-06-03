import type { ProjectDetail } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectDetailSelector } from '#services/selectors/projects/project-detail.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectToDetail } from '#services/transformers/projects/project-detail.ts';

type GetUnapprovedProjectsServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

export const getUnapprovedProjectsService = async (): Promise<
  ProjectDetail[] | GetUnapprovedProjectsServiceError
> => {
  try {
    const result = await prisma.projects.findMany({
      select: ProjectDetailSelector,
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        approved: false,
      },
    });

    const transformedProjects = result.map(transformProjectToDetail);
    return transformedProjects;
  } catch (e) {
    console.error('getUnapprovedProjectsService returned an error: ', e);
    return 'INTERNAL_ERROR';
  }
};
