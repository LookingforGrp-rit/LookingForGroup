import type { ProjectDetail, CreateProjectInput } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectDetailSelector } from '#services/selectors/projects/project-detail.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectToDetail } from '#services/transformers/projects/project-detail.ts';
import addMemberService from './members/add-member.ts';

type CreateProjectServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//POST api/projects
const createProjectService = async (
  data: Omit<CreateProjectInput, 'thumbnail'>,
  userId: number,
): Promise<ProjectDetail | CreateProjectServiceError> => {
  try {
    const project = await prisma.projects.create({
      data: {
        title: data.title,
        hook: data.hook || undefined,
        description: data.description || undefined,
        status: data.status || undefined,
        audience: data.audience || undefined,
        purpose: data.purpose,
        users: {
          connect: {
            userId: userId,
          },
        },
      },
      select: ProjectDetailSelector,
    });

    await addMemberService(project.projectId, { userId, roleId: 77 });

    return transformProjectToDetail(project);
  } catch (e) {
    console.error('Error in createProjectService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default createProjectService;
