import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type ReorderImagesError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

type ImageOrder = {
  imageOrder?: string[];
};

const reorderImagesService = async (
  projectId: number,
  imageOrder: ImageOrder,
): Promise<ReturnType<typeof prisma.projects.findFirst> | ReorderImagesError> => {
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
    });

    return project;
  } catch (e) {
    console.error('Error in updateProjectService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default reorderImagesService;
