import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { deleteUserFollowService } from '#services/me/followings/delete-follow-user.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */

vi.mock('#config/prisma.ts', () => ({
  default: {
    userFollowings: {
      delete: vi.fn(),
    },
  },
}));

const prismaUserFollowing = {
  followedAt: new Date(),
  senderId: 1,
  receiverId: 2,
};

describe('deleteProjectFollowService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns NOT_FOUND if user does not exist', async () => {
    vi.mocked(prisma.userFollowings.delete).mockRejectedValue({ code: 'P2025' } as any);

    const result = await deleteUserFollowService(1, 2);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns NO_CONTENT after follow deleted successfully', async () => {
    vi.mocked(prisma.userFollowings.delete).mockResolvedValue(prismaUserFollowing);

    const result = await deleteUserFollowService(1, 2);

    expect(result).toBe('NO_CONTENT');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.userFollowings.delete).mockRejectedValue(new Error('db cursed'));

    const result = await deleteUserFollowService(1, 2);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
