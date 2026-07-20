import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import getProjectReportByIdService from '#services/mod/get-project-report-by-id.ts';

/* eslint-disable @typescript-eslint/unbound-method */

/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    reportProject: {
      findUnique: vi.fn(),
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

const transformedReport = {
  apiUrl: 'api/mod/project-report/3',
  reportId: 3,
  userId: 1,
  projectId: 2,
  reason: 'test report',
};

describe('getProjectReportsService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns a project report', async () => {
    vi.mocked(prisma.reportProject.findUnique).mockResolvedValue(prismaReport);

    const result = await getProjectReportByIdService(3);
    expect(result).toStrictEqual(transformedReport);
  });

  it('returns NOT_FOUND if there are no report', async () => {
    vi.mocked(prisma.reportProject.findUnique).mockResolvedValue(null);

    const result = await getProjectReportByIdService(100);
    expect(result).toEqual('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.reportProject.findUnique).mockRejectedValue(new Error('womp womp'));

    const result = await getProjectReportByIdService(3);
    expect(result).toEqual('INTERNAL_ERROR');
  });
});
