import type { Role } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type GetJobTitlesServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

const getJobTitlesService = async (): Promise<Role[] | GetJobTitlesServiceError> => {
  try {
    return await prisma.roles.findMany();
  } catch (e) {
    console.error(`Error in getJobTitlesService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default getJobTitlesService;
