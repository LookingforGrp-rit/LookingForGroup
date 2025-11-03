import prisma from '#config/prisma.ts';
import { deleteImageService } from '#services/images/delete-image.ts';
import type { ServiceErrorSubset, ServiceSuccessSusbet } from '#services/service-outcomes.ts';

type RemoveImageServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type RemoveImageServiceSuccess = ServiceSuccessSusbet<'NO_CONTENT'>;

//delete a member
export const removeImageService = async (
  projectId: number,
  imageId: number,
): Promise<RemoveImageServiceSuccess | RemoveImageServiceError> => {
  try {
    //it now nulls the thumbnail param if the thumbnail is selected for deletion here
    const projectThumb = await prisma.projects.findUnique({
      where: {
        projectId,
      },
      select: {
        thumbnail: true,
      },
    });

    if (!projectThumb) return 'NOT_FOUND';
    if (projectThumb.thumbnail === imageId) {
      await prisma.projects.update({
        where: {
          projectId,
        },
        data: { thumbnail: null },
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
