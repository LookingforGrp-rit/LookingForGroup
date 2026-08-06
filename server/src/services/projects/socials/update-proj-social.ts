import type { ProjectSocial, UpdateProjectSocialInput } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectSocialSelector } from '#services/selectors/projects/parts/project-social.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectSocial } from '#services/transformers/projects/parts/project-social.ts';
import { unapproveProjectService } from '../approval/unapprove-project.ts';

type UpdateProjectSocialServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//PATCH api/projects/{id}/socials/{socialId}
export const updateProjectSocialService = async (
  data: UpdateProjectSocialInput,
  projectId: number,
  socialId: number,
): Promise<ProjectSocial | UpdateProjectSocialServiceError> => {
  try {
    //social validation (does it have this social)
    const socialExists = await prisma.projectSocials.findUnique({
      where: {
        id: socialId,
      },
    });
    if (!socialExists) return 'NOT_FOUND';

    const social = await prisma.projectSocials.update({
      where: {
        id: socialId,
      },
      data: data,
      select: ProjectSocialSelector,
    });

    //find project for the approval stuff
    const proj = await prisma.projects.findUnique({
      where: {
        projectId,
      },
    });

    //unapprove project on change
    if (proj && proj.approved) {
      await unapproveProjectService(proj.projectId);
    }

    return transformProjectSocial(projectId, social);
  } catch (error) {
    console.error('Error in updateProjectSocialService:', error);
    return 'INTERNAL_ERROR';
  }
};
