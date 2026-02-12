import { describe, it, expect } from 'vitest';
import prisma from '#config/prisma.ts';
import { getUserByIdService } from '#services/users/get-user/get-by-id.ts';

describe('getUserByIdService(integration)', () => {
  it('returns a REAL USER from the database. ONLY FOR TESTING!', async () => {
    const anyUser = await prisma.users.findFirst();

    if (!anyUser) {
      throw new Error('No users exist in the database to test against');
    }

    const result = await getUserByIdService(anyUser.userId);
    // console.log(result); //read the user for more testing

    expect(result).not.toBe('NOT_FOUND');
    expect(result).not.toBe('INTERNAL_ERROR');

    if (typeof result === 'string') {
      throw new Error(`Unexpected service error: ${result}`);
    }

    expect(result).toHaveProperty('userId', anyUser.userId);
    expect(result).toHaveProperty('username');
    expect(result).toHaveProperty('apiUrl');
  });
});
