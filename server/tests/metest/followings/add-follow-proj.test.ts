import type {
  MyProjectFollowing,
  ProjectMedium,
  ProjectPreview,
  ProjectTag,
  UserPreview,
} from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { addProjectFollowingService } from '#services/me/followings/add-follow-proj.ts';
import { transformProjectToPreview } from '#services/transformers/projects/project-preview.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    projects: {
      findUnique: vi.fn(),
    },
    projectFollowings: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/projects/project-preview.ts', () => ({
  transformProjectToPreview: vi.fn(),
}));

const prismaProject = {
  projectId: 1,
};

const transformedProjectPreview: ProjectPreview = {
  apiUrl: 'api/projects/1',
  hook: '',
  mediums: [
    {
      apiUrl: 'api/projects/mediums/1',
      label: '',
      mediumId: 1,
    },
  ] as ProjectMedium[],
  owner: {
    apiUrl: 'api/users/1',
    userId: 1,
  } as UserPreview,
  projectId: 1,
  tags: [
    {
      label: '',
      tagId: 1,
      type: 'Creative',
      apiUrl: 'api/projects/tags/1',
      displayOrder: 0,
    },
  ] as ProjectTag[],
  thumbnail: null,
  thumbnailId: 0,
  title: '',
};

const prismaProjectFollowing: MyProjectFollowing = {
  apiUrl: 'api/me/followings/projects/1',
  followedAt: new Date(),
  project: transformedProjectPreview,
};

describe('addProjectFollowingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns NOT_FOUND when project is not found', async () => {
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(null);

    const result = await addProjectFollowingService(1, 1);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns CONFLICT when project is already followed', async () => {
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(prismaProject as any);
    vi.mocked(prisma.projectFollowings.findUnique).mockResolvedValue(prismaProject as any);

    const result = await addProjectFollowingService(1, 1);

    expect(result).toBe('CONFLICT');
  });

  it('returns MyProjectFollowing obj after successfully followed', async () => {
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(prismaProject as any);
    vi.mocked(prisma.projectFollowings.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.projectFollowings.create).mockResolvedValue(prismaProjectFollowing as any);
    vi.mocked(transformProjectToPreview).mockReturnValue(transformedProjectPreview);

    const result = await addProjectFollowingService(1, 1);

    // console.log(result);

    expect(result).toStrictEqual(prismaProjectFollowing);
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.projects.findUnique).mockRejectedValue(new Error('db cursed'));

    const result = await addProjectFollowingService(1, 1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
