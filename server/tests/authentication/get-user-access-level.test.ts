import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { getUserAccessLevel } from '#services/authentication/get-user-access-level.ts';

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
  accessLevel: 'User',
};

describe('getUserAccessLevel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the accessLevel when user is found', async () => {
    vi.mocked(prisma.users.findFirst).mockResolvedValue(prismaUser as any);

    const result = await getUserAccessLevel(1);

    expect(result).toBe('User');
  });

  it('returns NOT_FOUND when user does not exists', async () => {
    vi.mocked(prisma.users.findFirst).mockResolvedValue(null);

    const result = await getUserAccessLevel(1);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.users.findFirst).mockRejectedValue(new Error('db ghosted'));

    const result = await getUserAccessLevel(1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
