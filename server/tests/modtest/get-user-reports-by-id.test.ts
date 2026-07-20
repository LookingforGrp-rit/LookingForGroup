import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import getUserReportByIdService from '#services/mod/get-user-report-by-id.ts';

/* eslint-disable @typescript-eslint/unbound-method */

/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    reportUser: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

const prismaReport = {
  reportId: 7,
  reporterId: 5,
  reportedId: 6,
  reportText: 'test report 2',
  active: false,
};

const transformedReport = {
  apiUrl: 'api/mod/user-report/7',
  reportId: 7,
  reporterId: 5,
  reportedId: 6,
  reason: 'test report 2',
  active: false,
};

describe('getProjectReportsService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns array of reports', async () => {
    vi.mocked(prisma.reportUser.findUnique).mockResolvedValue(prismaReport);

    const result = await getUserReportByIdService(7);
    expect(result).toStrictEqual(transformedReport);
  });

  it('returns NOT_FOUND if there are no reports', async () => {
    vi.mocked(prisma.reportUser.findUnique).mockResolvedValue(null);

    const result = await getUserReportByIdService(700);
    expect(result).toEqual('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.reportUser.findUnique).mockRejectedValue(new Error('womp womp'));

    const result = await getUserReportByIdService(7);
    expect(result).toEqual('INTERNAL_ERROR');
  });
});
