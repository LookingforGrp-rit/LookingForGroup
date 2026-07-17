import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import prisma from '#config/prisma.ts';
import type { Projects } from '#prisma-models/index.js';
import getPaginatedProjectsService from '#services/projects/get-paginated-projects.ts';
import { transformProjectToPreview } from '#services/transformers/projects/project-preview.ts';

/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#services/transformers/projects/project-preview.ts', () => ({
  transformProjectToPreview: vi.fn(),
}));

vi.mock('#config/prisma.ts', () => ({
  default: {
    projects: {
      findMany: vi.fn(),
    },
  },
}));

const now = new Date();

const prismaProjects: Projects[] = [
  {
    audience: '',
    createdAt: now,
    description: '',
    hook: '',
    projectId: 100,
    context: 'Academic',
    status: 'Planning',
    thumbnailId: 0,
    title: 'Beta test',
    updatedAt: now,
    globalVisibility: 'public',
    userId: 1,
    approved: true,
  },
  {
    audience: '',
    createdAt: now,
    description: '',
    hook: '',
    projectId: 200,
    context: 'Academic',
    status: 'Planning',
    globalVisibility: 'public',
    thumbnailId: 0,
    title: 'Alpha test',
    updatedAt: now,
    userId: 2,
    approved: true,
  },
];

const mockPreviews = [
  {
    projectId: 100,
    ownerId: 1,
    title: 'Beta test',
  },
  {
    projectId: 200,
    ownerId: 2,
    title: 'Alpha test',
  },
];

type FindManyQuery = {
  cursor?: {
    projectId: number;
  };
  skip?: number;
};

describe('getPaginatedProjectsService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (transformProjectToPreview as Mock).mockImplementation((u: Projects) => ({
      projectId: u.projectId,
      ownerId: u.userId,
      title: u.title,
    }));
  });

  it('Returns first 2 projects', async () => {
    (prisma.projects.findMany as Mock).mockResolvedValue(prismaProjects);

    const result = await getPaginatedProjectsService(2, 0, 'Newest');

    expect(prisma.projects.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 2,
        orderBy: {
          createdAt: 'desc' as const,
        },
        where: {
          approved: true,
        },
      }),
    );
    const [[query]] = (prisma.projects.findMany as Mock).mock.calls as [[FindManyQuery]];
    expect(query).not.toHaveProperty('cursor');
    expect(query).not.toHaveProperty('skip');
    expect(transformProjectToPreview).toHaveBeenCalledTimes(2);
    expect(result).toEqual(mockPreviews);
  });

  it('Uses cursor pagination when lastProjectId is provided', async () => {
    (prisma.projects.findMany as Mock).mockResolvedValue(prismaProjects);

    await getPaginatedProjectsService(2, 100, 'Newest');

    expect(prisma.projects.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 2,
        skip: 1,
        cursor: {
          projectId: 100,
        },
        orderBy: {
          createdAt: 'desc' as const,
        },
        where: {
          approved: true,
        },
      }),
    );
  });

  it('Returns fewer projects than requested when fewer are available', async () => {
    (prisma.projects.findMany as Mock).mockResolvedValue([prismaProjects[0]]);

    const result = await getPaginatedProjectsService(10, 0, 'Newest');

    expect(transformProjectToPreview).toHaveBeenCalledTimes(1);
    expect(result).toEqual([
      {
        projectId: 100,
        ownerId: 1,
        title: 'Beta test',
      },
    ]);
  });

  it('Returns INTERNAL_ERROR when Prisma throws', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    (prisma.projects.findMany as Mock).mockRejectedValue(new Error('db on fire'));

    const result = await getPaginatedProjectsService(2, 0, 'Newest');

    expect(result).toBe('INTERNAL_ERROR');
    expect(transformProjectToPreview).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
