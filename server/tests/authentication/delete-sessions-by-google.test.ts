import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import deleteSessionsByGoogleService from '#services/authentication/delete-sessions-by-google.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    session: {
      deleteMany: vi.fn(),
    },
  },
}));

const prismaSessions = [
  {
    id: '',
    sid: '',
    data: {},
    gid: 'u123',
    expiresAt: new Date('2030-08-05 13:06:57.044'),
  },
  {
    id: '',
    sid: '',
    data: {},
    gid: 'u123',
    expiresAt: new Date('2030-12-05 13:06:57.044'),
  },
];

describe('deleteSessionsByGoogleService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns OK when sessions are deleted', async () => {
    vi.mocked(prisma.session.deleteMany).mockResolvedValue(prismaSessions as any);

    const result = await deleteSessionsByGoogleService('u123');

    expect(result).toBe('OK');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.session.deleteMany).mockRejectedValue(new Error('db ghosted'));

    const result = await deleteSessionsByGoogleService('u123');

    expect(result).toBe('INTERNAL_ERROR');
  });
});
