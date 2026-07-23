import type { ProjectDetail } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectDetailSelector } from '#services/selectors/projects/project-detail.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectToDetail } from '#services/transformers/projects/project-detail.ts';

type GetUnapprovedProjectsServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

//GET api/projects/unapproved/
export const getUnapprovedProjectsService = async (): Promise<
  ProjectDetail[] | GetUnapprovedProjectsServiceError
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
          select: ProjectDetailSelector,
        },
      },
    });

    const transformedProjects = result.map((r) => transformProjectToDetail(r.project));
    return transformedProjects;
  } catch (e) {
    console.error('getUnapprovedProjectsService returned an error: ', e);
    return 'INTERNAL_ERROR';
  }
};
