import type {
  ProjectContext,
  ProjectStatus,
  ProjectJob,
  JobAvailability,
  JobLocation,
  JobCompensation,
  UserPreview,
  Visibility,
  UserAccessLevel,
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
  jobStart: new Date(Date.now.toString()),
  jobEnd: new Date(Date.now.toString()),
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
  jobStart: new Date(Date.now.toString()),
  jobEnd: new Date(Date.now.toString()),
  location: 'Hybrid' as JobLocation,
  compensation: 'Paid' as JobCompensation,
  description: 'test job',
};

const transformedJob: ProjectJob = {
  role: {
    roleId: 23,
    label: '',
  },
  jobSkills: [],
  contact: { userId: 6 } as UserPreview,
  jobId: 390,
  createdAt: now,
  updatedAt: now,
  availability: 'FullTime',
  jobStart: new Date(Date.now.toString()),
  jobEnd: new Date(Date.now.toString()),
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
  context: 'Academic' as ProjectContext,
  status: 'Planning' as ProjectStatus,
  globalVisibility: 'public' as Visibility,
  thumbnailId: 0,
  title: 'test 1',
  updatedAt: now,
  userId: 1,
  approved: true,
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
  googleId: 'u123',
  username: 'goldleaf',
  firstName: 'Gold',
  lastName: 'Leaf',
  displayPhone: false,
  ritEmail: 'gold@rit.edu',
  privacy: 'public' as Visibility,
  profileImage: null,
  headline: '',
  pronouns: '',
  title: '',
  ritStatus: null,
  mentor: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  location: '',
  bio: '',
  phoneNumber: null,
  accessLevel: 'User' as UserAccessLevel,
  galleryEnabled: false,
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
