import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { removeFromBlocklistService } from '#services/me/blocklist/remove-from-blocklist.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    blocklist: {
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

const prismaBlocked = {
  blockId: 1,
};

describe('removeFromBlocklistService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns OK when a block is successfully removed', async () => {
    vi.mocked(prisma.blocklist.findFirst).mockResolvedValue(prismaBlocked as any);
    vi.mocked(prisma.blocklist.delete).mockResolvedValue(prismaBlocked as any);

    const result = await removeFromBlocklistService(1, 2);

    expect(result).toBe('OK');
  });

  it('returns CONFLICT when a block does not exist', async () => {
    vi.mocked(prisma.blocklist.findFirst).mockResolvedValue(null);

    const result = await removeFromBlocklistService(1, 2);

    expect(result).toBe('CONFLICT');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.blocklist.findFirst).mockRejectedValue(new Error('db cursed'));

    const result = await removeFromBlocklistService(1, 2);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
