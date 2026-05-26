import type { MyFollowing, UserPreview } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { addUserFollowingService } from '#services/me/followings/add-follow-user.ts';
import { transformUserToPreview } from '#services/transformers/users/user-preview.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    users: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    userFollowings: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
    majors: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/users/user-preview.ts', () => ({
  transformUserToPreview: vi.fn(),
}));

const prismaUser = {
  userId: 1,
};

const transformedUserPreview: UserPreview = {
  apiUrl: 'api/users/2',
  designer: false,
  developer: true,
  firstName: 'Eric',
  funFact: '',
  headline: '',
  lastName: '',
  location: '',
  majors: [
    {
      label: 'Animation',
      majorId: 1,
    },
  ],
  mentor: false,
  profileImage: null,
  pronouns: '',
  title: '',
  userId: 2,
  username: '',
};

const prismaUserFollowing: MyFollowing = {
  apiUrl: '/api/me/followings/people/2',
  followedAt: new Date(),
  user: transformedUserPreview, // receiver
};

describe('addUserFollowingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns FORBIDDEN if sender and receiver are the same', async () => {
    const result = await addUserFollowingService(1, 1);
    expect(result).toBe('FORBIDDEN');
  });

  it('returns NOT_FOUND when user is not found', async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(null);

    const result = await addUserFollowingService(1, 2);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns CONFLICT when user is already followed', async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(prismaUser as any);
    vi.mocked(prisma.userFollowings.findUnique).mockResolvedValue(prismaUser as any);

    const result = await addUserFollowingService(1, 2);

    expect(result).toBe('CONFLICT');
  });

  it('returns MyUserFollowing obj after successfully followed', async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(prismaUser as any);
    vi.mocked(prisma.userFollowings.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.userFollowings.create).mockResolvedValue(prismaUserFollowing as any);
    vi.mocked(transformUserToPreview).mockReturnValue(transformedUserPreview);

    const result = await addUserFollowingService(1, 2);

    // console.log(result);

    expect(result).toStrictEqual(prismaUserFollowing);
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.users.findUnique).mockRejectedValue(new Error('db cursed'));

    const result = await addUserFollowingService(1, 2);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
