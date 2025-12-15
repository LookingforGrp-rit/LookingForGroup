import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSusbet } from '#services/service-outcomes.ts';

type DeleteJobServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type DeleteJobServiceSuccess = ServiceSuccessSusbet<'NO_CONTENT'>;

//DELETE api/projects/{id}/jobs/{jobId}
const deleteJobService = async (
  projectId: number,
  jobId: number,
): Promise<DeleteJobServiceSuccess | DeleteJobServiceError> => {
  try {
    const jobExists = await prisma.jobs.findFirst({
      where: {
        projectId,
        jobId,
      },
    });

    if (!jobExists) return 'NOT_FOUND';

    await prisma.jobs.deleteMany({
      where: {
        projectId,
        jobId,
      },
    });

    return 'NO_CONTENT';
  } catch (error) {
    console.error('Error in deleteJobService:', error);
    return 'INTERNAL_ERROR';
  }
};

export default deleteJobService;
