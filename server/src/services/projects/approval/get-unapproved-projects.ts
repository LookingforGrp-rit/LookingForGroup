import type { ProjectPreview } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectPreviewSelector } from '#services/selectors/projects/project-preview.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformUnapprovedToPreview } from '#services/transformers/projects/project-preview.ts';

type GetUnapprovedProjectsServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

//GET api/projects/unapproved/
export const getUnapprovedProjectsService = async (): Promise<
  ProjectPreview[] | GetUnapprovedProjectsServiceError
> => {
  try {
    // const result = await prisma.projectsAwaitingApproval.findMany({
    //   include: {
    //     project: true
    //   },
    //   select: ProjectPreviewSelector,
    //   orderBy: {
    //     createdAt: 'desc',
    //   },
    //   where: {
    //     approved: false,
    //     awaitingapproval: {},
    //   },
    // });
    const result = await prisma.projectsAwaitingApproval.findMany({
      include: {
        project: {
          select: ProjectPreviewSelector,
        },
      },
    });

    const transformedProjects = result.map(transformUnapprovedToPreview);
    return transformedProjects;
  } catch (e) {
    console.error('getUnapprovedProjectsService returned an error: ', e);
    return 'INTERNAL_ERROR';
  }
};
