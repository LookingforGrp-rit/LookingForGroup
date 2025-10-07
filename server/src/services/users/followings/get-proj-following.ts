import type { ProjectFollowsList } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectPreviewSelector } from '#services/selectors/projects/project-preview.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectToPreview } from '#services/transformers/projects/project-preview.ts';

type GetProjectsError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

export const getProjectFollowingService = async (
  userId: number,
): Promise<ProjectFollowsList | GetProjectsError> => {
  try {
    const projects = await prisma.projectFollowings.findMany({
      where: {
        userId,
      },
      orderBy: {
        followedAt: 'desc',
      },
      select: {
        followedAt: true,
        projects: {
          select: ProjectPreviewSelector,
        },
      },
    });

    const followings: ProjectFollowsList = {
      count: projects.length,
      projects: projects.map(({ followedAt, projects }) => ({
        followedAt,
        project: transformProjectToPreview(projects),
      })),
      apiUrl: `/api/users/${userId.toString()}/followings/projects`,
    };

    return followings;
  } catch (e) {
    console.error(`Error in getProjectFollowingService: ${JSON.stringify(e)}`);
    return 'INTERNAL_ERROR';
  }
};
