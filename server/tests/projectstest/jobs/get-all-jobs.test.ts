import type {
  ProjectJob,
  JobAvailability,
  JobDuration,
  JobLocation,
  JobCompensation,
  UserPreview,
} from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import prisma from '#config/prisma.ts';
import getJobsService from '#services/projects/jobs/get-all-jobs.ts';
import { transformProjectJob } from '#services/transformers/projects/parts/project-job.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment*/
/* eslint-disable @typescript-eslint/no-unsafe-call*/
/* eslint-disable @typescript-eslint/no-unsafe-member-access*/
/* eslint-disable @typescript-eslint/restrict-template-expressions*/
/* eslint-disable @typescript-eslint/require-await */

const now = new Date();

const prismaJob1 = {
  projectId: 1,
  roleId: 23,
  contactUserId: 6,
  jobId: 390,
  createdAt: now,
  updatedAt: now,
  availability: 'FullTime' as JobAvailability,
  duration: 'ShortTerm' as JobDuration,
  location: 'Hybrid' as JobLocation,
  compensation: 'Paid' as JobCompensation,
  description: 'test job',
};

const prismaJob2 = {
  projectId: 1,
  roleId: 25,
  contactUserId: 7,
  jobId: 391,
  createdAt: now,
  updatedAt: now,
  availability: 'FullTime' as JobAvailability,
  duration: 'ShortTerm' as JobDuration,
  location: 'Hybrid' as JobLocation,
  compensation: 'Paid' as JobCompensation,
  description: 'test job 2',
};

const transformedJobs: ProjectJob[] = [
  {
    role: {
      roleId: 23,
      label: '',
    },
    contact: { userId: 6 } as UserPreview,
    jobId: 390,
    createdAt: now,
    updatedAt: now,
    availability: 'FullTime',
    duration: 'ShortTerm',
    location: 'Hybrid',
    compensation: 'Paid',
    description: 'test job',
    apiUrl: '/api/projects/1/jobs/390',
  },
  {
    role: {
      roleId: 25,
      label: '',
    },
    contact: { userId: 7 } as UserPreview,
    jobId: 391,
    createdAt: now,
    updatedAt: now,
    availability: 'FullTime',
    duration: 'ShortTerm',
    location: 'Hybrid',
    compensation: 'Paid',
    description: 'test job 2',
    apiUrl: '/api/projects/1/jobs/391',
  },
];

vi.mock('#config/prisma.ts', () => ({
  default: {
    jobs: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/projects/parts/project-job.ts', () => ({
  transformProjectJob: vi.fn(),
}));

describe('getJobsService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (transformProjectJob as Mock).mockImplementation(
      (
        projectId: number,
        {
          availability,
          compensation,
          contactUserId,
          createdAt,
          description,
          duration,
          jobId,
          location,
          roleId,
          updatedAt,
        },
      ): ProjectJob => {
        return {
          availability,
          compensation,
          createdAt,
          description,
          contact: { userId: contactUserId } as UserPreview,
          duration,
          jobId,
          location,
          role: {
            roleId: roleId,
            label: '',
          },
          updatedAt,
          apiUrl: `/api/projects/${projectId.toString()}/jobs/${jobId.toString()}`,
        };
      },
    );
  });
  it('returns the jobs if successful', async () => {
    vi.mocked(prisma.jobs.findMany).mockResolvedValue([prismaJob1, prismaJob2]);
    const result = await getJobsService(1);

    expect(transformProjectJob).toBeCalled();
    expect(transformProjectJob).toBeCalledTimes(2);
    expect(result).toStrictEqual(transformedJobs);
  });

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.jobs.findMany).mockRejectedValue(new Error('womp womp'));
    const result = await getJobsService(1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
