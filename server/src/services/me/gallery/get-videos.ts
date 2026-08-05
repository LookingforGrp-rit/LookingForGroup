import type { GalleryVideo } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type AddVideoServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//GET api/me/{userId}/videos
//gets all the videos in gallery
const getGalleryVideosService = async (
  userId: number,
): Promise<GalleryVideo[] | AddVideoServiceError> => {
  try {
    //get video
    const videos = await prisma.galleryVideos.findMany({
      where: { userId },
      orderBy: { galleryVideoId: 'asc' },
    });

    return videos;
  } catch (e) {
    console.error('Error in getGalleryVideosService:', e);

    return 'INTERNAL_ERROR';
  }
};

export default getGalleryVideosService;
