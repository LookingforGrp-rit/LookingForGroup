import type { ProjectDetail, UpdateProjectInput } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectDetailSelector } from '#services/selectors/projects/project-detail.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectToDetail } from '#services/transformers/projects/project-detail.ts';
import { unapproveProjectService } from './approval/unapprove-project.ts';

type UpdateProjectServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//PATCH api/projects/{id}
const updateProjectService = async (
  projectId: number,
  updates: Omit<UpdateProjectInput, 'thumbnail'>,
): Promise<ProjectDetail | UpdateProjectServiceError> => {
  try {
    const currentProject = await prisma.projects.findUnique({
      where: { projectId },
    });

    if (!currentProject) {
      return 'NOT_FOUND';
    }

    const hasChanges = (Object.keys(updates) as (keyof typeof updates)[]).some(
      (key) => currentProject[key] !== updates[key],
    );

    //removed all the thumbnail stuff, that's handled elsewhere now
    const project = await prisma.projects.update({
      where: { projectId },
      data: updates,
      select: ProjectDetailSelector,
    });

    //unapprove project on change
    if (project.approved && hasChanges) {
      await unapproveProjectService(projectId);
    }

    return transformProjectToDetail(project);
  } catch (e) {
    console.error('Error in updateProjectService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default updateProjectService;
