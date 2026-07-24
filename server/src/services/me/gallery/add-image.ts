import type { GalleryImage } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { Prisma } from '#prisma-models/index.js';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type AddGalleryImageServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

//POST api/me/{userId}/gallery/images
//adds an image to a users gallery
const addGalleryImageService = async (
  data: Prisma.GalleryImagesCreateInput,
): Promise<GalleryImage | AddGalleryImageServiceError> => {
  try {
    const newImage = await prisma.galleryImages.create({
      data,
      select: {
        galleryImageId: true,
        image: true,
        altText: true,
        position: true,
        userId: true,
      },
    });

    return newImage;
  } catch (e) {
    console.error('Error in addImageService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default addGalleryImageService;
