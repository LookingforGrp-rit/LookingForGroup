import type {
  JobAvailability,
  JobDuration,
  JobLocation,
  JobCompensation,
} from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import deleteJobService from '#services/projects/jobs/delete-job.ts';

/* eslint-disable @typescript-eslint/unbound-method */

/* eslint-disable @typescript-eslint/require-await */

const now = new Date();

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

vi.mock('#config/prisma.ts', () => ({
  default: {
    jobs: {
      deleteMany: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

describe('deleteJobsService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns NO_CONTENT if deletion successful', async () => {
    vi.mocked(prisma.jobs.findFirst).mockResolvedValue(prismaJob);
    const result = await deleteJobService(1, 23);

    expect(result).toBe('NO_CONTENT');
  });

  it("returns NOT_FOUND if job isn't found", async () => {
    vi.mocked(prisma.jobs.findFirst).mockResolvedValue(null);
    const result = await deleteJobService(1, 23);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.jobs.findFirst).mockRejectedValue(new Error('womp womp'));
    const result = await deleteJobService(1, 23);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
