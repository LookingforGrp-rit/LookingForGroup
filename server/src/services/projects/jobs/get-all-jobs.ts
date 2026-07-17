import type { ProjectJob } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ProjectJobSelector } from '#services/selectors/projects/parts/project-job.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformProjectJob } from '#services/transformers/projects/parts/project-job.ts';

type GetJobServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//GET api/projects/{id}/jobs
const getJobsService = async (projectId: number): Promise<ProjectJob[] | GetJobServiceError> => {
  try {
    let jobs = await prisma.jobs.findMany({
      where: {
        projectId,
      },
      select: ProjectJobSelector,
      orderBy: {
        updatedAt: 'desc',
      },
    });

    //Array is alphabetized by role label
    jobs = jobs.toSorted(
      (job1, job2) => job1.roles.label.charCodeAt(0) - job2.roles.label.charCodeAt(0),
    );
    return jobs.map((job) => transformProjectJob(projectId, job));
  } catch (error) {
    console.error('Error in getJobService:', error);
    return 'INTERNAL_ERROR';
  }
};

export default getJobsService;
