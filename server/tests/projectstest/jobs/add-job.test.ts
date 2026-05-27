import type {
  ProjectPurpose,
  ProjectStatus,
  ProjectJob,
  JobAvailability,
  JobDuration,
  JobLocation,
  JobCompensation,
  UserPreview,
} from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import addJobService, { type JobInput } from '#services/projects/jobs/add-job.ts';
import { transformProjectJob } from '#services/transformers/projects/parts/project-job.ts';

/* eslint-disable @typescript-eslint/unbound-method */

/* eslint-disable @typescript-eslint/require-await */

const now = new Date();

const jobData: JobInput = {
  roleId: 23,
  contactUserId: 6,
  availability: 'FullTime',
  duration: 'ShortTerm',
  location: 'Hybrid',
  compensation: 'Paid',
  description: 'test job',
};

const createdJob = {
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
  description: 'test job',
  apiUrl: '/api/projects/1/jobs/390',
};

const prismaProject = {
  audience: '',
  createdAt: now,
  description: '',
  hook: '',
  projectId: 1,
  purpose: 'Academic' as ProjectPurpose,
  status: 'Planning' as ProjectStatus,
  thumbnailId: 0,
  title: 'test 1',
  updatedAt: now,
  userId: 1,
};

vi.mock('#config/prisma.ts', () => ({
  default: {
    projects: {
      findUnique: vi.fn(),
    },
    users: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    roles: {
      findMany: vi.fn(),
    },
    majors: {
      findMany: vi.fn(),
    },
    jobs: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

const prismaUser = {
  userId: 1,
  universityId: 'u123',
  username: 'goldleaf',
  firstName: 'Gold',
  lastName: 'Leaf',
  ritEmail: 'gold@rit.edu',
  profileImage: null,
  headline: '',
  pronouns: '',
  title: '',
  academicYear: null,
  mentor: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  location: '',
  funFact: '',
  bio: '',
  visibility: 0,
  phoneNumber: null,
};

vi.mock('#services/transformers/projects/parts/project-job.ts', () => ({
  transformProjectJob: vi.fn(),
}));

describe('addJobsService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns the job if successful', async () => {
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(prismaProject);
    vi.mocked(prisma.users.findUnique).mockResolvedValue(prismaUser);
    vi.mocked(prisma.jobs.create).mockResolvedValue(createdJob);
    vi.mocked(transformProjectJob).mockResolvedValue(transformedJob);
    const result = await addJobService(1, jobData);

    expect(result).toBe(transformedJob);
  });

  it("returns NOT_FOUND if project isn't found", async () => {
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.users.findUnique).mockResolvedValue(prismaUser);
    vi.mocked(prisma.jobs.create).mockResolvedValue(createdJob);
    vi.mocked(transformProjectJob).mockResolvedValue(transformedJob);
    const result = await addJobService(1, jobData);

    expect(result).toBe('NOT_FOUND');
  });

  it("returns NOT_FOUND if user isn't found", async () => {
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(prismaProject);
    vi.mocked(prisma.users.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.jobs.create).mockResolvedValue(createdJob);
    vi.mocked(transformProjectJob).mockResolvedValue(transformedJob);
    const result = await addJobService(1, jobData);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.projects.findUnique).mockRejectedValue(new Error('womp womp'));
    vi.mocked(prisma.users.findUnique).mockResolvedValue(prismaUser);
    vi.mocked(prisma.jobs.create).mockResolvedValue(createdJob);
    vi.mocked(transformProjectJob).mockResolvedValue(transformedJob);
    const result = await addJobService(1, jobData);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
