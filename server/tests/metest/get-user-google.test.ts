import type { UserAccessLevel } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { getUserByGoogleService } from '#services/me/get-user-google.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    users: {
      findFirst: vi.fn(),
    },
  },
}));

const prismaUser = {
  username: 'ece8433',
  userId: 1,
  accessLevel: 'Administrator' as UserAccessLevel,
};

describe('getUserByGoogleService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns username, userId, and accessLevel of the user in an object when found', async () => {
    vi.mocked(prisma.users.findFirst).mockResolvedValue(prismaUser as any);

    const result = await getUserByGoogleService('u123');

    expect(result).toEqual(prismaUser);
  });

  it('returns NOT_FOUND when user is not found', async () => {
    vi.mocked(prisma.users.findFirst).mockResolvedValue(null);

    const result = await getUserByGoogleService('u123');

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.users.findFirst).mockRejectedValue(new Error('db cursed'));

    const result = await getUserByGoogleService('u123');

    expect(result).toBe('INTERNAL_ERROR');
  });
});
