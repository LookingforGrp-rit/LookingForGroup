import { describe, it, expect } from 'vitest';
import prisma from '#config/prisma.ts';
import { getUserByEmailService } from '#services/users/get-user/get-by-email.ts';

describe('getUserByEmailService (integration)', () => {
  it('returns a real user by email from the database', async () => {
    const anyUser = await prisma.users.findFirst({
      select: {
        ritEmail: true,
      },
    });

    if (!anyUser?.ritEmail) {
      throw new Error('No users with emails exist in the database');
    }

    const result = await getUserByEmailService(anyUser.ritEmail);

    expect(result).not.toBe('NOT_FOUND');
    expect(result).not.toBe('INTERNAL_ERROR');

    if (typeof result === 'string') {
      throw new Error(`Unexpected service error: ${result}`);
    }

    expect(result).toHaveProperty('userId');
    expect(result).toHaveProperty('username');
    expect(result).toHaveProperty('apiUrl');
  });
});
