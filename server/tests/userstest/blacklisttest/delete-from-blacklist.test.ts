import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import deleteBlacklistService from '#services/users/blacklist/delete-from-blacklist.ts';

/* eslint-disable @typescript-eslint/unbound-method */

/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    userBlacklist: {
      delete: vi.fn(),
    },
  },
}));

describe('deleteBlacklistService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns OK if successful', async () => {
    const result = await deleteBlacklistService('1');

    expect(prisma.userBlacklist.delete).toHaveBeenCalled();
    expect(prisma.userBlacklist.delete).toHaveBeenCalledWith({
      where: {
        googleId: '1',
      },
    });
    expect(result).toBe('OK');
  });

  it("returns NOT_FOUND if user isn't on blacklist", async () => {
    vi.mocked(prisma.userBlacklist.delete).mockRejectedValue({ code: 'P2025' });
    const result = await deleteBlacklistService('1');

    expect(result).toBe('NOT_FOUND');
  });

  it("returns INTERNAL_ERROR if user isn't on blacklist", async () => {
    vi.mocked(prisma.userBlacklist.delete).mockRejectedValue(new Error('womp womp'));
    const result = await deleteBlacklistService('1');

    expect(result).toBe('INTERNAL_ERROR');
  });
});
