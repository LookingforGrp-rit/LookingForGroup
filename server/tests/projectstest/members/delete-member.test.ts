import type { ProjectPurpose, ProjectStatus } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { deleteMemberService } from '#services/projects/members/delete-member.ts';

/* eslint-disable @typescript-eslint/unbound-method */

/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    projects: {
      findUnique: vi.fn(),
    },
    members: {
      delete: vi.fn(),
    },
  },
}));
const now = new Date();
const prismaProject = {
  audience: '',
  createdAt: now,
  description: '',
  hook: '',
  projectId: 100,
  purpose: 'Academic' as ProjectPurpose,
  status: 'Planning' as ProjectStatus,
  thumbnailId: 8,
  title: 'test 1',
  updatedAt: now,
  userId: 1,
};

describe('addProjectMemberService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns NO_CONTENT when delete is successful', async () => {
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(prismaProject);
    const result = await deleteMemberService(100, 29);

    expect(result).toBe('NO_CONTENT');
  });

  it('returns NOT_FOUND if the request attempts to delete the owner', async () => {
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(prismaProject);
    const result = await deleteMemberService(100, 1);

    expect(result).toBe('NOT_FOUND');
  });

  it("returns NOT_FOUND if the project isn't found", async () => {
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(null);
    const result = await deleteMemberService(100, 29);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.projects.findUnique).mockRejectedValue(new Error('womp womp'));
    const result = await deleteMemberService(100, 29);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
