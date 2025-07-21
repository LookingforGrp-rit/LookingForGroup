import prisma from '#config/prisma.ts';
import type { Prisma } from '#prisma-models/index.js';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type UpdateThumbnailServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

const updateThumbnailService = async (
  projectId: number,
  thumbnail: Prisma.ProjectsUpdateInput,
): Promise<boolean | UpdateThumbnailServiceError> => {
  try {
    await prisma.projects.update({
      where: { projectId },
      data: thumbnail,
      select: {
        thumbnail: true,
      },
    });

    return true;
  } catch (e) {
    console.error('Error in updateThumbnailService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default updateThumbnailService;
