import type { Role } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import getRolesService from '#services/datasets/get-roles.ts';
import { transformRole } from '#services/transformers/datasets/role.ts';

/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    roles: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/datasets/role.ts', () => ({
  transformRole: vi.fn(),
}));

describe('getRolesService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns transformed roles when found', async () => {
    const prismaRoles = [
      { roleId: 1, label: 'Full-Stack Developer' },
      { roleId: 2, label: 'Front-End Developer' },
    ];

    vi.mocked(prisma.roles.findMany).mockResolvedValue(prismaRoles as Role[]);
    vi.mocked(transformRole).mockImplementation((role) => ({ ...role, transformed: true }));

    const result = await getRolesService();

    // console.log(result);

    expect(vi.mocked(prisma.roles.findMany)).toHaveBeenCalled();
    expect(vi.mocked(transformRole)).toHaveBeenCalledTimes(2);
    expect(result).toEqual([
      { roleId: 1, label: 'Full-Stack Developer', transformed: true },
      { roleId: 2, label: 'Front-End Developer', transformed: true },
    ]);
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.roles.findMany).mockRejectedValue(new Error('db on fire'));

    const result = await getRolesService();

    expect(result).toBe('INTERNAL_ERROR');
  });
});
