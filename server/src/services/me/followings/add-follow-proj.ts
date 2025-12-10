import type { MyProjectFollowing } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectPreviewSelector } from '#services/selectors/projects/project-preview.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectToPreview } from '#services/transformers/projects/project-preview.ts';

type AddFollowServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;

//POST api/me/followings/projects/{id}
export const addProjectFollowingService = async (
  userId: number,
  projectId: number,
): Promise<MyProjectFollowing | AddFollowServiceError> => {
  try {
    //add no following own project??

    //check if project exists
    const project = await prisma.projects.findUnique({
      where: { projectId },
      select: { userId: true },
    });

    if (!project) return 'NOT_FOUND';

    //if already followed
    const exists = await prisma.projectFollowings.findUnique({
      where: {
        userId_projectId: {
          userId,
          projectId,
        },
      },
    });

    if (exists) return 'CONFLICT';

    /// create the following
    const addFollow = await prisma.projectFollowings.create({
      data: {
        userId,
        projectId,
      },
      select: {
        followedAt: true,
        projects: {
          select: ProjectPreviewSelector,
        },
      },
    });

    const result: MyProjectFollowing = {
      followedAt: addFollow.followedAt,
      project: transformProjectToPreview(addFollow.projects),
      apiUrl: `api/me/followings/projects/${projectId.toString()}`,
    };

    return result;
  } catch (error) {
    console.error('Error in addProjectFollowingService:', error);
    return 'INTERNAL_ERROR';
  }
};
