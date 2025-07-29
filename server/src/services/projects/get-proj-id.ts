import type { ProjectWithFollowers } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';
import { transformProject } from '../helpers/projTransform.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

const getProjectByIdService = async (
  projectId: number,
): Promise<ProjectWithFollowers | null | GetServiceError> => {
  try {
    const project = await prisma.projects.findUnique({
      where: { projectId },
      include: {
        _count: {
          select: {
            projectFollowings: true,
          },
        },
        projectGenres: {
          include: {
            genres: true,
          },
        },
        projectTags: {
          include: {
            tags: true,
          },
        },
        projectImages: true,
        projectSocials: {
          include: {
            socials: true,
          },
        },
        jobs: true,
        members: true,
        users: true,
      },
    });

    //check if project exists
    if (!project) return 'NOT_FOUND';

    //return transformed project
    return transformProject(project);
  } catch (e) {
    console.error(`Error in getProjectByIdService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default getProjectByIdService;
