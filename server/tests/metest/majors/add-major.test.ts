import type { MyMajor, Major } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import addUserMajorService from '#services/me/majors/add-major.ts';
import { transformMyMajor } from '#services/transformers/me/parts/my-major.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    users: {
      update: vi.fn(),
    },
    majors: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/me/parts/my-major.ts', () => ({
  transformMyMajor: vi.fn(),
}));

const prismaUpdatedUser = {
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

describe('addUserMajorService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns transformed my major obj after major is successfully added', async () => {
    vi.mocked(prisma.users.update).mockResolvedValue({
      ...prismaUpdatedUser,
      majors: [major],
    } as any);
    vi.mocked(transformMyMajor).mockReturnValue(transformed);

    const result = await addUserMajorService({
      majorId: 1,
      userId: 1,
    });

    expect(result).toEqual([transformed]);
  });

  it('returns NOT_FOUND when major is not found', async () => {
    vi.mocked(prisma.users.update).mockRejectedValue({ code: 'P2025' } as any);

    const result = await addUserMajorService({
      majorId: 1,
      userId: 1,
    });

    expect(result).toBe('NOT_FOUND');
  });

  it('returns CONFLICT when major is already added', async () => {
    vi.mocked(prisma.users.update).mockRejectedValue({ code: 'P2002' } as any);

    const result = await addUserMajorService({
      majorId: 1,
      userId: 1,
    });

    expect(result).toBe('CONFLICT');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.users.update).mockRejectedValue(new Error('db cursed'));

    const result = await addUserMajorService({
      majorId: 1,
      userId: 1,
    });

    expect(result).toBe('INTERNAL_ERROR');
  });
});
