import type { ProjectPreview } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectPreviewSelector } from '#services/selectors/projects/project-preview.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectToPreview } from '#services/transformers/projects/project-preview.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

const getProjectsService = async (): Promise<ProjectPreview[] | GetServiceError> => {
  try {
    const result = await prisma.projects.findMany({
      select: ProjectPreviewSelector,
      orderBy: {
        createdAt: 'desc',
      },
    });

    //return transformed projects
    const transformedProjects = result.map(transformProjectToPreview);
    return transformedProjects;
  } catch (e) {
    console.error(`Error in getProjectsService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default getProjectsService;
