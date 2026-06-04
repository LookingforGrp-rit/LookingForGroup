import type { ProjectPreview } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectPreviewSelector } from '#services/selectors/projects/project-preview.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectToPreview } from '#services/transformers/projects/project-preview.ts';

type GetUnapprovedProjectsServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

export const getUnapprovedProjectsService = async (): Promise<
  ProjectPreview[] | GetUnapprovedProjectsServiceError
> => {
  try {
    const result = await prisma.projects.findMany({
      select: ProjectPreviewSelector,
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        approved: false,
      },
    });

    const transformedProjects = result.map(transformProjectToPreview);
    return transformedProjects;
  } catch (e) {
    console.error('getUnapprovedProjectsService returned an error: ', e);
    return 'INTERNAL_ERROR';
  }
};
