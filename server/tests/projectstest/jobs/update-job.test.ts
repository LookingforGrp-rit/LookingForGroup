import type {
  ProjectJob,
  JobAvailability,
  JobDuration,
  JobLocation,
  JobCompensation,
  UserPreview,
} from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import type { Prisma } from '#prisma-models/index.js';
import updateJobService from '#services/projects/jobs/update-job.ts';
import { transformProjectJob } from '#services/transformers/projects/parts/project-job.ts';

/* eslint-disable @typescript-eslint/unbound-method */

/* eslint-disable @typescript-eslint/require-await */

const now = new Date();

const jobData: Prisma.JobsUpdateInput = {
  description: 'new test job',
};

const prismaJob = {
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

const updatedJob = {
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
  description: 'new test job',
};

const transformedJob: ProjectJob = {
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
  description: 'new test job',
  apiUrl: '/api/projects/1/jobs/390',
};

vi.mock('#config/prisma.ts', () => ({
  default: {
    jobs: {
      update: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/projects/parts/project-job.ts', () => ({
  transformProjectJob: vi.fn(),
}));

describe('updateJobsService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns the job if successful', async () => {
    vi.mocked(prisma.jobs.findFirst).mockResolvedValue(prismaJob);
    vi.mocked(prisma.jobs.update).mockResolvedValue(updatedJob);
    vi.mocked(transformProjectJob).mockResolvedValue(transformedJob);
    const result = await updateJobService(1, 390, jobData);

    expect(result).toBe(transformedJob);
  });

  it("returns NOT_FOUND if job doesn't exist", async () => {
    vi.mocked(prisma.jobs.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.jobs.update).mockResolvedValue(updatedJob);
    vi.mocked(transformProjectJob).mockResolvedValue(transformedJob);
    const result = await updateJobService(1, 390, jobData);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.jobs.findFirst).mockRejectedValue(new Error('womp womp'));
    vi.mocked(prisma.jobs.update).mockResolvedValue(updatedJob);
    vi.mocked(transformProjectJob).mockResolvedValue(transformedJob);
    const result = await updateJobService(1, 390, jobData);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
