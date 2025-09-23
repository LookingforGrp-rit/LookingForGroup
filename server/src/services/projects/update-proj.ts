import type { ProjectDetail } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { Prisma } from '#prisma-models/index.js';
import { deleteImageService } from '#services/images/delete-image.ts';
import { ProjectDetailSelector } from '#services/selectors/projects/project-detail.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectToDetail } from '#services/transformers/projects/project-detail.ts';

type UpdateProjectServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

const updateProjectService = async (
  projectId: number,
  updates: Prisma.ProjectsUpdateInput,
): Promise<ProjectDetail | UpdateProjectServiceError> => {
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
      select: ProjectDetailSelector,
    });

    return transformProjectToDetail(project);
  } catch (e) {
    console.error('Error in updateProjectService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default updateProjectService;
