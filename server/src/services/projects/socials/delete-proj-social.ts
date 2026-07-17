import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type DeleteProjectSocialServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type DeleteProjectSocialServiceSuccess = ServiceSuccessSubset<'NO_CONTENT'>;

//DELETE api/projects/{id}/scials/{socialId}
export const deleteProjectSocialService = async (
  socialId: number,
): Promise<DeleteProjectSocialServiceSuccess | DeleteProjectSocialServiceError> => {
  try {
    //social validation (do you have this social)
    const socialExists = await prisma.projectSocials.findFirst({
      where: {
        id: socialId,
      },
    });

    if (!socialExists) return 'NOT_FOUND';

    await prisma.projectSocials.delete({
      where: {
        id: socialId,
      },
    });

    return 'NO_CONTENT';
  } catch (error) {
    console.error('Error in deleteProjectSocialService:', error);
    return 'INTERNAL_ERROR';
  }
};
