import prisma from '#config/prisma.ts';
import type { Prisma } from '#prisma-models/index.js';
import { deleteImageService } from '#services/images/delete-image.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type UpdateProjectServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

const updateProjectService = async (
  projectId: number,
  updates: Prisma.ProjectsUpdateInput,
): Promise<ReturnType<typeof prisma.projects.update> | UpdateProjectServiceError> => {
  try {
    const curProject = await prisma.projects.findFirst({
      where: {
        projectId: projectId,
      },
    });

    if (curProject && curProject.thumbnail !== null) {
      const currentThumb = curProject.thumbnail;
      await deleteImageService(currentThumb);
    }

    const project = await prisma.projects.update({
      where: { projectId },
      data: updates,
    });

    return project;
  } catch (e) {
    console.error('Error in updateProjectService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default updateProjectService;
