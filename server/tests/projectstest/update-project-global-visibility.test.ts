import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import type { Projects } from '#prisma-models/index.js';
import { updateProjectGlobalVisibilityService } from '#services/projects/update-project-global-visibility.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    projects: {
      update: vi.fn(),
    },
  },
}));

const prismaProject: Projects = {
  audience: '',
  description: '',
  hook: '',
  projectId: 1,
  context: 'Academic',
  status: 'Planning',
  thumbnailId: 0,
  title: 'test 1',
  globalVisibility: 'private',
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: 1,
  approved: true,
};

describe('updateProjectGlobalVisibilityService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns OK if successful updated the global visibility of a project', async () => {
    vi.mocked(prisma.projects.update).mockResolvedValue(prismaProject);

    const result = await updateProjectGlobalVisibilityService(1, 'private');

    expect(result).toBe('OK');
  });

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.projects.update).mockRejectedValue('db exploded :(');

    const result = await updateProjectGlobalVisibilityService(1, 'private');

    expect(result).toBe('INTERNAL_ERROR');
  });
});
