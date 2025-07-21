import prisma from '#config/prisma.ts';
import type { Prisma } from '#prisma-models/index.js';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type CreateProjectServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

const createProjectService = async (
  data: Prisma.ProjectsCreateInput,
): Promise<Prisma.ProjectsCreateInput | CreateProjectServiceError> => {
  try {
    const project = await prisma.projects.create({ data });
    return project;
  } catch (e) {
    console.error('Error in updateProjectService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default createProjectService;
