import type { ProjectFollowsList } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
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
    const followedAt = new Date('2025-03-01');

    const prismaResult = [
      {
        followedAt,
        projects: {
          projectId: 99,
          title: 'sky forge',
        },
      },
    ];

    const transformed = {
      projectId: 99,
      title: 'sky forge',
      apiUrl: '/api/projects/99',
      hook: 'test-hook',
      thumbnailId: 1,
      owner: {
        userId: 1,
        username: 'test-owner',
        pfp: 'test-pfp',
        pfpId: 1,
        firstName: 'Test',
        lastName: 'Owner',
        profileImage: 'test-pfp',
        mentor: false,
        designer: false,
        developer: false,
        headline: 'Test headline',
        pronouns: 'they/them',
        timezone: 'UTC',
        bio: 'Test bio',
        apiUrl: '/api/users/1',
        title: 'Test Title',
        funFact: 'Test fun fact',
        location: 'Test Location',
        majors: [],
      },
      thumbnail: {
        id: 1,
        url: 'test-thumbnail',
        imageId: 1,
        image: 'test-image',
        altText: 'test alt text',
        apiUrl: '/api/images/1',
      },
      mediums: [],
    };

    vi.mocked(prisma.projectFollowings.findMany).mockResolvedValue(prismaResult as any);
    vi.mocked(transformProjectToPreview).mockReturnValue(transformed as any);

    const result = await getProjectFollowingService(42);

    const calls = vi.mocked(prisma.projectFollowings.findMany).mock.calls;
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

    expect(transformProjectToPreview).toHaveBeenCalledWith(prismaResult[0].projects);

    const expected: ProjectFollowsList = {
      count: 1,
      projects: [
        {
          followedAt,
          project: transformed,
        },
      ],
      apiUrl: '/api/users/42/followings/projects',
    };

    expect(result).toEqual(expected);
  });

  it('returns NOT_FOUND when no projects exist', async () => {
    vi.mocked(prisma.projectFollowings.findMany).mockResolvedValue([]);

    const result = await getProjectFollowingService(7);

    expect(result).toEqual({
      count: 0,
      projects: [],
      apiUrl: '/api/users/7/followings/projects',
    });
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.projectFollowings.findMany).mockRejectedValue(new Error('database exploded'));

    const result = await getProjectFollowingService(42);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
