import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { deleteMajorService } from '#services/me/majors/delete-major.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    users: {
      update: vi.fn(),
    },
  },
}));

const prismaMajors = [
  {
    majorId: 1,
    label: '',
  },
];

describe('deleteMajorService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns NOT_FOUND if major does not exist', async () => {
    vi.mocked(prisma.users.update).mockRejectedValue({ code: 'P2025' } as any);

    const result = await deleteMajorService(1, 1);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns NO_CONTENT after major deleted successfully', async () => {
    vi.mocked(prisma.users.update).mockResolvedValue(prismaMajors as any);

    const result = await deleteMajorService(1, 1);

    expect(result).toBe('NO_CONTENT');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.users.update).mockRejectedValue(new Error('db cursed'));

    const result = await deleteMajorService(1, 1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
