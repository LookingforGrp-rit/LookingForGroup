import type { ProjectImage } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { Prisma } from '#prisma-models/index.js';
import { deleteImageService } from '#services/images/delete-image.ts';
import { ProjectImageSelector } from '#services/selectors/projects/parts/project-image.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectImage } from '#services/transformers/projects/parts/project-image.ts';

type UpdateImageServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

const updateImageService = async (
  imageId: number,
  updates: Prisma.ProjectImagesUpdateInput,
): Promise<ProjectImage | UpdateImageServiceError> => {
  try {
    const image = await prisma.projectImages.findUnique({ where: { imageId: imageId } });
    if (!image) return 'NOT_FOUND';

    if (image.image && updates.image) {
      //NEW: you can now update the alt text without destroying the image
      await deleteImageService(image.image);
    }

    const updatedImage = await prisma.projectImages.update({
      where: { imageId },
      data: updates,
      select: { ...ProjectImageSelector, projectId: true },
    });

    return transformProjectImage(updatedImage.projectId, updatedImage);
  } catch (e) {
    console.error('Error in updateImageService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default updateImageService;
