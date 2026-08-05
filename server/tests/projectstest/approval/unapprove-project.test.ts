import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { unapproveProjectService } from '#services/projects/approval/unapprove-project.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    projects: {
      update: vi.fn(),
    },
  },
}));

describe('unapproveProjectService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns OK when project is unapproved', async () => {
    vi.mocked(prisma.projects.update).mockResolvedValue({ projectId: 1 } as any);

    const result = await unapproveProjectService(1);

    expect(result).toBe('OK');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.projects.update).mockRejectedValue(new Error('db cursed'));

    const result = await unapproveProjectService(1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
