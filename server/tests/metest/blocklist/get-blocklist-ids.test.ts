import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { getBlocklistIdsService } from '#services/me/blocklist/get-blocklist-ids.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    blocklist: {
      findMany: vi.fn(),
    },
  },
}));

const prismaBlocklist = [{ blockedId: 3 }, { blockedId: 5 }, { blockedId: 18 }];

describe('getBlocklistIdsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an array of blocked user IDs', async () => {
    vi.mocked(prisma.blocklist.findMany).mockResolvedValue(prismaBlocklist as any);

    const result = await getBlocklistIdsService(1);

    expect(result).toStrictEqual([3, 5, 18]);
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.blocklist.findMany).mockRejectedValue(new Error('db cursed'));

    const result = await getBlocklistIdsService(1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
