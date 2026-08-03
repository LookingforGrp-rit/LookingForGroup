import type { ProjectPreview } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectPreviewSelector } from '#services/selectors/projects/project-preview.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectToPreview } from '#services/transformers/projects/project-preview.ts';

type GetProjectsError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//gets projects of other uses to view
export const getUserProjectsService = async (
  userId: number,
  viewerId?: number,
): Promise<ProjectPreview[] | GetProjectsError> => {
  try {
    //check that user exists
    const user = await prisma.users.findUnique({
      where: {
        userId,
      },
    });
    if (user === null) return 'NOT_FOUND';

    const approvalVisibilityFilter = viewerId
      ? [
          { approved: true },
          { userId: viewerId },
          {
            members: {
              some: {
                userId: viewerId,
              },
            },
          },
        ]
      : [{ approved: true }];

    //get projects that a user is publicly a member of
    const projects = await prisma.projects.findMany({
      where: {
        members: {
          some: {
            userId,
            profileVisibility: 'public',
          },
        },
        OR: approvalVisibilityFilter,
      },
      orderBy: { createdAt: 'desc' },
      select: ProjectPreviewSelector,
    });

    //if (projects.length === 0) return 'NOT_FOUND';

    let result = projects.map(transformProjectToPreview);

    //Sorts the array alphabetically by project title
    result = result.toSorted(
      (project1, project2) => project1.title.charCodeAt(0) - project2.title.charCodeAt(0),
    );
    return result;
  } catch (e) {
    console.error(`Error in getUserProjectsService: ${e as Error}`);
    return 'INTERNAL_ERROR';
  }
};
