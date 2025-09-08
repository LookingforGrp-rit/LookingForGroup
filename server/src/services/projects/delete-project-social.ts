import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSusbet } from '#services/service-outcomes.ts';

type DeleteProjectSocialServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type DeleteProjectSocialServiceSuccess = ServiceSuccessSusbet<'NO_CONTENT'>;

export const deleteProjectSocialService = async (
  socialId: number,
  projectId: number,
): Promise<DeleteProjectSocialServiceSuccess | DeleteProjectSocialServiceError> => {
  try {
    //social validation (do you have this social)
    const socialExists = await prisma.projectSocials.findFirst({
      where: {
        websiteId: socialId,
        projectId: projectId,
      },
    });

    if (!socialExists) return 'NOT_FOUND';

    await prisma.projectSocials.delete({
      where: {
        projectId_websiteId: {
          websiteId: socialId,
          projectId: projectId,
        },
      },
    });

    return 'NO_CONTENT';
  } catch (error) {
    console.error('Error in deleteProjectSocialService:', error);
    return 'INTERNAL_ERROR';
  }
};
