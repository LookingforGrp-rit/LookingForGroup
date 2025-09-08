import type { ProjectImage } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectImageSelector } from '#services/selectors/projects/parts/project-image.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectImage } from '#services/transformers/projects/project-image.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

const getProjectImagesService = async (
  projectId: number,
): Promise<ProjectImage[] | GetServiceError> => {
  try {
    const project = await prisma.projects.findUnique({
      where: { projectId },
      include: {
        projectImages: {
          select: ProjectImageSelector,
        },
      },
    });

    if (project === null) {
      return 'NOT_FOUND';
    }

    return project.projectImages.map((image) => transformProjectImage(projectId, image));
  } catch (e) {
    console.error(`Error in getProjectImagesService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default getProjectImagesService;
