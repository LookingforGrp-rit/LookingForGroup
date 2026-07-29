import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type DeleteVideoServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type DeleteVideoServiceSuccess = ServiceSuccessSubset<'NO_CONTENT'>;

//DELETE api/projects/{userId}/gallery/videos/{videoId}
//deletes a video in the gallery
const deleteGalleryVideoService = async (
  userId: number,
  videoId: number,
): Promise<DeleteVideoServiceSuccess | DeleteVideoServiceError> => {
  try {
    const video = await prisma.galleryVideos.findFirst({
      where: { galleryVideoId: videoId, userId },
    });

    if (!video) {
      return 'NOT_FOUND';
    }

    //delete video
    await prisma.galleryVideos.delete({
      where: {
        galleryVideoId: videoId,
      },
    });

    return 'NO_CONTENT';
  } catch (e) {
    console.error('Error in deletegalleryVideoService:', e);
    if (e instanceof Object && 'code' in e) {
      if (e.code === 'P2025') {
        return 'NOT_FOUND';
      }
    }
    return 'INTERNAL_ERROR';
  }
};

export default deleteGalleryVideoService;
