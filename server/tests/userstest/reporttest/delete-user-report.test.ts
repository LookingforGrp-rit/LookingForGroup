import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import deleteUserReportService from '#services/mod/delete-user-report.ts';

/* eslint-disable @typescript-eslint/unbound-method */

/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    reportUser: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const prismaReport = {
  reportId: 3,
  reporterId: 1,
  reportedId: 2,
  reportText: 'test report',
};

describe('deleteUserReportService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns NO_CONTENT if successful', async () => {
    vi.mocked(prisma.reportUser.findUnique).mockResolvedValue(prismaReport);

    const result = await deleteUserReportService(3);
    expect(result).toBe('NO_CONTENT');
  });
  it("returns NOT_FOUND if the report isn't found", async () => {
    vi.mocked(prisma.reportUser.findUnique).mockResolvedValue(null);

    const result = await deleteUserReportService(3);
    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.reportUser.findUnique).mockRejectedValue(new Error('womp womp'));

    const result = await deleteUserReportService(3);
    expect(result).toBe('INTERNAL_ERROR');
  });
});
