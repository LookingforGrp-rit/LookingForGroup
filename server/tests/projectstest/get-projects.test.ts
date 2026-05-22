import type { ProjectPurpose, ProjectStatus } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import prisma from '#config/prisma.ts';
import type { Projects } from '#prisma-models/index.js';
import getProjectsService from '#services/projects/get-projects.ts';
import { transformProjectToPreview } from '#services/transformers/projects/project-preview.ts';

/* eslint-disable @typescript-eslint/require-await */

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
    purpose: 'Academic' as ProjectPurpose,
    status: 'Planning' as ProjectStatus,
    thumbnailId: 0,
    title: 'test 1',
    updatedAt: now,
    userId: 1,
  },
  {
    audience: '',
    createdAt: now,
    description: '',
    hook: '',
    projectId: 200,
    purpose: 'Academic' as ProjectPurpose,
    status: 'Planning' as ProjectStatus,
    thumbnailId: 0,
    title: 'test 2',
    updatedAt: now,
    userId: 2,
  },
];

const mockPreviews = [
  {
    projectId: 100,
    ownerId: 1,
    title: 'test 1',
  },
  {
    projectId: 200,
    ownerId: 2,
    title: 'test 2',
  },
];

describe('getProjectsService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (transformProjectToPreview as Mock).mockImplementation((u: Projects) => ({
      projectId: u.projectId,
      ownerId: u.userId,
      title: u.title,
    }));
  });

  it('Returns all projects', async () => {
    (prisma.projects.findMany as Mock).mockResolvedValue(prismaProjects);

    const result = await getProjectsService();

    expect(transformProjectToPreview).toHaveBeenCalledTimes(2);
    expect(result).toEqual(mockPreviews);
  });
});
