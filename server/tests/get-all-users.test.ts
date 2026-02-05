import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import prisma from '#config/prisma.ts';
import { transformUserToPreview } from '#services/transformers/users/user-preview.ts';
import { getAllUsersService } from '#services/users/get-all-users.ts';

// mocking
vi.mock('#config/prisma.ts', () => ({
  default: {
    users: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/users/user-preview.ts', () => ({
  transformUserToPreview: vi.fn(),
}));

const mockUsers = [
  { userId: 1, firstName: 'Alice', lastName: 'Wonderland' },
  { userId: 2, firstName: 'Bob', lastName: 'Bobson' },
];

const mockPreviews = [
  { userId: 1, firstName: 'Alice', lastName: 'Wonderland' },
  { userId: 2, firstName: 'Bob', lastName: 'Bobson' },
];

describe('test getAllUsersService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (transformUserToPreview as Mock).mockImplementation(
      (u: { userId: number; firstName: string; lastName: string }) => ({
        userId: u.userId,
        firstName: u.firstName,
        lastName: u.lastName,
      }),
    );
  });

  it('returns all users when no filters are provided', async () => {
    (prisma.users.findMany as Mock).mockResolvedValue(mockUsers);

    const result = await getAllUsersService({ strictness: null });
    console.log(result);

    // expect(prisma.users.findMany).toHaveBeenCalledWith({
    //     where: {},
    //     select: expect.any(Object),
    // });
    // expect(prisma.users.findMany).toHaveBeenCalled();

    expect(result).toEqual(mockPreviews);
  });
});
