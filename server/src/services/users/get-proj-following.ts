import type { ProjectWithFollowers } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';
import { transformProject } from '../helpers/projTransform.ts';

type GetProjectsError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

export const getProjectFollowingService = async (
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
      orderBy: { createdAt: 'desc' },
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
    });

    if (projects.length === 0) return 'NOT_FOUND';

    const fullProject = projects.map(transformProject);

    return fullProject;
  } catch (e) {
    console.error(`Error in getVisibleProjects: ${JSON.stringify(e)}`);
    return 'INTERNAL_ERROR';
  }
};
