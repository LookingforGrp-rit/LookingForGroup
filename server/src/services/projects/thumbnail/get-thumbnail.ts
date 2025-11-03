import type { ProjectImage } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectImageSelector } from '#services/selectors/projects/parts/project-image.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectImage } from '#services/transformers/projects/parts/project-image.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

const getThumbnailService = async (projectId: number): Promise<ProjectImage | GetServiceError> => {
  try {
    const project = await prisma.projects.findUnique({
      //get the project (i need it for the thumbnail id)
      where: { projectId },
    });

    if (!project || !project.thumbnail) {
      //check if it has a thumbnail (or if said project exists)
      return 'NOT_FOUND';
    }

    const thumb = await prisma.projects.findUnique({
      //get the thumbnail
      where: { projectId },
      include: {
        projectImages: {
          where: { imageId: project.thumbnail },
          select: ProjectImageSelector,
        },
      },
    });

    if (!thumb) return 'NOT_FOUND'; //literally impossible to land here because of how i'm doing this but uhhhhhh redundancy right

    return transformProjectImage(projectId, thumb.projectImages[project.thumbnail]);
  } catch (e) {
    console.error(`Error in getThumbnailService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default getThumbnailService;
