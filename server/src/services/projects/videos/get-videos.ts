import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type AddVideoServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type ProjectVideo = {
  videoId: number;
  videoUrl: string;
  title: string;
  position: number;
  projectId: number;
};

//GET api/projects/{id}/videos
//gets all the videos for a project
const getVideosService = async (
  projectId: number,
): Promise<ProjectVideo[] | AddVideoServiceError> => {
  try {
    //add video
    const stuff = await prisma.projectVideos.findMany({
      where: {
        projectId,
      },
      orderBy: {
        videoId: 'asc',
      },
    });

    return stuff;
  } catch (e) {
    console.error('Error in getVideoService:', e);
    if (e instanceof Object && 'code' in e) {
      if (e.code === 'P2025') {
        return 'NOT_FOUND';
      }
    }
    return 'INTERNAL_ERROR';
  }
};

export default getVideosService;
