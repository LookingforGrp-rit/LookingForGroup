import prisma from '#config/prisma.ts';
import type { Prisma } from '#prisma-models/index.js';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';
import { unapproveProjectService } from '../approval/unapprove-project.ts';

type AddVideoServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type AddVideoServiceSuccess = ServiceSuccessSubset<'CREATED'>;

//POST api/projects/{id}/videos
//adds an image to a project
const addVideoService = async (
  data: Prisma.ProjectVideosCreateInput,
): Promise<AddVideoServiceSuccess | AddVideoServiceError> => {
  try {
    //add video
    const newVideo = await prisma.projectVideos.create({
      data,
    });

    //find project for the approval stuff
    const proj = await prisma.projects.findUnique({
      where: {
        projectId: newVideo.projectId,
      },
    });

    //unapprove project on change
    if (proj && proj.approved) {
      await unapproveProjectService(proj.projectId);
    }

    return 'CREATED';
  } catch (e) {
    console.error('Error in addVideoService:', e);
    if (e instanceof Object && 'code' in e) {
      if (e.code === 'P2025') {
        return 'NOT_FOUND';
      }
    }
    return 'INTERNAL_ERROR';
  }
};

export default addVideoService;
