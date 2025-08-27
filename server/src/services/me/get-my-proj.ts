import type { ProjectWithFollowers } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';
import { transformProject } from '../helpers/projTransform.ts';

type GetProjectsError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

export const getMyProjectsService = async (
  userId: number,
): Promise<ProjectWithFollowers[] | GetProjectsError> => {
  try {
    const projects = await prisma.projects.findMany({
      where: {
        projectFollowings: {
          some: {
            userId,
          },
        },
      },
      include: {
        _count: { select: { projectFollowings: true } },
        projectGenres: { include: { genres: true } },
        projectTags: { include: { tags: true } },
        projectImages: true,
        projectSocials: { include: { socials: true } },
        jobs: true,
        members: true,
        users: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    //check if they exits
    if (projects.length === 0) return 'NOT_FOUND';

    //user helper to tranform project
    const fullProject = projects.map(transformProject);

    return fullProject;
  } catch (e) {
    console.error(`Error in getMyProjectsService: ${JSON.stringify(e)}`);
    return 'INTERNAL_ERROR';
  }
};
