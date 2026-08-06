import type { ProjectImage } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectImageSelector } from '#services/selectors/projects/parts/project-image.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectImage } from '#services/transformers/projects/parts/project-image.ts';
import { unapproveProjectService } from '../approval/unapprove-project.ts';

type UpdateThumbnailServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//PUT api/projects/{id}/thumbnail
const updateThumbnailService = async (
  projectId: number,
  imageId: number,
): Promise<ProjectImage | UpdateThumbnailServiceError> => {
  try {
    const image = await prisma.projectImages.findUnique({
      //make sure the image exists
      where: {
        imageId,
      },
      select: {
        ...ProjectImageSelector,
        projectId: true,
      },
    });

    if (!image) return 'NOT_FOUND';

    const proj = await prisma.projects.update({
      //set it as the thumbnail
      where: {
        projectId,
      },
      data: {
        thumbnail: {
          connect: {
            imageId: image.imageId,
          },
        },
      },
    });

    //unapprove project on change
    if (proj.approved) {
      await unapproveProjectService(projectId);
    }

    return transformProjectImage(image.projectId, image);
  } catch (e) {
    console.error('Error in updateImageService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default updateThumbnailService;
