import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSusbet } from '#services/service-outcomes.ts';

type RemoveThumbnailServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type RemoveThumbnailServiceSuccess = ServiceSuccessSusbet<'NO_CONTENT'>;

//DELETE api/projects/{id}/thumbnail
//deselect the thumbnail (does not delete the thumbnail image, simply removes the designated thumbnail)
//(if you wish to delete the image itself run deleteImageService on the thumbnail instead)
export const removeThumbnailService = async (
  projectId: number,
): Promise<RemoveThumbnailServiceSuccess | RemoveThumbnailServiceError> => {
  try {
    //gotta get the thumbnail first
    const project = await prisma.projects.findUnique({
      where: {
        projectId,
      },
    });

    if (!project || !project.thumbnailId) return 'NOT_FOUND';

    //you can delete the thumbnail itself through the remove image service already so
    //i think here it makes sense to just have this deselect it w/o actually removing the image
    //miiiiiight be a tiny bit semantically confusing though
    await prisma.projects.update({
      where: {
        projectId,
      },
      data: {
        thumbnail: {
          disconnect: {
            imageId: project.thumbnailId,
          },
        },
      },
    });

    return 'NO_CONTENT';
  } catch (error) {
    console.error('Error in removeImageService:', error);

    if (error instanceof Object && 'code' in error) {
      if (error.code === 'P2025') {
        return 'NOT_FOUND';
      }
    }

    return 'INTERNAL_ERROR';
  }
};
