import type { ProjectJob } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectJobSelector } from '#services/selectors/projects/parts/project-job.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectJob } from '#services/transformers/projects/parts/project-job.ts';

type GetJobServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

const getJobService = async (
  projectId: number,
  jobId: number,
): Promise<ProjectJob | GetJobServiceError> => {
  try {
    const job = await prisma.jobs.findFirst({
      where: {
        projectId,
        jobId,
      },
      select: ProjectJobSelector,
    });

    if (!job) return 'NOT_FOUND';

    return transformProjectJob(projectId, job);
  } catch (error) {
    console.error('Error in getJobService:', error);
    return 'INTERNAL_ERROR';
  }
};

export default getJobService;
