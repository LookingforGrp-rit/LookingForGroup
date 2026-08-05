import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { reportBugService } from '#services/me/report-bug.ts';

/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    reportBug: {
      create: vi.fn(),
    },
  },
}));

const prismaBugReport = {
  reportId: 1,
  userId: 1,
  reportText: 'ladybug',
  isResolved: false,
  modNotes: '',
  createdAt: new Date(),
};

describe('reportBugService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns OK when bug report created successfully', async () => {
    vi.mocked(prisma.reportBug.create).mockResolvedValue(prismaBugReport);

    const result = await reportBugService(1, 'ladybug');

    expect(result).toEqual('OK');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.reportBug.create).mockRejectedValue(new Error('db cursed'));

    const result = await reportBugService(1, 'ladybug');

    expect(result).toBe('INTERNAL_ERROR');
  });
});
