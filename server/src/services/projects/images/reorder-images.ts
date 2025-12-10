import type { ProjectImage } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectImageSelector } from '#services/selectors/projects/parts/project-image.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectImage } from '#services/transformers/projects/parts/project-image.ts';

type ReorderImagesError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

type ImageOrder = {
  imageOrder?: number[];
};

//PUT api/projects/{id}/images/reorder
//currently unused/not implemented, but it's intended for the project carousel
//ImageOrder is an array of each project image's imageId, ordered how the user wishes
//and those are used to set each image's position parameter, which is currently unused
const reorderImagesService = async (
  projectId: number,
  imageOrder: ImageOrder,
): Promise<ProjectImage[] | ReorderImagesError> => {
  try {
    const order = imageOrder.imageOrder;

    //loops through image ids and sets position param of each image based on its index
    if (order) {
      for (let i = 0; i < order.length; i++) {
        const curImg = await prisma.projectImages.findFirst({
          where: {
            projectId: projectId,
            imageId: order[i],
          },
        });
        if (!curImg) return 'NOT_FOUND';

        curImg.position = i;
      }
    }

    const project = await prisma.projects.findFirst({
      where: { projectId },
      include: {
        projectImages: {
          select: ProjectImageSelector,
        },
      },
    });

    if (!project) return 'NOT_FOUND';

    return project.projectImages.map((image) => transformProjectImage(projectId, image));
  } catch (e) {
    console.error('Error in reorderImagesService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default reorderImagesService;
