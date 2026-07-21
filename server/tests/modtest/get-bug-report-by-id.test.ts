import type { BugReport } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import prisma from '#config/prisma.ts';
import type { ReportBug } from '#prisma-models/index.js';
import getBugReportByIdService from '#services/mod/get-bug-report-by-id.ts';
import { transformBugReport } from '#services/transformers/mod/bug-report.ts';

/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    reportBug: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/mod/bug-report.ts', () => ({
  transformBugReport: vi.fn(),
}));

const prismaBugReport = {
  reportId: 1,
  userId: 1,
  reportText: 'ladybug',
  isResolved: false,
  modNotes: '',
  createdAt: new Date(),
};

const transformedBugReport: BugReport = {
  apiUrl: 'api/mod/bug-report/1',
  reportId: 1,
  userId: 1,
  reportText: 'ladybug',
  isResolved: false,
  modNotes: '',
  createdAt: new Date(),
};

describe('getBugReportByIdService', () => {
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

  it('returns the bug report matches the report id', async () => {
    vi.mocked(prisma.reportBug.findFirst).mockResolvedValue(prismaBugReport);

    const result = await getBugReportByIdService(1);

    expect(transformBugReport).toHaveBeenCalledTimes(1);
    expect(result).toEqual(transformedBugReport);
  });

  it('returns NOT_FOUND when no bug report is found matching the id', async () => {
    vi.mocked(prisma.reportBug.findFirst).mockResolvedValue(null);

    const result = await getBugReportByIdService(1);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.reportBug.findFirst).mockRejectedValue(
      new Error('bugs have taken over the world!'),
    );

    const result = await getBugReportByIdService(1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
