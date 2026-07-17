import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import getUserReportsService from '#services/mod/get-user-reports.ts';

/* eslint-disable @typescript-eslint/unbound-method */

/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    reportUser: {
      findMany: vi.fn(),
    },
  },
}));

const prismaReports = [
  {
    reportId: 3,
    reporterId: 1,
    reportedId: 2,
    reportText: 'test report',
    active: true,
  },
  {
    reportId: 7,
    reporterId: 5,
    reportedId: 6,
    reportText: 'test report 2',
    active: false,
  },
];

const transformedReports = [
  {
    apiUrl: 'api/mod/user-report/3',
    reportId: 3,
    reporterId: 1,
    reportedId: 2,
    reason: 'test report',
    active: true,
  },
  {
    apiUrl: 'api/mod/user-report/7',
    reportId: 7,
    reporterId: 5,
    reportedId: 6,
    reason: 'test report 2',
    active: false,
  },
];

describe('getProjectReportsService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns array of reports', async () => {
    vi.mocked(prisma.reportUser.findMany).mockResolvedValue(prismaReports);

    const result = await getUserReportsService();
    expect(result).toStrictEqual(transformedReports);
  });

  it('returns NOT_FOUND if there are no reports', async () => {
    vi.mocked(prisma.reportUser.findMany).mockResolvedValue([]);

    const result = await getUserReportsService();
    expect(result).toEqual('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.reportUser.findMany).mockRejectedValue(new Error('womp womp'));

    const result = await getUserReportsService();
    expect(result).toEqual('INTERNAL_ERROR');
  });
});
