import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { requestApprovalService } from '#services/projects/approval/request-approval.ts';

/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    projectsAwaitingApproval: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('requestApprovalService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns CREATED when project approval request is created', async () => {
    vi.mocked(prisma.projectsAwaitingApproval.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.projectsAwaitingApproval.create).mockResolvedValue({ projectId: 1 });

    const result = await requestApprovalService(1);

    expect(result).toBe('CREATED');
  });

  it('returns CONFLICT when project approval request is already exists', async () => {
    vi.mocked(prisma.projectsAwaitingApproval.findFirst).mockResolvedValue({ projectId: 1 });

    const result = await requestApprovalService(1);

    expect(result).toBe('CONFLICT');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.projectsAwaitingApproval.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.projectsAwaitingApproval.create).mockRejectedValue(new Error('db cursed'));

    const result = await requestApprovalService(1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
