import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import type { Users } from '#prisma-models/index.js';
import { sendEmail } from '#services/mailer.ts';
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
  preferredName: 'Gold',
  ritEmail: 'goldleaf@rit.edu',
  profileImage: null,
  headline: '',
  pronouns: '',
  title: '',
  ritStatus: null,
  mentor: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  displayPhone: false,
  location: '',
  bio: '',
  privacy: 'public',
  phoneNumber: null,
  accessLevel: 'User',
};

describe('addBlacklistService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns OK if successful', async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(prismaUser);
    vi.mocked(sendEmail).mockResolvedValue('NO_CONTENT');
    const result = await addBlacklistService('1', 'silly');

    expect(prisma.userBlacklist.create).toHaveBeenCalled();
    expect(prisma.userBlacklist.create).toHaveBeenCalledWith({
      data: {
        googleId: '1',
        banReason: 'silly',
      },
    });
    expect(result).toBe('OK');
  });
  it("returns NOT_FOUND if the user can't be found", async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(null);
    vi.mocked(sendEmail).mockResolvedValue('NO_CONTENT');
    const result = await addBlacklistService('1', 'silly');

    expect(result).toBe('NOT_FOUND');
  });
  it('returns CONFLICT if the user is already blacklisted', async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(prismaUser);
    vi.mocked(prisma.userBlacklist.create).mockRejectedValue({ code: 'P2002' });
    vi.mocked(sendEmail).mockResolvedValue('NO_CONTENT');
    const result = await addBlacklistService('1', 'silly');

    expect(result).toBe('CONFLICT');
  });
  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.users.findUnique).mockRejectedValue(new Error('womp womp'));
    vi.mocked(sendEmail).mockResolvedValue('NO_CONTENT');
    const result = await addBlacklistService('1', 'silly');

    expect(result).toBe('INTERNAL_ERROR');
  });
});
