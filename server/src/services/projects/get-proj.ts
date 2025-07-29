import type { ProjectWithFollowers } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';
import { transformProject } from '../helpers/projTransform.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

const getProjectsService = async (): Promise<ProjectWithFollowers[] | GetServiceError> => {
  try {
    const result = await prisma.projects.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    //return transformed projects
    const transformedProjects = result.map(transformProject);
    return transformedProjects;
  } catch (e) {
    console.error(`Error in getProjectsService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default getProjectsService;
