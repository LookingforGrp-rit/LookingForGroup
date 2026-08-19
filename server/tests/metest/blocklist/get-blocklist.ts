import type { Major, Skill } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { getBlocklistService } from '#services/me/blocklist/get-blocklist.ts';
import { transformBlocklistToPreview } from '#services/transformers/users/user-preview.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    blocklist: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/users/user-preview.ts', () => ({
  transformBlocklistToPreview: vi.fn(),
}));

const prismaBlocklist = [
  {
    blocked: {
      userId: 3,
      firstName: 'Eric',
      lastName: 'E',
      username: 'ece8433',
      profileImage: 'https://dummyimage.com/100x100',
      privacy: true,
      displayPhone: true,
      phoneNumber: '1234567890',
      userSkills: [
        {
          category: 'Coding Language',
          label: 'JavaScript',
          skillId: 1,
          type: 'Developer',
        },
      ] as Skill[],
      pronouns: 'he/him',
      title: 'Software Engineer',
      headline: 'Software Engineer at Looking For Group',
      location: 'Rochester, NY',
      majors: [
        {
          label: 'Game Design and Development',
          majorId: 1,
        },
      ] as Major[],
    },
  },
];

const transformedBlocklist = [
  {
    userId: 1,
    firstName: 'Eric',
    lastName: 'E',
    username: 'ece8433',
    profileImage: 'https://dummyimage.com/100x100',
    privacy: true,
    displayPhone: true,
    phoneNumber: '1234567890',
    userSkills: [
      {
        category: 'Coding Language',
        label: 'JavaScript',
        skillId: 1,
        type: 'Developer',
      },
    ] as Skill[],
    pronouns: 'he/him',
    title: 'Software Engineer',
    headline: 'Software Engineer at Looking For Group',
    location: 'Rochester, NY',
    majors: [
      {
        label: 'Game Design and Development',
        majorId: 1,
      },
    ] as Major[],
  },
];

describe('getBlocklistService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns an array of blocked users', async () => {
    vi.mocked(prisma.blocklist.findMany).mockResolvedValue(prismaBlocklist as any);
    vi.mocked(transformBlocklistToPreview).mockResolvedValue(transformedBlocklist as any);

    const result = await getBlocklistService(1);

    expect(transformBlocklistToPreview).toHaveBeenCalledTimes(prismaBlocklist.length);
    expect(result).toStrictEqual(transformedBlocklist);
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.blocklist.findMany).mockRejectedValue(new Error('db cursed'));

    const result = await getBlocklistService(1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
