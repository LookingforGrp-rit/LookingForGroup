import type { ProjectStatus, Visibility, ProjectDetail } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { getUnapprovedProjectByIdService } from '#services/projects/approval/get-unapproved-proj-id.ts';
import { transformProjectToDetail } from '#services/transformers/projects/project-detail.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

vi.mock('#config/prisma.ts', () => ({
  default: {
    projects: {
      findFirst: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/projects/project-detail.ts', () => ({
  transformProjectToDetail: vi.fn(),
}));

const now = new Date();

const prismaProject = {
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
};

const transformed = {
  userId: 1,
  title: 'Test Project',
} as any;

describe('getUnapprovedProjectByIdService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the project when found', async () => {
    vi.mocked(prisma.projects.findFirst).mockResolvedValue(prismaProject);
    vi.mocked(transformProjectToDetail).mockReturnValue(transformed as ProjectDetail);

    const result = await getUnapprovedProjectByIdService(1);

    expect(result).toBe(transformed);
  });

  it('returns NOT_FOUND when the project is not found', async () => {
    vi.mocked(prisma.projects.findFirst).mockResolvedValue(null);

    const result = await getUnapprovedProjectByIdService(1);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.projects.findFirst).mockRejectedValue(new Error('db cursed'));

    const result = await getUnapprovedProjectByIdService(1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
