import prisma from '#config/prisma.ts';
import type { Prisma } from '#prisma-models/index.js';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type UpdateProjectServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

const updateProjectService = async (
  projectId: number,
  updates: Prisma.ProjectsUpdateInput,
): Promise<boolean | UpdateProjectServiceError> => {
  try {
    await prisma.projects.update({
      where: { projectId },
      data: updates,
      select: {
        title: true,
        hook: true,
        description: true,
        purpose: true,
        status: true,
        audience: true,
        projectTags: true,
        jobs: true,
        members: true,
        projectSocials: true,
      },
    });

    return true;
  } catch (e) {
    console.error('Error in updateProjectService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default updateProjectService;
