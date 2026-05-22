import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { deleteProjectFollowService } from '#services/me/followings/delete-follow-proj.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */

vi.mock('#config/prisma.ts', () => ({
  default: {
    projectFollowings: {
      delete: vi.fn(),
    },
  },
}));

const prismaProjectFollowing = {
  userId: 1,
  projectId: 1,
  followedAt: new Date(),
};

describe('deleteProjectFollowService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // !! remove skip if NOT_FOUND added in #services/me/followings/delete-follow-proj.ts
  it.skip('returns NOT_FOUND if project does not exist', async () => {
    vi.mocked(prisma.projectFollowings.delete).mockRejectedValue({ code: 'P2025' } as any);

    const result = await deleteProjectFollowService(1, 1);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns NO_CONTENT after follow deleted successfully', async () => {
    vi.mocked(prisma.projectFollowings.delete).mockResolvedValue(prismaProjectFollowing);

    const result = await deleteProjectFollowService(1, 1);

    expect(result).toBe('NO_CONTENT');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.projectFollowings.delete).mockRejectedValue(new Error('db cursed'));

    const result = await deleteProjectFollowService(1, 1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
