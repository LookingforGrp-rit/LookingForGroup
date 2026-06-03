import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { deleteUserService } from '#services/me/delete-user.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    userSocials: {
      findFirst: vi.fn(),
      deleteMany: vi.fn(),
    },
    userFollowings: {
      deleteMany: vi.fn(),
    },
    userSkills: {
      deleteMany: vi.fn(),
    },
    projectFollowings: {
      deleteMany: vi.fn(),
    },
    users: {
      findFirst: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('deleteUserService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns NOT_FOUND if user does not exist', async () => {
    vi.mocked(prisma.users.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.users.delete).mockRejectedValue(new Error('User not found'));

    const result = await deleteUserService(1);

    expect(result).toBe('NOT_FOUND');
  });

  it('deletes user and related data successfully', async () => {
    vi.mocked(prisma.users.findFirst).mockResolvedValue({ userId: 1 } as any);
    vi.mocked(prisma.userFollowings.deleteMany).mockResolvedValue({ count: 1 });
    vi.mocked(prisma.userSkills.deleteMany).mockResolvedValue({ count: 1 });
    vi.mocked(prisma.userSocials.deleteMany).mockResolvedValue({ count: 1 });
    vi.mocked(prisma.projectFollowings.deleteMany).mockResolvedValue({ count: 1 });
    vi.mocked(prisma.users.delete).mockResolvedValue({ userId: 1 } as any);

    const result = await deleteUserService(1);

    expect(prisma.userFollowings.deleteMany).toHaveBeenCalledWith({ where: { senderId: 1 } });
    expect(prisma.userFollowings.deleteMany).toHaveBeenCalledWith({ where: { receiverId: 1 } });
    expect(prisma.userSkills.deleteMany).toHaveBeenCalledWith({ where: { userId: 1 } });
    expect(prisma.userSocials.deleteMany).toHaveBeenCalledWith({ where: { userId: 1 } });
    expect(prisma.projectFollowings.deleteMany).toHaveBeenCalledWith({ where: { userId: 1 } });
    expect(prisma.users.delete).toHaveBeenCalledWith({ where: { userId: 1 } });

    expect(result).toBe('NO_CONTENT');
  });

  it('returns INTERNAL_ERROR on exception', async () => {
    vi.mocked(prisma.users.findFirst).mockResolvedValue({ userId: 1 } as any);
    vi.mocked(prisma.users.delete).mockRejectedValue(new Error('db exploded :fire:'));

    const result = await deleteUserService(1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
