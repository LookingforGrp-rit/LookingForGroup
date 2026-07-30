import type { BugReport } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import prisma from '#config/prisma.ts';
import type { ReportBug } from '#prisma-models/index.js';
import getBugReportsService from '#services/mod/get-bug-reports.ts';
import { transformBugReport } from '#services/transformers/mod/bug-report.ts';

/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    reportBug: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/mod/bug-report.ts', () => ({
  transformBugReport: vi.fn(),
}));

const prismaBugReports = [
  {
    reportId: 1,
    userId: 1,
    reportText: 'ladybug',
    isResolved: false,
    modNotes: '',
    createdAt: new Date(),
  },
  {
    reportId: 2,
    userId: 4,
    reportText: 'stink bug',
    isResolved: false,
    modNotes: '',
    createdAt: new Date(),
  },
];

const transformedBugReports: BugReport[] = [
  {
    apiUrl: 'api/mod/bug-report/1',
    reportId: 1,
    userId: 1,
    reportText: 'ladybug',
    isResolved: false,
    modNotes: '',
    createdAt: new Date(),
  },
  {
    apiUrl: 'api/mod/bug-report/2',
    reportId: 2,
    userId: 4,
    reportText: 'stink bug',
    isResolved: false,
    modNotes: '',
    createdAt: new Date(),
  },
];

describe('getBugReportsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (transformBugReport as Mock).mockImplementation((b: ReportBug) => ({
      apiUrl: `api/mod/bug-report/${b.reportId.toString()}`,
      reportId: b.reportId,
      userId: b.userId,
      reportText: b.reportText,
      isResolved: b.isResolved,
      modNotes: b.modNotes,
      createdAt: b.createdAt,
    }));
  });

  it('returns an array of bug reports', async () => {
    vi.mocked(prisma.reportBug.findMany).mockResolvedValue(prismaBugReports);

    const result = await getBugReportsService();

    expect(transformBugReport).toHaveBeenCalledTimes(2);
    expect(result).toEqual(transformedBugReports);
  });

  it('returns NOT_FOUND when no bug reports are found', async () => {
    vi.mocked(prisma.reportBug.findMany).mockResolvedValue([]);

    const result = await getBugReportsService();

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.reportBug.findMany).mockRejectedValue(new Error('bugs everywhere!'));

    const result = await getBugReportsService();

    expect(result).toBe('INTERNAL_ERROR');
  });
});
