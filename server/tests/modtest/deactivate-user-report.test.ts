import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import deactivateUserReport from '#services/mod/deactivate-user-report.ts';

/* eslint-disable @typescript-eslint/unbound-method */

/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    reportUser: {
      update: vi.fn(),
    },
  },
}));

const prismaReport = {
  reportId: 3,
  reporterId: 1,
  reportedId: 2,
  reportText: 'test report',
  active: false,
};

describe('getProjectReportsService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns NO_CONTENT of reports', async () => {
    vi.mocked(prisma.reportUser.update).mockResolvedValue(prismaReport);

    const result = await deactivateUserReport(3);
    expect(result).toEqual('NO_CONTENT');
  });

  // no need to check for existence of report here, since the middleware already did it

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.reportUser.update).mockRejectedValue(new Error('womp womp'));

    const result = await deactivateUserReport(3);
    expect(result).toEqual('INTERNAL_ERROR');
  });
});
