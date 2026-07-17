import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import getProjectReportsService from '#services/mod/get-project-reports.ts';

/* eslint-disable @typescript-eslint/unbound-method */

/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    reportProject: {
      findMany: vi.fn(),
    },
  },
}));

const prismaReports = [
  {
    reportId: 3,
    userId: 1,
    projectId: 2,
    reportText: 'test report',
  },
  {
    reportId: 7,
    userId: 5,
    projectId: 6,
    reportText: 'test report 2',
  },
];

const transformedReports = [
  {
    apiUrl: 'api/mod/project-report/3',
    reportId: 3,
    userId: 1,
    projectId: 2,
    reason: 'test report',
  },
  {
    apiUrl: 'api/mod/project-report/7',
    reportId: 7,
    userId: 5,
    projectId: 6,
    reason: 'test report 2',
  },
];

describe('getProjectReportsService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns array of reports', async () => {
    vi.mocked(prisma.reportProject.findMany).mockResolvedValue(prismaReports);

    const result = await getProjectReportsService();
    expect(result).toStrictEqual(transformedReports);
  });

  it('returns NOT_FOUND if there are no reports', async () => {
    vi.mocked(prisma.reportProject.findMany).mockResolvedValue([]);

    const result = await getProjectReportsService();
    expect(result).toEqual('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.reportProject.findMany).mockRejectedValue(new Error('womp womp'));

    const result = await getProjectReportsService();
    expect(result).toEqual('INTERNAL_ERROR');
  });
});
