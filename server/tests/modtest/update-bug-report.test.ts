import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import updateBugReportService from '#services/mod/update-bug-report.ts';

/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    reportBug: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const now = new Date();

const prismaBugReport = {
  reportId: 1,
  userId: 1,
  reportText: 'Centipede',
  isResolved: false,
  modNotes: '',
  createdAt: now,
};

const updatedBugReport = {
  reportId: 1,
  userId: 1,
  reportText: 'Centipede',
  isResolved: true,
  modNotes: 'Killed it',
  createdAt: now,
};

describe('updateBugReportService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns OK when bug report updated successfully', async () => {
    vi.mocked(prisma.reportBug.findFirst).mockResolvedValue(prismaBugReport);
    vi.mocked(prisma.reportBug.update).mockResolvedValue(updatedBugReport);

    const result = await updateBugReportService(1, true, 'Killed it');

    expect(result).toEqual('OK');
  });

  it('returns NOT_FOUND when no bug report is found matching the id', async () => {
    vi.mocked(prisma.reportBug.findFirst).mockResolvedValue(null);

    const result = await updateBugReportService(1, true, 'Killed it');

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.reportBug.findFirst).mockRejectedValue(
      new Error('bugs have taken over the world!'),
    );

    const result = await updateBugReportService(1, true, 'Killed it');

    expect(result).toBe('INTERNAL_ERROR');
  });
});
