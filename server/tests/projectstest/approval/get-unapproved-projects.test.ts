import type { ProjectStatus, Visibility } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { getUnapprovedProjectsService } from '#services/projects/approval/get-unapproved-projects.ts';
import { transformProjectToDetail } from '#services/transformers/projects/project-detail.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */

vi.mock('#config/prisma.ts', () => ({
  default: {
    projectsAwaitingApproval: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/projects/project-detail.ts', () => ({
  transformProjectToDetail: vi.fn(),
}));

const now = new Date();

const prismaProjects = [
  {
    userId: 1,
    title: 'Test Project',
    createdAt: now,
    updatedAt: now,
    projectId: 1,
    hook: 'hook',
    description: 'This is a test project.',
    thumbnailId: null,
    context: null,
    status: 'Planning' as ProjectStatus,
    audience: 'people',
    globalVisibility: 'public' as Visibility,
    approved: true,
  },
  {
    userId: 2,
    title: 'Test Project 2',
    createdAt: now,
    updatedAt: now,
    projectId: 1,
    hook: 'hook',
    description: 'This is a test project 2.',
    thumbnailId: null,
    context: null,
    status: 'Planning' as ProjectStatus,
    audience: 'people',
    globalVisibility: 'public' as Visibility,
    approved: true,
  },
];

const transformed = [
  {
    userId: 1,
    title: 'Test Project',
  } as any,
  {
    userId: 2,
    title: 'Test Project 2',
  } as any,
];

describe('getUnapprovedProjectsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the projects when found', async () => {
    vi.mocked(prisma.projectsAwaitingApproval.findMany).mockResolvedValue(
      prismaProjects.map((project) => ({ project })) as any,
    );
    vi.mocked(transformProjectToDetail).mockImplementation(
      (project) =>
        ({
          userId: project.userId,
          title: project.title,
        }) as any,
    );

    const result = await getUnapprovedProjectsService();

    expect(result).toStrictEqual(transformed);
  });

  it('returns an empty array when no projects are found', async () => {
    vi.mocked(prisma.projectsAwaitingApproval.findMany).mockResolvedValue([]);

    const result = await getUnapprovedProjectsService();

    expect(result).toStrictEqual([]);
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.projectsAwaitingApproval.findMany).mockRejectedValue(new Error('db cursed'));

    const result = await getUnapprovedProjectsService();

    expect(result).toBe('INTERNAL_ERROR');
  });
});
