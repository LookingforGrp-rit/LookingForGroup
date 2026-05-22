import type { ProjectPurpose, ProjectStatus } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import type { Projects } from '#prisma-models/index.js';
import { deleteProjectService } from '#services/projects/delete-proj.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    projects: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    jobs: {
      deleteMany: vi.fn(),
    },
    members: {
      deleteMany: vi.fn(),
    },
    projectFollowings: {
      deleteMany: vi.fn(),
    },
    projectImages: {
      deleteMany: vi.fn(),
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

describe('deleteProjectService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns NO_CONTENT if it successfully deletes a project', async () => {
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(prismaProject);
    const result = await deleteProjectService(100);

    expect(result).toBe('NO_CONTENT');
  });
  it("returns NOT_FOUND if project doesn't exist", async () => {
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(null);
    const result = await deleteProjectService(100);

    expect(result).toBe('NOT_FOUND');
  });
  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.projects.findUnique).mockRejectedValue(new Error('db exploded :('));
    const result = await deleteProjectService(100);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
