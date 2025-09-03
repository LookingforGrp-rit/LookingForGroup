import prisma from '#config/prisma.ts';
import { deleteImageService } from '#services/images/delete-image.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type RemoveImageServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//delete a member
export const removeImageService = async (
  projectId: number,
  imageId: number,
): Promise<ReturnType<typeof prisma.projectImages.delete> | RemoveImageServiceError> => {
  try {
    const deletedImage = await prisma.projectImages.delete({
      where: {
        projectId: projectId,
        imageId: imageId,
      },
    });

    const dbImage = deletedImage.image;

    const dbDelete = await deleteImageService(dbImage);
    if (dbDelete === 'INTERNAL_ERROR' || dbDelete === 'NOT_FOUND') return dbDelete;

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
