import type { GalleryImage } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//GET api/me/{userId}/images
//gets all images in gallery
const getGalleryImagesService = async (
  userId: number,
): Promise<GalleryImage[] | GetServiceError> => {
  try {
    const images = await prisma.galleryImages.findMany({
      where: { userId },
      orderBy: { position: 'asc' },
    });

    if (images.length === 0) {
      return [];
    }

    return images;
  } catch (e) {
    console.error(`Error in getGalleryImagesService: ${e as Error}`);
    return 'INTERNAL_ERROR';
  }
};

export default getGalleryImagesService;
