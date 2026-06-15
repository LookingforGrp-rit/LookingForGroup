import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type DeleteVideoServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type DeleteVideoServiceSuccess = ServiceSuccessSubset<'NO_CONTENT'>;

//DELETE api/projects/{id}/videos/{video_id}
//gets all the videos for a project
const deleteVideoService = async (
  videoId: number,
): Promise<DeleteVideoServiceSuccess | DeleteVideoServiceError> => {
  try {
    //delete video
    await prisma.projectVideos.delete({
      where: {
        videoId,
      },
    });

    return 'NO_CONTENT';
  } catch (e) {
    console.error('Error in deleteVideoService:', e);
    if (e instanceof Object && 'code' in e) {
      if (e.code === 'P2025') {
        return 'NOT_FOUND';
      }
    }
    return 'INTERNAL_ERROR';
  }
};

export default deleteVideoService;
