import type { ProjectJob } from '@looking-for-group/shared';
import type { Prisma } from '#prisma-models/index.js';

export const transformProjectJob = (
  projectId: number,
  job: Prisma.JobsGetPayload<{
    select: {
      jobId: true;
      availability: true;
      duration: true;
      location: true;
      compensation: true;
      description: true;
      createdAt: true;
      updatedAt: true;
      roles: {
        select: {
          roleId: true;
          label: true;
        };
      };
    };
  }>,
): ProjectJob => {
  return {
    availability: job.availability,
    compensation: job.compensation,
    createdAt: job.createdAt,
    description: job.description,
    duration: job.duration,
    jobId: job.jobId,
    location: job.location,
    role: {
      roleId: job.roles.roleId,
      label: job.roles.label,
    },
    updatedAt: job.updatedAt,
    apiUrl: `/api/projects/${projectId.toString()}/jobs/${job.jobId.toString()}`,
  };
};
