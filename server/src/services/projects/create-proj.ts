import type { ProjectDetail } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { Prisma } from '#prisma-models/index.js';
import { ProjectDetailSelector } from '#services/selectors/projects/project-detail.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectToDetail } from '#services/transformers/projects/project-detail.ts';

type CreateProjectServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

const createProjectService = async (
  data: Prisma.ProjectsCreateInput,
  curUserId: number,
): Promise<ProjectDetail | CreateProjectServiceError> => {
  try {
    const project = await prisma.projects.create({ data, select: ProjectDetailSelector });

    await prisma.members.create({
      data: {
        //projectId
        users: {
          connect: { userId: curUserId },
        },
        projects: {
          connect: { projectId: project.projectId },
        },
        roles: {
          connect: { label: 'Owner' },
        },
      },
    });

    const result = await prisma.projects.findUnique({
      where: {
        projectId: project.projectId,
      },
      select: ProjectDetailSelector,
    });
    if (!result) return 'INTERNAL_ERROR';

    return transformProjectToDetail(result);
  } catch (e) {
    console.error('Error in createProjectService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default createProjectService;
