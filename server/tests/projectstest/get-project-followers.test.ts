import type { ProjectFollowers, UserPreview } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import getProjectFollowersService from '#services/projects/get-project-followers.ts';
import { transformProjectToFollowers } from '#services/transformers/projects/parts/project-followers.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */

vi.mock('#services/transformers/projects/parts/project-followers.ts', () => ({
  transformProjectToFollowers: vi.fn(),
}));

vi.mock('#config/prisma.ts', () => ({
  default: {
    projects: {
      findUnique: vi.fn(),
    },
  },
}));

const now = new Date();

const prismaProject = {
  projectId: 100,
  _count: {
    projectFollowings: 2,
  },
  projectFollowings: [
    {
      users: { userId: 3, firstName: 'Alice', lastName: 'User' },
      followedAt: now,
    },
    {
      users: { userId: 4, firstName: 'Bob', lastName: 'User' },
      followedAt: now,
    },
  ],
};

const testFollowers: ProjectFollowers = {
  count: 2,
  users: [
    {
      user: { userId: 3, firstName: 'Alice', lastName: 'User' } as UserPreview,
      followedAt: now,
    },
    {
      user: { userId: 4, firstName: 'Bob', lastName: 'User' } as UserPreview,
      followedAt: now,
    },
  ],
  apiUrl: 'api/project/100/followers',
};

describe('getProjectFollowersService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('Get all followers of a project', async () => {
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(prismaProject as any);
    vi.mocked(transformProjectToFollowers).mockReturnValue(testFollowers);
    const result = await getProjectFollowersService(1);

    expect(transformProjectToFollowers).toHaveBeenCalledWith(prismaProject);
    expect(result).toBe(testFollowers);
  });
  it("Return NOT_FOUND if project doesn't exist", async () => {
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(null);
    vi.mocked(transformProjectToFollowers).mockReturnValue(testFollowers);
    const result = await getProjectFollowersService(1);

    expect(result).toBe('NOT_FOUND');
  });
});
