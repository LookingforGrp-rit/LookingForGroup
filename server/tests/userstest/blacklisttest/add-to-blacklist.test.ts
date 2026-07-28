import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import type { Users } from '#prisma-models/index.js';
import addBlacklistService from '#services/users/blacklist/add-to-blacklist.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    userBlacklist: {
      create: vi.fn(),
    },
    users: {
      findUnique: vi.fn(),
    },
    session: {
      deleteMany: vi.fn(),
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
  galleryEnabled: true,
};

describe('addBlacklistService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns OK if successful', async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(prismaUser);
    const result = await addBlacklistService(1, 'silly');

    expect(prisma.userBlacklist.create).toHaveBeenCalled();
    expect(prisma.userBlacklist.create).toHaveBeenCalledWith({
      data: {
        googleId: 'u123',
        banReason: 'silly',
      },
    });
    expect(result).toBe('OK');
  });
  it("deletes the banned user's sessions so they get logged out", async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(prismaUser);
    const result = await addBlacklistService(1, 'silly');

    expect(prisma.session.deleteMany).toHaveBeenCalledWith({
      where: {
        gid: 'u123',
      },
    });
    expect(result).toBe('OK');
  });
  it('returns INTERNAL_ERROR if the sessions cannot be deleted', async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(prismaUser);
    vi.mocked(prisma.session.deleteMany).mockRejectedValue(new Error('womp womp'));
    const result = await addBlacklistService(1, 'silly');

    expect(result).toBe('INTERNAL_ERROR');
  });
  it("returns NOT_FOUND if the user can't be found", async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(null);
    const result = await addBlacklistService(1, 'silly');

    expect(result).toBe('NOT_FOUND');
  });
  it('returns CONFLICT if the user is already blacklisted', async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(prismaUser);
    vi.mocked(prisma.userBlacklist.create).mockRejectedValue({ code: 'P2002' });
    const result = await addBlacklistService(1, 'silly');

    expect(result).toBe('CONFLICT');
  });
  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.users.findUnique).mockRejectedValue(new Error('womp womp'));
    const result = await addBlacklistService(1, 'silly');

    expect(result).toBe('INTERNAL_ERROR');
  });
});
