import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { getBanDetailService } from '#services/users/blacklist/get-ban-detail.ts';

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    users: {
      findUnique: vi.fn(),
    },
    userBlacklist: {
      findUnique: vi.fn(),
    },
  },
}));

const prismaUser = {
  userId: 1,
  googleId: '1',
};

describe('getBanDetailService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns ban details if ban is found', async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(prismaUser as any);
    vi.mocked(prisma.userBlacklist.findUnique).mockResolvedValue({
      googleId: prismaUser.googleId,
      banReason: 'silly',
    });

    const result = await getBanDetailService(1);

    expect(result).toStrictEqual({
      banReason: 'silly',
    });
  });

  it('returns NOT_FOUND if user is not found', async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(null);

    const result = await getBanDetailService(1);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns NOT_FOUND if ban is not found', async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(prismaUser as any);
    vi.mocked(prisma.userBlacklist.findUnique).mockResolvedValue(null);

    const result = await getBanDetailService(1);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.users.findUnique).mockRejectedValue(new Error('womp womp'));

    const result = await getBanDetailService(1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
