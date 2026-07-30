import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import type { Users } from '#prisma-models/index.js';
import { sendEmail } from '#services/mailer.ts';
import deleteBlacklistService from '#services/users/blacklist/delete-from-blacklist.ts';

/* eslint-disable @typescript-eslint/unbound-method */

/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    userBlacklist: {
      delete: vi.fn(),
    },
    users: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('#services/mailer.ts', () => ({
  sendEmail: vi.fn(),
}));

const prismaUser: Users = {
  userId: 1,
  googleId: 'u123',
  username: 'goldleaf',
  firstName: 'Gold',
  lastName: 'Leaf',
  ritEmail: 'goldleaf@rit.edu',
  profileImage: null,
  headline: '',
  pronouns: '',
  title: '',
  ritStatus: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  displayPhone: false,
  location: '',
  bio: '',
  privacy: 'public',
  phoneNumber: null,
  accessLevel: 'User',
  galleryEnabled: false,
};

describe('deleteBlacklistService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns OK if successful', async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(prismaUser);
    vi.mocked(sendEmail).mockResolvedValue('NO_CONTENT');
    const result = await deleteBlacklistService(1);

    expect(prisma.userBlacklist.delete).toHaveBeenCalled();
    expect(prisma.userBlacklist.delete).toHaveBeenCalledWith({
      where: {
        googleId: '1',
      },
    });
    expect(result).toBe('OK');
  });

  it("returns NOT_FOUND if user isn't on blacklist", async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(prismaUser);
    vi.mocked(sendEmail).mockResolvedValue('NO_CONTENT');
    vi.mocked(prisma.userBlacklist.delete).mockRejectedValue({ code: 'P2025' });
    const result = await deleteBlacklistService(1);

    expect(result).toBe('NOT_FOUND');
  });

  it("returns INTERNAL_ERROR if user isn't on blacklist", async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(prismaUser);
    vi.mocked(sendEmail).mockResolvedValue('NO_CONTENT');
    vi.mocked(prisma.userBlacklist.delete).mockRejectedValue(new Error('womp womp'));
    const result = await deleteBlacklistService(1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
