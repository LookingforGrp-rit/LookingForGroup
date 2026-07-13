import type { MePrivate } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
//import { PrismaClientKnownRequestError } from '#prisma-models/runtime/library.js';
import type { Users } from '#prisma-models/index.js';
import { transformMeToPrivate } from '#services/transformers/me/me-private.ts';
import createUserService from '#services/users/create-user.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    users: {
      create: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/me/me-private.ts', () => ({
  transformMeToPrivate: vi.fn(),
}));

describe('createUserService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a user and returns transformed MePrivate', async () => {
    const prismaUser: Users = {
      userId: 1,
      googleId: 'u123',
      username: 'goldleaf',
      firstName: 'Gold',
      lastName: 'Leaf',
      preferredName: 'Gold',
      ritEmail: 'goldleaf@rit.edu',
      profileImage: null,
      displayPhone: false,
      headline: '',
      pronouns: '',
      title: '',
      ritStatus: null,
      mentor: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      location: '',
      bio: '',
      privacy: 'public',
      phoneNumber: null,
      accessLevel: 'User',
    };

    const mePrivate: MePrivate = {
      userId: 1,
      username: 'goldleaf',
      firstName: 'Gold',
      lastName: 'Leaf',
      preferredName: 'Gold',
      ritEmail: 'goldleaf@rit.edu',
      googleId: '1234',
      privacy: 'public',
      phoneNumber: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      headline: '',
      pronouns: '',
      title: '',
      majors: [],
      ritStatus: 'FirstYear',
      location: '',
      bio: '',
      mentor: false,
      projects: [],
      skills: [],
      socials: [],
      following: {
        usersFollowing: {
          users: [],
          count: 0,
          apiUrl: '',
        },
        projectsFollowing: {
          projects: [],
          count: 0,
          apiUrl: '',
        },
      },
      followers: {
        users: [],
        count: 0,
        apiUrl: '',
      },
      profileImage: null,
      designer: false,
      developer: false,
      displayPhone: false,
      apiUrl: '',
    };

    vi.mocked(prisma.users.create).mockResolvedValue(prismaUser);
    vi.mocked(transformMeToPrivate).mockReturnValue(mePrivate);

    const result = await createUserService(
      {
        username: 'goldleaf',
        firstName: 'Gold',
        lastName: 'Leaf',
        preferredName: 'Gold',
        ritEmail: 'goldleaf@rit.edu',
        googleId: '1234',
      },
      {},
    );

    expect(vi.mocked(prisma.users.create)).toHaveBeenCalledWith({
      data: {
        googleId: '1234',
        username: 'goldleaf',
        firstName: 'Gold',
        lastName: 'Leaf',
        preferredName: 'Gold',
        ritEmail: 'goldleaf@rit.edu',
      },
      select: expect.any(Object),
    });

    expect(transformMeToPrivate).toHaveBeenCalledWith(prismaUser);
    expect(result).toEqual(mePrivate);
  });
});
