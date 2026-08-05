import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { rejectProjectService } from '#services/projects/approval/reject-project.ts';

/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    projectsAwaitingApproval: {
      delete: vi.fn(),
    },
  },
}));

describe('rejectProjectService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns NO_CONTENT when project approval request is found and deleted', async () => {
    vi.mocked(prisma.projectsAwaitingApproval.delete).mockResolvedValue({ projectId: 1 });

    const result = await rejectProjectService(1);

    expect(result).toBe('NO_CONTENT');
  });

  it('returns NOT_FOUND when project approval request is not found', async () => {
    vi.mocked(prisma.projectsAwaitingApproval.delete).mockRejectedValue({ code: 'P2025' });

    const result = await rejectProjectService(1);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.projectsAwaitingApproval.delete).mockRejectedValue(new Error('db cursed'));

    const result = await rejectProjectService(1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
