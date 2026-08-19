import type { ProjectImage } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { Prisma } from '#prisma-models/index.js';
import { deleteImageService } from '#services/images/delete-image.ts';
import { ProjectImageSelector } from '#services/selectors/projects/parts/project-image.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectImage } from '#services/transformers/projects/parts/project-image.ts';
import { unapproveProjectService } from '../approval/unapprove-project.ts';

type UpdateImageServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//PATCH api/projects/{id}/images/{imageId}
const updateImageService = async (
  imageId: number,
  updates: Prisma.ProjectImagesUpdateInput,
): Promise<ProjectImage | UpdateImageServiceError> => {
  try {
    const image = await prisma.projectImages.findUnique({ where: { imageId: imageId } });
    if (!image) return 'NOT_FOUND';

    if (image.image && updates.image) {
      await deleteImageService(image.image);
    }

    const updatedImage = await prisma.projectImages.update({
      where: { imageId },
      data: updates,
      select: { ...ProjectImageSelector, projectId: true },
    });

    //find project for the approval stuff
    const proj = await prisma.projects.findUnique({
      where: {
        projectId: updatedImage.projectId,
      },
    });

    //unapprove project on change
    if (proj && proj.approved) {
      await unapproveProjectService(proj.projectId);
    }

    return transformProjectImage(updatedImage.projectId, updatedImage);
  } catch (e) {
    console.error('Error in updateImageService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default updateImageService;
