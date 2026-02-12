import type { UserFollowsList } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import type { Users } from '#prisma-models/index.js';
import { transformUserToPreview } from '#services/transformers/users/user-preview.ts';
import { getUserFollowersService } from '#services/users/followings/get-user-followers.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */

vi.mock('#config/prisma.ts', () => ({
  default: {
    userFollowings: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/users/user-preview.ts', () => ({
  transformUserToPreview: vi.fn(),
}));

describe('getUserFollowersService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns followers list for a user', async () => {
    const senderUser: Users = {
      userId: 2,
      username: 'sender',
      ritEmail: 'send@rit.edu',
      firstName: 'send',
      lastName: 'user',
      profileImage: null,
      headline: '',
      pronouns: '',
      title: '',
      academicYear: null,
      location: '',
      funFact: '',
      bio: '',
      visibility: 0,
      mentor: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      phoneNumber: null,
      universityId: '',
    };

    const prismaResult = [
      {
        senderId: 2,
        receiverId: 1,
        followedAt: new Date('2025-01-01'),
      },
    ];

    const transformed = {
      userId: 2,
      username: 'sender',
      firstName: 'send',
      lastName: 'user',
      profileImage: null,
      mentor: false,
      headline: '',
      pronouns: '',
      title: '',
      academicYear: null,
      location: '',
      funFact: '',
      bio: '',
      designer: false,
      developer: false,
      majors: [],
      apiUrl: '/api/users/2',
    };

    vi.mocked(prisma.userFollowings.findMany).mockResolvedValue(prismaResult as any);
    vi.mocked(transformUserToPreview).mockReturnValue(transformed as any);

    const result = await getUserFollowersService(10);

    expect(vi.mocked(prisma.userFollowings.findMany)).toHaveBeenCalledWith({
      where: { receiverId: 10 },
      orderBy: { followedAt: 'desc' },
      select: {
        senderUser: { select: expect.any(Object) },
        followedAt: true,
      },
    });

    const expected: UserFollowsList = {
      count: 1,
      users: [
        {
          followedAt: prismaResult[0].followedAt,
          user: transformed,
        },
      ],
      apiUrl: '/api/users/10/followers',
    };

    expect(result).toEqual(expected);
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.userFollowings.findMany).mockRejectedValue(new Error('db broke'));

    const result = await getUserFollowersService(10);
    expect(result).toBe('INTERNAL_ERROR');
  });
});
