import type { UserPreview } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { transformUserToPreview } from '#services/transformers/users/user-preview.ts';
import { getUserByUsernameService } from '#services/users/get-user/get-by-username.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    users: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/users/user-preview.ts', () => ({
  transformUserToPreview: vi.fn(),
}));

describe('getUserByUsernameService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns transformed user when found', async () => {
    const prismaUser = {
      userId: 3,
      username: 'emberfox',
    };

    const transformed: UserPreview = {
      userId: 3,
      username: 'emberfox',
      apiUrl: '/api/users/3',
      firstName: '',
      lastName: '',
      profileImage: null,
      mentor: false,
      designer: false,
      developer: false,
      headline: '',
      pronouns: '',
      title: '',
      funFact: '',
      location: '',
      majors: [],
    };

    vi.mocked(prisma.users.findFirst).mockResolvedValue(prismaUser as any);
    vi.mocked(transformUserToPreview).mockReturnValue(transformed);

    const result = await getUserByUsernameService('emberfox');

    const calls = vi.mocked(prisma.users.findFirst).mock.calls;
    const [args] = calls[0];

    expect(args?.where).toEqual({ username: 'emberfox' });
    expect(args?.select).toEqual(expect.any(Object));

    expect(transformUserToPreview).toHaveBeenCalledWith(prismaUser);

    expect(result).toEqual(transformed);
  });

  it('returns NOT_FOUND when user does not exist', async () => {
    vi.mocked(prisma.users.findFirst).mockResolvedValue(null);
    const result = await getUserByUsernameService('ghost');
    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.users.findFirst).mockRejectedValue(new Error('db exploded'));

    const result = await getUserByUsernameService('boom');

    expect(result).toBe('INTERNAL_ERROR');
  });
});
