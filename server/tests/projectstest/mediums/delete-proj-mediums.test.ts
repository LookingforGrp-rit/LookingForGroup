import type { ProjectPurpose, ProjectStatus } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { deleteMediumsService } from '#services/projects/mediums/delete-proj-mediums.ts';

/* eslint-disable @typescript-eslint/unbound-method */

/* eslint-disable @typescript-eslint/require-await */

const now = new Date();

const testMedium = {
  mediumId: 5,
  label: 'Test Medium',
};

const prismaProject = {
  audience: '',
  createdAt: now,
  description: '',
  hook: '',
  projectId: 1,
  purpose: 'Academic' as ProjectPurpose,
  status: 'Planning' as ProjectStatus,
  thumbnailId: 0,
  title: 'test 1',
  updatedAt: now,
  userId: 1,
  mediums: [testMedium],
};

vi.mock('#config/prisma.ts', () => ({
  default: {
    projects: {
      update: vi.fn(),
    },
    majors: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/projects/parts/project-medium.ts', () => ({
  transformProjectMedium: vi.fn(),
}));

describe('addMediumsService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns NO_CONTENT if successful', async () => {
    vi.mocked(prisma.projects.update).mockResolvedValue(prismaProject);
    const result = await deleteMediumsService(1, 6);

    expect(result).toBe('NO_CONTENT');
  });

  it("returns NOT_FOUND if the project isn't found", async () => {
    vi.mocked(prisma.projects.update).mockRejectedValue({ code: 'P2025' });
    const result = await deleteMediumsService(1, 6);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.projects.update).mockRejectedValue(new Error('womp womp'));
    const result = await deleteMediumsService(1, 6);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
