import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { addToBlocklistService } from '#services/me/blocklist/add-to-blocklist.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    blocklist: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
  },
}));

const prismaBlocked = {
  blockId: 1,
};

describe('addToBlocklistService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns CONFLICT when user is already blocked', async () => {
    vi.mocked(prisma.blocklist.findFirst).mockResolvedValue(prismaBlocked as any);

    const result = await addToBlocklistService(1, 2);

    expect(result).toBe('CONFLICT');
  });

  it('returns OK after successfully blocked', async () => {
    vi.mocked(prisma.blocklist.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.blocklist.create).mockResolvedValue(prismaBlocked as any);

    const result = await addToBlocklistService(1, 2);

    expect(result).toStrictEqual('OK');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.blocklist.create).mockRejectedValue(new Error('db cursed'));

    const result = await addToBlocklistService(1, 2);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
