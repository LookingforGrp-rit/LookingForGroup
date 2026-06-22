import type { ProjectSocial } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectSocialSelector } from '#services/selectors/projects/parts/project-social.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectSocial } from '#services/transformers/projects/parts/project-social.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//GET api/projects/{id}/socials
const getProjectSocialsService = async (
  projectId: number,
): Promise<ProjectSocial[] | GetServiceError> => {
  try {
    const project = await prisma.projects.findUnique({
      where: { projectId },
      include: {
        projectSocials: {
          select: ProjectSocialSelector,
          orderBy: {
            socials: {
              label: 'asc',
            },
          },
        },
      },
    });

    if (project === null) {
      return 'NOT_FOUND';
    }

    //Array is alphebetized by website label
    project.projectSocials = project.projectSocials.toSorted(
      (social1, social2) =>
        social1.socials.label.charCodeAt(0) - social2.socials.label.charCodeAt(0),
    );
    return project.projectSocials.map((social) => transformProjectSocial(projectId, social));
  } catch (e) {
    console.error(`Error in getProjectSocialsService: ${e as Error}`);

    return 'INTERNAL_ERROR';
  }
};

export default getProjectSocialsService;
