import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { promoteUserToModService } from '#services/admin/promote-to-mod.ts';
import { sendEmail } from '#services/mailer.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

vi.mock('#config/prisma.ts', () => ({
  default: {
    users: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('#services/mailer.ts', () => ({
  sendEmail: vi.fn(),
}));

const prismaUser = {
  userId: 1,
  accessLevel: 'User',
  firstName: 'Eric',
  lastName: 'E',
  ritEmail: 'EE@example.com',
} as any;

describe('promoteUserToModService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(sendEmail).mockResolvedValue('NO_CONTENT');
  });

  it('returns OK when a moderator is promoted and email is sent', async () => {
    vi.mocked(prisma.users.findFirst).mockResolvedValue(prismaUser);
    vi.mocked(prisma.users.update).mockResolvedValue({ ...prismaUser, accessLevel: 'Moderator' });

    const result = await promoteUserToModService(1);

    expect(result).toBe('OK');
    expect(prisma.users.findFirst).toHaveBeenCalledWith({
      where: { userId: 1 },
      select: {
        accessLevel: true,
        userId: true,
        firstName: true,
        lastName: true,
        ritEmail: true,
      },
    });
    expect(prisma.users.update).toHaveBeenCalledWith({
      where: { userId: 1 },
      data: { accessLevel: 'Moderator' },
    });
    expect(sendEmail).toHaveBeenCalledTimes(1);
    const email = vi.mocked(sendEmail).mock.calls[0][0];
    expect(email.sender.ritEmail).toBe('lfg-team@lookingforgrp.com');
    expect(email.receiver).toBe(prismaUser);
    expect(email.subject).toContain('promoted to Moderator');
    expect(email.textBody).toBeDefined();
    expect(email.HTMLBody).toBeDefined();
  });

  it('returns NOT_FOUND when the user does not exist', async () => {
    vi.mocked(prisma.users.findFirst).mockResolvedValue(null);

    const result = await promoteUserToModService(1);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns CONFLICT when the user is already a moderator', async () => {
    vi.mocked(prisma.users.findFirst).mockResolvedValue({
      ...prismaUser,
      accessLevel: 'Moderator',
    });

    const result = await promoteUserToModService(1);

    expect(result).toBe('CONFLICT');
  });

  it('returns CONFLICT when the user is an administrator', async () => {
    vi.mocked(prisma.users.findFirst).mockResolvedValue({
      ...prismaUser,
      accessLevel: 'Administrator',
    });

    const result = await promoteUserToModService(1);

    expect(result).toBe('CONFLICT');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.users.findFirst).mockRejectedValue(new Error('db ghosted'));

    const result = await promoteUserToModService(1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
