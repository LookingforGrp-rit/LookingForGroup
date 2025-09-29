import type { ProjectPreview } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectPreviewSelector } from '#services/selectors/projects/project-preview.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectToPreview } from '#services/transformers/projects/project-preview.ts';

type GetProjectsError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//gets projects of other uses to view
export const getUserProjectsService = async (
  userId: number,
): Promise<ProjectPreview[] | GetProjectsError> => {
  try {
    //get projects that a user is publicly a member of
    const projects = await prisma.projects.findMany({
      where: {
        members: {
          every: {
            userId,
            profileVisibility: 'public',
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      select: ProjectPreviewSelector,
    });

    if (projects.length === 0) return 'NOT_FOUND';

    const result = projects.map(transformProjectToPreview);

    return result;
  } catch (e) {
    console.error(`Error in getUserProjectsService: ${JSON.stringify(e)}`);
    return 'INTERNAL_ERROR';
  }
};
