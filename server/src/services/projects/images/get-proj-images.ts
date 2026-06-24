import type { ProjectImage } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectImageSelector } from '#services/selectors/projects/parts/project-image.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectImage } from '#services/transformers/projects/parts/project-image.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//GET api/projects/{id}/images
const getProjectImagesService = async (
  projectId: number,
): Promise<ProjectImage[] | GetServiceError> => {
  try {
    const project = await prisma.projects.findUnique({
      where: { projectId },
      include: {
        projectImages: {
          select: ProjectImageSelector,
          orderBy: {
            imageId: 'asc',
          },
        },
      },
    });

    if (project === null) {
      return 'NOT_FOUND';
    }

    //Image order is user-defined, so this will not be ordered
    //project.projectImages = project.projectImages.toSorted((image1, image2) => image1.imageId - image2.imageId);
    return project.projectImages.map((image) => transformProjectImage(projectId, image));
  } catch (e) {
    console.error(`Error in getProjectImagesService: ${e as Error}`);

    return 'INTERNAL_ERROR';
  }
};

export default getProjectImagesService;
