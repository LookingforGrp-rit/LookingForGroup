import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type DeleteImageServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//delete a member
export const deleteImageService = async (
  projectId: number,
  imageId: number,
): Promise<ReturnType<typeof prisma.projectImages.delete> | DeleteImageServiceError> => {
  try {
    const deletedImage = await prisma.projectImages.delete({
      where: {
        projectId: projectId,
        imageId: imageId,
      },
    });

    return deletedImage;
  } catch (error) {
    console.error('Error in deleteImageService:', error);

    if (error instanceof Object && 'code' in error) {
      if (error.code === 'P2025') {
        return 'NOT_FOUND';
      }
    }

    return 'INTERNAL_ERROR';
  }
};
