import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import deleteProjectReportService from '#services/mod/delete-project-report.ts';

/* eslint-disable @typescript-eslint/unbound-method */

/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    reportProject: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const prismaReport = {
  reportId: 3,
  userId: 1,
  projectId: 2,
  reportText: 'test report',
};

describe('deleteProjectReportService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns NO_CONTENT if successful', async () => {
    vi.mocked(prisma.reportProject.findUnique).mockResolvedValue(prismaReport);

    const result = await deleteProjectReportService(3);
    expect(result).toBe('NO_CONTENT');
  });
  it("returns NOT_FOUND if the report isn't found", async () => {
    vi.mocked(prisma.reportProject.findUnique).mockResolvedValue(null);

    const result = await deleteProjectReportService(3);
    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.reportProject.findUnique).mockRejectedValue(new Error('womp womp'));

    const result = await deleteProjectReportService(3);
    expect(result).toBe('INTERNAL_ERROR');
  });
});
