import prisma from '#config/prisma.ts';
import { deleteImageService } from '#services/images/delete-image.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type DeleteImageServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type DeleteImageServiceSuccess = ServiceSuccessSubset<'NO_CONTENT'>;

//DELETE api/projects/{userId}/gallery/images/{imageId}
//delete a gallery image
export const deleteGalleryImageService = async (
  userId: number,
  imageId: number,
): Promise<DeleteImageServiceSuccess | DeleteImageServiceError> => {
  try {
    const image = await prisma.galleryImages.findFirst({
      where: { galleryImageId: imageId, userId },
    });

    if (!image) return 'NOT_FOUND';

    const deletedImage = await prisma.galleryImages.delete({
      where: { galleryImageId: imageId },
    });

    const dbImage = deletedImage.image;

    const dbDelete = await deleteImageService(dbImage);
    if (dbDelete === 'INTERNAL_ERROR' || dbDelete === 'NOT_FOUND') return dbDelete;

    return 'NO_CONTENT';
  } catch (error) {
    console.error('Error in deleteGalleryImageService:', error);

    return 'INTERNAL_ERROR';
  }
};
