import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

const getProjectTagsService = async (
  projectId: number,
): Promise<Array<object> | null | GetServiceError> => {
  try {
    const project = await prisma.projects.findUnique({
      where: { projectId },
      include: {
        tags: true,
      },
    });

    if (project === null) {
      return 'NOT_FOUND';
    }

    return project.tags;
  } catch (e) {
    console.error(`Error in getProjectTagsService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default getProjectTagsService;
