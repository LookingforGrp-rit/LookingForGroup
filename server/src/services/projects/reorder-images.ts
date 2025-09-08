import type { ProjectImage } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectImageSelector } from '#services/selectors/projects/parts/project-image.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectImage } from '#services/transformers/projects/parts/project-image.ts';

type ReorderImagesError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

type ImageOrder = {
  imageOrder?: string[];
};

const reorderImagesService = async (
  projectId: number,
  imageOrder: ImageOrder,
): Promise<ProjectImage[] | ReorderImagesError> => {
  try {
    const order = imageOrder.imageOrder;

    if (order) {
      for (let i = 0; i < order.length; i++) {
        const curImg = await prisma.projectImages.findFirst({
          where: {
            projectId: projectId,
            imageId: parseInt(order[i]),
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
    console.error('Error in updateProjectService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default reorderImagesService;
