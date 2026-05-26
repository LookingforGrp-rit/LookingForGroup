import type { ProjectWithFollowers } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import getProjectByIdService from '#services/projects/get-proj-id.ts';
import { transformProjectToWithFollowers } from '#services/transformers/projects/project-with-followers.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    projects: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/projects/project-with-followers.ts', () => ({
  transformProjectToWithFollowers: vi.fn(),
}));

describe('getProjectByIdService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns transformed project when found', async () => {
    const prismaProject = {
      projectId: 23,
    };

    const transformed: ProjectWithFollowers = {
      projectId: 23,
      apiUrl: '/api/projectid/23',
    } as ProjectWithFollowers;

    vi.mocked(prisma.projects.findUnique).mockResolvedValue(prismaProject as any);
    vi.mocked(transformProjectToWithFollowers).mockReturnValue(transformed);

    const result = await getProjectByIdService(23);

    const calls = vi.mocked(prisma.projects.findUnique).mock.calls;
    const [args] = calls[0];

    expect(args?.where).toEqual({ projectId: 23 });
    expect(args?.select).toEqual(expect.any(Object));

    expect(transformProjectToWithFollowers).toHaveBeenCalledWith(prismaProject);

    expect(result).toEqual(transformed);
  });
  it('returns NOT_FOUND when user does not exist', async () => {
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(null);
    const result = await getProjectByIdService(999);
    expect(result).toBe('NOT_FOUND');
  });
  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.projects.findUnique).mockRejectedValue(new Error('db cursed'));

    const result = await getProjectByIdService(1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
