import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { reportProjectService } from '#services/me/report-proj.ts';

/* eslint-disable @typescript-eslint/unbound-method */

/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    //I hate my stupid baka chungus life
    reportProject: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    projectImages: {
      findMany: vi.fn(),
    },
    roles: {
      findMany: vi.fn(),
    },
    majors: {
      findMany: vi.fn(),
    },
    users: {
      findMany: vi.fn(),
    },
    jobs: {
      findMany: vi.fn(),
    },
    members: {
      findMany: vi.fn(),
    },
    socials: {
      findMany: vi.fn(),
    },
    projectSocials: {
      findMany: vi.fn(),
    },
    mediums: {
      findMany: vi.fn(),
    },
    tags: {
      findMany: vi.fn(),
    },
    projects: {
      findMany: vi.fn(),
    },
  },
}));

const prismaReport = {
  reportId: 3,
  userId: 1,
  projectId: 2,
  reportText: 'test report',
};

describe('reportProjectService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns OK when it creates a report', async () => {
    vi.mocked(prisma.reportProject.findFirst).mockResolvedValue(null);

    const result = await reportProjectService(1, 2, 'test report');

    expect(prisma.reportProject.create).toHaveBeenCalledWith({
      data: {
        userId: 1,
        projectId: 2,
        reportText: 'test report',
      },
    });
    expect(result).toEqual('OK');
  });

  it('returns CONFLICT if there already is report', async () => {
    vi.mocked(prisma.reportProject.findFirst).mockResolvedValue(prismaReport);

    const result = await reportProjectService(1, 2, 'test report');
    expect(result).toEqual('CONFLICT');
  });

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.reportProject.findFirst).mockRejectedValue(new Error('womp womp'));

    const result = await reportProjectService(1, 2, 'test report');
    expect(result).toEqual('INTERNAL_ERROR');
  });
});
