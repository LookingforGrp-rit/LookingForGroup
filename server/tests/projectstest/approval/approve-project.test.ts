import type { ProjectStatus, Visibility } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { approveProjectService } from '#services/projects/approval/approve-project.ts';

/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    projectsAwaitingApproval: {
      delete: vi.fn(),
    },
    projects: {
      update: vi.fn(),
    },
  },
}));

const now = new Date();

const deleted = {
  projectId: 1,
};

const prismaProject = {
  userId: 1,
  title: 'Test Project',
  createdAt: now,
  updatedAt: now,
  projectId: 1,
  hook: 'hook',
  description: 'This is a test project.',
  thumbnailId: null,
  context: null,
  status: 'Planning' as ProjectStatus,
  audience: 'people',
  globalVisibility: 'public' as Visibility,
  approved: true,
};

describe('approveProjectService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns OK when project is approved', async () => {
    vi.mocked(prisma.projectsAwaitingApproval.delete).mockResolvedValue(deleted);
    vi.mocked(prisma.projects.update).mockResolvedValue(prismaProject);

    const result = await approveProjectService(1);

    expect(result).toBe('OK');
  });

  it('returns NOT_FOUND when the project approval request is not found', async () => {
    vi.mocked(prisma.projectsAwaitingApproval.delete).mockRejectedValue({ code: 'P2025' });

    const result = await approveProjectService(1);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.projectsAwaitingApproval.delete).mockRejectedValue(new Error('db cursed'));

    const result = await approveProjectService(1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
