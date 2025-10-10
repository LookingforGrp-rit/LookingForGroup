import type { ProjectDetail, CreateProjectInput } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectDetailSelector } from '#services/selectors/projects/project-detail.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectToDetail } from '#services/transformers/projects/project-detail.ts';

type CreateProjectServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

const createProjectService = async (
  data: Omit<CreateProjectInput, 'thumbnail'>,
  userId: number,
  thumbnailUrl?: string,
): Promise<ProjectDetail | CreateProjectServiceError> => {
  try {
    const project = await prisma.projects.create({
      data: {
        title: data.title,
        hook: data.hook || undefined,
        description: data.description || undefined,
        thumbnail: thumbnailUrl || undefined,
        status: data.status || undefined,
        audience: data.audience || undefined,
        users: {
          connect: {
            userId: userId,
          },
        },
      },
      select: ProjectDetailSelector,
    });

    await prisma.members.create({
      data: {
        users: {
          connect: { userId },
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
