import prisma from '#config/prisma.ts';
import type { ProjectSocials } from '#prisma-models/index.js';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type Social = {
  socialId: number;
  url: string;
};

type UpdateProjectSocialServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

export const updateProjectSocialService = async (
  data: Social,
  projectId: number,
): Promise<ProjectSocials | UpdateProjectSocialServiceError> => {
  try {
    //social validation (does it have this social)
    const socialExists = await prisma.projectSocials.findFirst({
      where: {
        websiteId: data.socialId,
        projectId: projectId,
      },
    });
    if (!socialExists) return 'NOT_FOUND';

    const social = await prisma.projectSocials.update({
      where: {
        projectId_websiteId: {
          projectId: projectId,
          websiteId: data.socialId,
        },
      },
      data: {
        url: data.url,
      },
    });

    return social;
  } catch (error) {
    console.error('Error in addProjectSocialService:', error);
    return 'INTERNAL_ERROR';
  }
};
