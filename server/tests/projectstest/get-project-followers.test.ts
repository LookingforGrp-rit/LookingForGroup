import type {
  ProjectPurpose,
  ProjectStatus,
  UserPreview,
  ProjectFollowers,
} from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import type { Projects } from '#prisma-models/index.js';
import getProjectFollowersService from '#services/projects/get-project-followers.ts';
import { transformProjectToFollowers } from '#services/transformers/projects/parts/project-followers.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */

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

const prismaProject: Projects = {
  audience: '',
  createdAt: now,
  description: '',
  hook: '',
  projectId: 100,
  purpose: 'Academic' as ProjectPurpose,
  status: 'Planning' as ProjectStatus,
  thumbnailId: 0,
  title: 'test 1',
  updatedAt: now,
  userId: 1,
};

const testFollowers: ProjectFollowers = {
  count: 2,
  users: [
    {
      user: { userId: 3 } as UserPreview,
      followedAt: now,
    },
    {
      user: { userId: 4 } as UserPreview,
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
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(prismaProject);
    vi.mocked(transformProjectToFollowers).mockReturnValue(testFollowers);
    const result = await getProjectFollowersService(1);

    expect(transformProjectToFollowers).toBeCalledWith(prismaProject);
    expect(result).toBe(testFollowers);
  });
  it("Return NOT_FOUND if project doesn't exist", async () => {
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(null);
    vi.mocked(transformProjectToFollowers).mockReturnValue(testFollowers);
    const result = await getProjectFollowersService(1);

    expect(result).toBe('NOT_FOUND');
  });
});
