import type { MyMajor, Major } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import getUserMajorsService from '#services/me/majors/get-majors.ts';
import { transformMyMajor } from '#services/transformers/me/parts/my-major.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    users: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/me/parts/my-major.ts', () => ({
  transformMyMajor: vi.fn(),
}));

const prismaUser = {
  userId: 1,
  username: '',
  ritEmail: '',
  firstName: '',
  lastName: '',
  profileImage: null,
  headline: '',
  pronouns: '',
  title: '',
  academicYear: null,
  location: '',
  funFact: '',
  bio: '',
  visibility: 1,
  mentor: false,
  createdAt: new Date(),
  updatedAt: new Date(),
  phoneNumber: null,
  universityId: '',
};

const major: Major = {
  majorId: 1,
  label: '',
};

const transformed: MyMajor = {
  apiUrl: 'api/me/majors/1',
  ...major,
};

describe('getUserMajorsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns NOT_FOUND if no majors found', async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue(null);

    const result = await getUserMajorsService(1);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns transformed my major obj', async () => {
    vi.mocked(prisma.users.findUnique).mockResolvedValue({
      ...prismaUser,
      majors: [major],
    } as any);
    vi.mocked(transformMyMajor).mockReturnValue(transformed);

    const result = await getUserMajorsService(1);

    expect(result).toEqual([transformed]);
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.users.findUnique).mockRejectedValue(new Error('db cursed'));

    const result = await getUserMajorsService(1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
