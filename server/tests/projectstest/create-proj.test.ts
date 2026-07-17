import type { ProjectDetail, UserPreview } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
//import { PrismaClientKnownRequestError } from '#prisma-models/runtime/library.js';
import type { Projects } from '#prisma-models/index.js';
import createProjectService from '#services/projects/create-proj.ts';
import { transformProjectToDetail } from '#services/transformers/projects/project-detail.ts';

/* eslint-disable @typescript-eslint/unbound-method */

/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    projects: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
    users: {
      findMany: vi.fn(),
    },
    members: {
      findMany: vi.fn(),
    },
    majors: {
      findMany: vi.fn(),
    },
    roles: {
      findMany: vi.fn(),
    },
    blocklist: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/projects/project-detail.ts', () => ({
  transformProjectToDetail: vi.fn(),
}));

describe('createProjectService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a project and returns transformed ProjectDetail', async () => {
    const now = new Date();
    const prismaProject: Projects = {
      audience: '',
      createdAt: now,
      description: '',
      hook: '',
      projectId: 1,
      purpose: 'Academic',
      status: 'Planning',
      globalVisibility: 'public',
      thumbnailId: 0,
      title: 'test 1',
      updatedAt: now,
      userId: 1,
      approved: true,
    };

    const transformed: ProjectDetail = {
      apiUrl: '/api/projects/1',
      audience: '',
      createdAt: now,
      description: '',
      hook: '',
      jobs: [],
      mediums: [],
      members: [],
      owner: { userId: 1 } as UserPreview,
      globalVisibility: 'public',
      projectId: 1,
      projectImages: [],
      projectSocials: [],
      purpose: 'Academic',
      status: 'Planning',
      tags: [],
      thumbnail: null,
      thumbnailId: 0,
      title: 'test 1',
      updatedAt: now,
      projectVideos: [],
      approved: true,
    };

    vi.mocked(prisma.projects.create).mockResolvedValue(prismaProject);
    vi.mocked(transformProjectToDetail).mockReturnValue(transformed);

    const result = await createProjectService(prismaProject, 1);

    expect(transformProjectToDetail).toHaveBeenCalledWith(prismaProject);
    expect(result).toEqual(transformed);
  });
});
