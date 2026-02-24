import type { ProjectFollowsList } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import type { Projects } from '#prisma-models/index.js';
import { transformProjectToPreview } from '#services/transformers/projects/project-preview.ts';
import { getProjectFollowingService } from '#services/users/followings/get-proj-following.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    projectFollowings: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/projects/project-preview.ts', () => ({
  transformProjectToPreview: vi.fn(),
}));

describe('getProjectFollowingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns followed projects for a user', async () => {
    const project: Projects = {
      projectId: 99,
      title: 'sky forge',
      hook: 'forge a sky',
      description: 'desc',
      thumbnailId: null,
      purpose: null,
      status: 'Planning',
      audience: '',
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const prismaResult = [
      {
        followedAt: new Date('2025-03-01'),
        projects: project,
      },
    ];

    const transformed = {
      projectId: 99,
      title: 'sky forge',
      hook: 'forge a sky',
      owner: {
        userId: 1,
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        profileImage: null,
        mentor: false,
        verified: false,
        designer: false,
        developer: false,
        headline: '',
        pronouns: '',
        title: '',
        funFact: '',
        location: '',
        majors: [],
        apiUrl: '/api/users/1',
      },
      thumbnail: null,
      thumbnailId: 0,
      status: 'Planning',
      audience: '',
      mediums: [],
      apiUrl: '/api/projects/99',
    };

    vi.mocked(prisma.projectFollowings.findMany).mockResolvedValue(prismaResult as any);
    vi.mocked(transformProjectToPreview).mockReturnValue(transformed as any);

    const result = await getProjectFollowingService(42);

    // Inspect the actual Prisma call instead of deep-matching it
    const calls = vi.mocked(prisma.projectFollowings.findMany).mock.calls;
    expect(calls.length).toBe(1);

    const [args] = calls[0];

    expect(args?.where).toEqual({ userId: 42 });
    expect(args?.orderBy).toEqual({ followedAt: 'desc' });

    expect(args?.select).toEqual(
      expect.objectContaining({
        followedAt: true,
        projects: expect.objectContaining({
          select: expect.any(Object),
        }),
      }),
    );

    const expected: ProjectFollowsList = {
      count: 1,
      projects: [
        {
          followedAt: prismaResult[0].followedAt,
          project: transformed,
        },
      ],
      apiUrl: '/api/users/42/followings/projects',
    };

    expect(result).toEqual(expected);
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.projectFollowings.findMany).mockRejectedValue(new Error('db broke'));
    const result = await getProjectFollowingService(42);
    expect(result).toBe('INTERNAL_ERROR');
  });
});
