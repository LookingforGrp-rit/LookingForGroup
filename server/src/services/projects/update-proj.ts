import type { ProjectDetail, UpdateProjectInput } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectDetailSelector } from '#services/selectors/projects/project-detail.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectToDetail } from '#services/transformers/projects/project-detail.ts';

type UpdateProjectServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

const updateProjectService = async (
  projectId: number,
  updates: Omit<UpdateProjectInput, 'thumbnail'>,
): Promise<ProjectDetail | UpdateProjectServiceError> => {
  try {
    //removed all the thumbnail stuff, that's handled elsewhere now
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
