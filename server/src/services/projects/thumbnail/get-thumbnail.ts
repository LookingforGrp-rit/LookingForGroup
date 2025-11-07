import type { ProjectImage } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectImageSelector } from '#services/selectors/projects/parts/project-image.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectImage } from '#services/transformers/projects/parts/project-image.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

const getThumbnailService = async (projectId: number): Promise<ProjectImage | GetServiceError> => {
  try {
    //get the project (i need to do this separately for the project image selector)
    const project = await prisma.projects.findUnique({
      where: { projectId },
      include: {
        thumbnail: true,
      },
    });

    if (!project || !project.thumbnailId) {
      return 'NOT_FOUND';
    }

    //get the thumbnail
    const thumb = await prisma.projectImages.findUnique({
      where: { imageId: project.thumbnailId },
      select: ProjectImageSelector,
    });

    if (!thumb) return 'NOT_FOUND'; //logically impossible to land here because of how i'm doing this but it complains when i axe it so

    return transformProjectImage(projectId, thumb);
  } catch (e) {
    console.error(`Error in getThumbnailService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default getThumbnailService;
