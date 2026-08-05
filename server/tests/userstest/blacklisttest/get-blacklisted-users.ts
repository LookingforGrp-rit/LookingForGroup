import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { transformUserToDetail } from '#services/transformers/users/user-detail.ts';
import { getBlacklistedUsersService } from '#services/users/blacklist/get-blacklisted-users.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    users: {
      findMany: vi.fn(),
    },
    userBlacklist: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/users/user-detail.ts', () => ({
  transformUserToDetail: vi.fn(),
}));

const prismaBlacklist = [
  {
    googleId: '1',
    banReason: 'silly',
  },
  {
    googleId: '2',
    banReason: 'naughty',
  },
];

const prismaUsers = [
  {
    userId: 1,
    googleId: '1',
  },
  {
    userId: 2,
    googleId: '2',
  },
];

const transformed = [
  {
    userId: 1,
    username: 'user1',
  },
  {
    userId: 2,
    username: 'user2',
  },
];

describe('getBlacklistedUsersService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an array of blacklisted users if found', async () => {
    vi.mocked(prisma.userBlacklist.findMany).mockResolvedValue(prismaBlacklist);
    vi.mocked(prisma.users.findMany).mockResolvedValue(prismaUsers as any);
    vi.mocked(transformUserToDetail).mockResolvedValue(transformed as any);

    const result = await getBlacklistedUsersService();

    expect(prisma.userBlacklist.findMany).toHaveBeenCalled();
    expect(prisma.users.findMany).toHaveBeenCalledWith({
      where: {
        googleId: {
          in: prismaBlacklist.map((b) => b.googleId),
        },
      },
    });
    expect(transformUserToDetail).toHaveBeenCalledTimes(prismaUsers.length);
    expect(result).toStrictEqual(transformed);
  });

  it('returns [] if no blacklisted users are found', async () => {
    vi.mocked(prisma.userBlacklist.findMany).mockResolvedValue([]);
    vi.mocked(prisma.users.findMany).mockResolvedValue([]);

    const result = await getBlacklistedUsersService();

    expect(result).toStrictEqual([]);
  });

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.userBlacklist.findMany).mockRejectedValue(new Error('womp womp'));

    const result = await getBlacklistedUsersService();

    expect(result).toBe('INTERNAL_ERROR');
  });
});
