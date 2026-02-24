import { describe, it, expect } from 'vitest';
import prisma from '#config/prisma.ts';
import { getUserByUsernameService } from '#services/users/get-user/get-by-username.ts';

describe('getUserByUsernameService (integration)', () => {
  it('returns a real user by username from the database', async () => {
    const anyUser = await prisma.users.findFirst({
      select: { username: true },
    });

    if (!anyUser?.username) {
      throw new Error('No users exist in the database to test against');
    }

    const result = await getUserByUsernameService(anyUser.username);

    expect(result).not.toBe('NOT_FOUND');
    expect(result).not.toBe('INTERNAL_ERROR');

    if (typeof result === 'string') {
      throw new Error(`Unexpected service error: ${result}`);
    }

    expect(result).toHaveProperty('userId');
    expect(result).toHaveProperty('username', anyUser.username);
    expect(result).toHaveProperty('apiUrl');
  });
});
