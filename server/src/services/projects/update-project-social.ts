import type { ProjectSocial } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectSocialSelector } from '#services/selectors/projects/parts/project-social.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectSocial } from '#services/transformers/projects/project-social.ts';

type SocialInput = {
  socialId: number;
  url: string;
};

type UpdateProjectSocialServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

export const updateProjectSocialService = async (
  data: SocialInput,
  projectId: number,
): Promise<ProjectSocial | UpdateProjectSocialServiceError> => {
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
      select: ProjectSocialSelector,
    });

    return transformProjectSocial(projectId, social);
  } catch (error) {
    console.error('Error in addProjectSocialService:', error);
    return 'INTERNAL_ERROR';
  }
};
