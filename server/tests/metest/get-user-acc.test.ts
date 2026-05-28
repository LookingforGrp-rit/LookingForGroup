import type { Visibility, MePrivate, AcademicYear } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { getUserAccountService } from '#services/me/get-user-acc.ts';
import { transformMeToPrivate } from '#services/transformers/me/me-private.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    users: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
    },
    majors: {
      findMany: vi.fn(),
    },
    projectImages: {
      findMany: vi.fn(),
    },
    mediums: {
      findMany: vi.fn(),
    },
    projects: {
      findMany: vi.fn(),
    },
    roles: {
      findMany: vi.fn(),
    },
    members: {
      findMany: vi.fn(),
    },
    skills: {
      findMany: vi.fn(),
    },
    userSkills: {
      findMany: vi.fn(),
    },
    socials: {
      findMany: vi.fn(),
    },
    userSocials: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/me/me-private.ts', () => ({
  transformMeToPrivate: vi.fn(),
}));

describe('getUserByIdService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.majors.findMany).mockResolvedValue([]);
    vi.mocked(prisma.projectImages.findMany).mockResolvedValue([]);
    vi.mocked(prisma.mediums.findMany).mockResolvedValue([]);
    vi.mocked(prisma.projects.findMany).mockResolvedValue([]);
    vi.mocked(prisma.roles.findMany).mockResolvedValue([]);
    vi.mocked(prisma.members.findMany).mockResolvedValue([]);
    vi.mocked(prisma.skills.findMany).mockResolvedValue([]);
    vi.mocked(prisma.userSkills.findMany).mockResolvedValue([]);
    vi.mocked(prisma.socials.findMany).mockResolvedValue([]);
    vi.mocked(prisma.userSocials.findMany).mockResolvedValue([]);
  });

  it('returns transformed me to private when found', async () => {
    const prismaUser = {
      userId: 1,
      username: 'goldleaf',
      ritEmail: 'gold@rit.edu',
    };

    const transformed: MePrivate = {
      userId: 1,
      username: 'goldleaf',
      apiUrl: '/api/users/1',
      ritEmail: 'gold@rit.edu',
      firstName: '',
      lastName: '',
      visibility: 'Public' as Visibility,
      phoneNumber: null,
      googleId: '2222222222',
      createdAt: new Date('2026-05-20 13:25:14'),
      updatedAt: new Date('2026-05-20 13:25:14'),
      academicYear: 'Sophomore' as AcademicYear,
      bio: '',
      projects: [],
      skills: [],
      socials: [],
      following: {
        projectsFollowing: {
          apiUrl: '',
          count: 0,
          projects: [],
        },
        usersFollowing: {
          apiUrl: '',
          count: 0,
          users: [],
        },
      },
      followers: {
        apiUrl: '',
        count: 0,
        users: [],
      },
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

    vi.mocked(prisma.users.findUnique).mockResolvedValue(prismaUser as any);
    vi.mocked(transformMeToPrivate).mockReturnValue(transformed);

    const result = await getUserAccountService(1);

    // console.log(result);

    const calls = vi.mocked(prisma.users.findUnique).mock.calls;
    const [args] = calls[0];

    expect(args.where).toEqual({ userId: 1 });
    expect(args.select).toEqual(expect.any(Object));

    expect(transformMeToPrivate).toHaveBeenCalledWith(prismaUser);

    expect(result).toEqual(transformed);
  });

  it('returns NOT_FOUND when user does not exist', async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(null);
    const result = await getUserAccountService(999);
    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.users.findUnique).mockRejectedValue(new Error('db cursed'));

    const result = await getUserAccountService(1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
