import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { userIsOnBlocklistService } from '#services/me/blocklist/user-is-on-blocklist.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    blocklist: {
      findFirst: vi.fn(),
    },
  },
}));

const prismaBlocked = {
  blockId: 1,
  blockerId: 1,
  blockedId: 2,
};

describe('userIsOnBlocklistService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns true when a user is on the blocklist', async () => {
    vi.mocked(prisma.blocklist.findFirst).mockResolvedValue(prismaBlocked as any);

    const result = await userIsOnBlocklistService(1, 2);

    expect(result).toBe(true);
  });

  it('returns false when a user is not on the blocklist', async () => {
    vi.mocked(prisma.blocklist.findFirst).mockResolvedValue(null);

    const result = await userIsOnBlocklistService(1, 2);

    expect(result).toBe(false);
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.blocklist.findFirst).mockRejectedValue(new Error('db cursed'));

    const result = await userIsOnBlocklistService(1, 2);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
