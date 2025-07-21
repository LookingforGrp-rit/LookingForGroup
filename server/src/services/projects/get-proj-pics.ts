import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

const getProjectPicturesService = async (
  projectId: number,
): Promise<Array<object> | null | GetServiceError> => {
  try {
    const project = await prisma.projects.findUnique({
      where: { projectId },
      include: {
        projectImages: true,
      },
    });

    if (project === null) {
      return 'NOT_FOUND';
    }

    return project.projectImages;
  } catch (e) {
    console.error(`Error in getProjectPicturesService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default getProjectPicturesService;
