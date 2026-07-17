import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import userOnBlacklistService from '#services/users/blacklist/user-on-blacklist.ts';

/* eslint-disable @typescript-eslint/unbound-method */

/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    userBlacklist: {
      findUnique: vi.fn(),
    },
  },
}));

describe('deleteBlacklistService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns OK if successful', async () => {
    vi.mocked(prisma.userBlacklist.findUnique).mockResolvedValue({
      googleId: '1',
      banReason: 'silly',
    });
    const result = await userOnBlacklistService('1');

    expect(result).toBe('OK');
  });

  it("returns NOT_FOUND if user isn't found", async () => {
    vi.mocked(prisma.userBlacklist.findUnique).mockResolvedValue(null);
    const result = await userOnBlacklistService('1');

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.userBlacklist.findUnique).mockRejectedValue(new Error('womp womp'));
    const result = await userOnBlacklistService('1');

    expect(result).toBe('INTERNAL_ERROR');
  });
});
