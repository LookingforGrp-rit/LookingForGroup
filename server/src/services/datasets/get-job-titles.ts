import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-error.ts';
import type { JobTitle } from '../../../../shared/types.ts';

type GetJobTitlesServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

const getJobTitlesService = async (): Promise<JobTitle[] | GetJobTitlesServiceError> => {
  try {
    return await prisma.jobTitles.findMany();
  } catch (e) {
    console.error(`Error in getJobTitlesService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default getJobTitlesService;
