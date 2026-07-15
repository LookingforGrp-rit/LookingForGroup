import type { Visibility } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type UpdateProjectGlobalVisibilityServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;
type UpdateProjectGlobalVisibilityServiceSuccess = ServiceSuccessSubset<'OK'>;

export const updateProjectGlobalVisibilityService = async (
  projectId: number,
  visibility: Visibility,
): Promise<
  UpdateProjectGlobalVisibilityServiceError | UpdateProjectGlobalVisibilityServiceSuccess
> => {
  try {
    await prisma.projects.update({
      where: {
        projectId,
      },
      data: {
        globalVisibility: visibility,
      },
    });

    return 'OK';
  } catch (e) {
    console.error('There was an internal error in updateProjectGlobalVisibilityService: ', e);
    return 'INTERNAL_ERROR';
  }
};
