import type { ProjectPurpose, ProjectStatus, ProjectMedium } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import prisma from '#config/prisma.ts';
import getProjectMediumsService from '#services/projects/mediums/get-proj-mediums.ts';
import { transformProjectMedium } from '#services/transformers/projects/parts/project-medium.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment*/
/* eslint-disable @typescript-eslint/no-unsafe-call*/
/* eslint-disable @typescript-eslint/no-unsafe-member-access*/
/* eslint-disable @typescript-eslint/restrict-template-expressions*/
/* eslint-disable @typescript-eslint/require-await */

const now = new Date();

const testMedium1 = {
  mediumId: 5,
  label: 'Test Medium',
};

const testMedium2 = {
  mediumId: 6,
  label: 'Test Medium 2',
};

const transformedMediums: ProjectMedium[] = [
  {
    mediumId: 5,
    label: 'Test Medium',
    apiUrl: 'api/project/1/mediums/5',
  },
  {
    mediumId: 6,
    label: 'Test Medium 2',
    apiUrl: 'api/project/1/mediums/6',
  },
];

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
  mediums: [testMedium1, testMedium2],
};

vi.mock('#config/prisma.ts', () => ({
  default: {
    projects: {
      findUnique: vi.fn(),
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
    (transformProjectMedium as Mock).mockImplementation(
      (projectId: number, { mediumId, label }) => {
        return {
          apiUrl: `api/project/${projectId.toString()}/mediums/${mediumId.toString()}`,
          mediumId,
          label,
        };
      },
    );
  });
  it('returns the mediums if successful', async () => {
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(prismaProject);
    const result = await getProjectMediumsService(1);

    expect(transformProjectMedium).toBeCalled();
    expect(transformProjectMedium).toBeCalledTimes(2);
    expect(result).toStrictEqual(transformedMediums);
  });

  it("returns NOT_FOUND if project isn't found", async () => {
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(null);
    const result = await getProjectMediumsService(1);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.projects.findUnique).mockRejectedValue(new Error('womp womp'));
    const result = await getProjectMediumsService(1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
