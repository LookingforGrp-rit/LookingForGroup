import type { ProjectDetail } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectDetailSelector } from '#services/selectors/projects/project-detail.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectToDetail } from '#services/transformers/projects/project-detail.ts';

type GetUnapprovedProjectsByIdServiceError = ServiceErrorSubset<'NOT_FOUND' | 'INTERNAL_ERROR'>;

//GET api/projects/unapproved/:id
export const getUnapprovedProjectByIdService = async (
  projectId: number,
): Promise<ProjectDetail | GetUnapprovedProjectsByIdServiceError> => {
  try {
    const result = await prisma.projects.findFirst({
      select: ProjectDetailSelector,
      orderBy: {
        createdAt: 'desc',
      },
      where: {
        awaitingapproval: {
          projectId,
        },
      },
    });

    if (!result) {
      return 'NOT_FOUND';
    }

    return transformProjectToDetail(result);
  } catch (e) {
    console.error('Error in getUnapprovedProjectByIdService.ts: ', e);
    return 'INTERNAL_ERROR';
  }
};
