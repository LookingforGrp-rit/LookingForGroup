import type { UserDetail } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { transformUserToDetail } from '#services/transformers/users/user-detail.ts';
import { getUserByIdService } from '#services/users/get-user/get-by-id.ts';
// import { getUserById } from '#controllers/users/get-user/get-by-id.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    users: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/users/user-detail.ts', () => ({
  transformUserToDetail: vi.fn(),
}));

describe('getUserByIdService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns transformed user when found', async () => {
    const prismaUser = {
      userId: 7,
      username: 'a',
    };

    const transformed: UserDetail = {
      userId: 7,
      username: 'a',
      apiUrl: '/api/users/7',
    } as UserDetail;

    vi.mocked(prisma.users.findUnique).mockResolvedValue(prismaUser as any);
    vi.mocked(transformUserToDetail).mockReturnValue(transformed);

    const result = await getUserByIdService(7);

    const calls = vi.mocked(prisma.users.findUnique).mock.calls;
    const [args] = calls[0];

    expect(args?.where).toEqual({ userId: 7 });
    expect(args?.select).toEqual(expect.any(Object));

    expect(transformUserToDetail).toHaveBeenCalledWith(prismaUser);

    expect(result).toEqual(transformed);
  });

  it('returns NOT_FOUND when user does not exist', async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(null);
    const result = await getUserByIdService(999);
    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.users.findUnique).mockRejectedValue(new Error('db cursed'));

    const result = await getUserByIdService(1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
