import type { ProjectJob } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { Prisma } from '#prisma-models/index.js';
import { ProjectJobSelector } from '#services/selectors/projects/parts/project-job.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectJob } from '#services/transformers/projects/parts/project-job.ts';

type UpdateJobServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//PATCH api/projects/{id}/jobs/{jobId}
const updateJobService = async (
  projectId: number,
  jobId: number,
  updates: Prisma.JobsUpdateInput,
): Promise<ProjectJob | UpdateJobServiceError> => {
  try {
    const jobExists = await prisma.jobs.findFirst({
      where: {
        projectId,
        jobId,
      },
    });

    if (!jobExists) return 'NOT_FOUND';

    const updatedJob = await prisma.jobs.update({
      where: {
        jobId,
      },
      data: updates,
      select: ProjectJobSelector,
    });

    return transformProjectJob(projectId, updatedJob);
  } catch (error) {
    console.error('Error in updateJobService:', error);
    return 'INTERNAL_ERROR';
  }
};

export default updateJobService;
