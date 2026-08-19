import prisma from '#config/prisma.ts';
import type { Prisma } from '#prisma-models/index.js';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type AddVideoServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type AddVideoServiceSuccess = ServiceSuccessSubset<'CREATED'>;

//POST api/gallery/{userId}/videos
//adds an video to users gallery
const addGalleryVideoService = async (
  data: Prisma.GalleryVideosCreateInput,
): Promise<AddVideoServiceSuccess | AddVideoServiceError> => {
  try {
    //add video
    await prisma.galleryVideos.create({
      data,
    });

    return 'CREATED';
  } catch (e) {
    console.error('Error in addGalleryVideoService:', e);

    return 'INTERNAL_ERROR';
  }
};

export default addGalleryVideoService;
