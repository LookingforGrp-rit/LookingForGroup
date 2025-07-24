import prisma from '#config/prisma.ts';
import type { Prisma } from '#prisma-models/index.js';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type UpdateImageServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

const updateImageService = async (
  imageId: number,
  updates: Prisma.ProjectImagesUpdateInput,
): Promise<boolean | UpdateImageServiceError> => {
  try {
    const image = await prisma.projectImages.findUnique({ where: { imageId } });
    if (!image) return 'NOT_FOUND';

    await prisma.projectImages.update({
      where: { imageId },
      data: updates,
    });

    return true;
  } catch (e) {
    console.error('Error in updateImageService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default updateImageService;
