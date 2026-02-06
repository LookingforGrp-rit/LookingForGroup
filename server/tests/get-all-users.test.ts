import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import prisma from '#config/prisma.ts';
import { transformUserToPreview } from '#services/transformers/users/user-preview.ts';
import { getAllUsersService } from '#services/users/get-all-users.ts';

/* eslint-disable @typescript-eslint/unbound-method */

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
  {
    userId: 1,
    username: 'alice',
    ritEmail: 'alice@rit.edu',
    firstName: 'Alice',
    lastName: 'Wonderland',
    profileImage: null,
    headline: '',
    pronouns: '',
    title: '',
    academicYear: null,
    mentor: false,
    developer: false,
    designer: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    universityId: '1',
  },
  {
    userId: 2,
    username: 'bob',
    ritEmail: 'bob@rit.edu',
    firstName: 'Bob',
    lastName: 'Bobson',
    profileImage: null,
    headline: '',
    pronouns: '',
    title: '',
    academicYear: null,
    mentor: false,
    developer: false,
    designer: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    universityId: '1',
  },
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
    //console.log(result);
    expect(vi.mocked(prisma.users.findMany)).toHaveBeenCalled();
    expect(result).toEqual(mockPreviews);
  });

  it('applies mentor filter', async () => {
    (prisma.users.findMany as Mock).mockResolvedValue(mockUsers);

    await getAllUsersService({
      mentor: true,
      strictness: 'all',
    });

    // console.log(result);
    const findMany = prisma.users.findMany;
    expect(findMany).toBeCalled();
    expect(findMany).toBeCalledWith(
      expect.objectContaining({
        where: {
          AND: [{ mentor: true }],
        },
      }),
    );
  });

  it('applies designer filter', async () => {
    (prisma.users.findMany as Mock).mockResolvedValue(mockUsers);

    await getAllUsersService({
      designer: true,
      strictness: 'all',
    });

    const findMany = prisma.users.findMany;
    expect(findMany).toBeCalled();

    expect(findMany).toBeCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            {
              userSkills: {
                some: {
                  skills: { type: 'Designer' },
                },
              },
            },
          ],
        },
      }),
    );
  });

  it('applies designer=false filter', async () => {
    (prisma.users.findMany as Mock).mockResolvedValue(mockUsers);

    await getAllUsersService({
      developer: false,
      strictness: 'all',
    });

    expect(prisma.users.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            {
              userSkills: {
                none: {
                  skills: { type: 'Developer' },
                },
              },
            },
          ],
        },
      }),
    );
  });

  it('applies skills + majors + socials filters', async () => {
    (prisma.users.findMany as Mock).mockResolvedValue(mockUsers);

    await getAllUsersService({
      skills: [1, 2],
      majors: [3],
      socials: [4],
      strictness: 'all',
    });

    expect(prisma.users.findMany).toHaveBeenCalled();
    expect(prisma.users.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          AND: [
            {
              userSkills: {
                every: {
                  skillId: { in: [1, 2] },
                },
              },
            },
            {
              majors: {
                every: {
                  majorId: { in: [3] },
                },
              },
            },
            {
              userSocials: {
                every: {
                  websiteId: { in: [4] },
                },
              },
            },
          ],
        },
      }),
    );
  });

  it('uses OR when strictness = any', async () => {
    (prisma.users.findMany as Mock).mockResolvedValue(mockUsers);

    await getAllUsersService({
      mentor: true,
      developer: true,
      strictness: 'any',
    });

    expect(prisma.users.findMany).toHaveBeenCalled();
    expect(prisma.users.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            { mentor: true },
            {
              userSkills: {
                some: {
                  skills: { type: 'Developer' },
                },
              },
            },
          ],
        },
      }),
    );
  });

  it('returns INTERNAL_ERROR on exception', async () => {
    (prisma.users.findMany as Mock).mockRejectedValue(new Error('db exploded :fire:'));

    const result = await getAllUsersService({ strictness: 'any' });

    expect(result).toBe('INTERNAL_ERROR');
  });

  it('transforms users before returning', async () => {
    (prisma.users.findMany as Mock).mockResolvedValue(mockUsers);

    const result = await getAllUsersService({ strictness: 'any' });

    expect(transformUserToPreview).toHaveBeenCalledTimes(2);
    expect(result).toEqual(mockPreviews);
  });
});
