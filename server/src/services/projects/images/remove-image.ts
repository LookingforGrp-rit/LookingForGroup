import prisma from '#config/prisma.ts';
import { deleteImageService } from '#services/images/delete-image.ts';
import type { ServiceErrorSubset, ServiceSuccessSusbet } from '#services/service-outcomes.ts';

type RemoveImageServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type RemoveImageServiceSuccess = ServiceSuccessSusbet<'NO_CONTENT'>;

//DELETE api/projects/{id}/images/{imageId}
//delete a project image
export const removeImageService = async (
  projectId: number,
  imageId: number,
): Promise<RemoveImageServiceSuccess | RemoveImageServiceError> => {
  try {
    const project = await prisma.projects.findUnique({
      where: {
        projectId,
      },
    });

    if (!project) return 'NOT_FOUND';

    //now disconnects the thumbnail param if the thumbnail is selected for deletion here
    if (project.thumbnailId === imageId) {
      await prisma.projects.update({
        where: {
          projectId,
        },
        data: {
          thumbnail: {
            disconnect: {
              imageId,
            },
          },
        },
      });
    }

    const deletedImage = await prisma.projectImages.delete({
      where: {
        projectId,
        imageId,
      },
    });

    const dbImage = deletedImage.image;

    const dbDelete = await deleteImageService(dbImage);
    if (dbDelete === 'INTERNAL_ERROR' || dbDelete === 'NOT_FOUND') return dbDelete;

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
