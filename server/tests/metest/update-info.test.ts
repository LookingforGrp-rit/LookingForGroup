import type {
  AcademicYear,
  MePrivate,
  MyFollowing,
  MyFollowsList,
  MyMajor,
  MyMember,
  MyProjectFollowsList,
  MySkill,
  MySocial,
  UserFollowsList,
  Visibility,
} from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { deleteImageService } from '#services/images/delete-image.ts';
import { updateUserInfoService } from '#services/me/update-info.ts';
import { transformMeToPrivate } from '#services/transformers/me/me-private.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    users: {
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
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

vi.mock('#services/images/delete-image.ts', () => ({
  deleteImageService: vi.fn(),
}));

vi.mock('#services/transformers/me/me-private.ts', () => ({
  transformMeToPrivate: vi.fn(),
}));

describe('updateUserInfoService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns NOT_FOUND when current user does not exist', async () => {
    vi.mocked(prisma.users.findFirst).mockResolvedValue(null);

    const result = await updateUserInfoService(1, {});

    expect(result).toBe('NOT_FOUND');
  });

  it('returns transformed me to private on successful update', async () => {
    const prismaUser = {
      profileImage: 'old.png',
    };

    const transformed: MePrivate = {
      academicYear: '' as AcademicYear,
      apiUrl: 'api/me',
      bio: '',
      createdAt: new Date(),
      designer: false,
      developer: true,
      firstName: 'Eric',
      followers: {
        users: [],
        count: 0,
        apiUrl: '',
      } as UserFollowsList,
      following: {
        usersFollowing: {
          users: [] as MyFollowing[],
          count: 0,
          apiUrl: '',
        } as MyFollowsList,
        projectsFollowing: {
          projects: [],
          count: 0,
          apiUrl: '',
        } as MyProjectFollowsList,
      },
      funFact: '',
      headline: '',
      lastName: '',
      location: '',
      majors: [] as MyMajor[],
      mentor: false,
      phoneNumber: '',
      profileImage: 'old.png',
      projects: [] as MyMember[],
      pronouns: '',
      ritEmail: '',
      skills: [] as MySkill[],
      socials: [] as MySocial[],
      title: '',
      universityId: '',
      updatedAt: new Date(),
      userId: 1,
      username: '',
      visibility: 'Public' as Visibility,
    };

    vi.mocked(prisma.users.findFirst).mockResolvedValue(prismaUser as any);
    vi.mocked(prisma.users.update).mockResolvedValue(prismaUser as any);
    vi.mocked(deleteImageService).mockResolvedValue(undefined); // assume delete image service does not fail
    vi.mocked(transformMeToPrivate).mockReturnValue(transformed);

    const result = await updateUserInfoService(1, { profileImage: 'new.png', firstName: 'Eric' });
    //!!add other expects
    expect(result).toEqual(transformed);
  });

  it('returns INTERNAL_ERROR on exception', async () => {
    vi.mocked(prisma.users.findFirst).mockRejectedValue(new Error('db exploded :fire:'));

    const result = await updateUserInfoService(1, {});

    expect(result).toBe('INTERNAL_ERROR');
  });
});
