import type { UserPreview, ProjectDetail, UpdateProjectInput } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import type { Projects } from '#prisma-models/index.js';
import updateProjectService from '#services/projects/update-proj.ts';
import { transformProjectToDetail } from '#services/transformers/projects/project-detail.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */

vi.mock('#services/transformers/projects/project-detail.ts', () => ({
  transformProjectToDetail: vi.fn(),
}));

vi.mock('#config/prisma.ts', () => ({
  default: {
    projects: {
      update: vi.fn(),
      findMany: vi.fn(),
    },
    projectImages: {
      findMany: vi.fn(),
    },
    roles: {
      findMany: vi.fn(),
    },
    majors: {
      findMany: vi.fn(),
    },
    users: {
      findMany: vi.fn(),
    },
    jobs: {
      findMany: vi.fn(),
    },
    members: {
      findMany: vi.fn(),
    },
    socials: {
      findMany: vi.fn(),
    },
    projectSocials: {
      findMany: vi.fn(),
    },
    mediums: {
      findMany: vi.fn(),
    },
    tags: {
      findMany: vi.fn(),
    },
  },
}));

const now = new Date();

const projectUpdate: UpdateProjectInput = {
  title: 'New Title',
  description: 'New description',
};

const prismaProject: Projects = {
  audience: '',
  createdAt: now,
  description: '',
  hook: '',
  projectId: 1,
  context: 'Academic',
  status: 'Planning',
  thumbnailId: 0,
  title: 'test 1',
  globalVisibility: 'public',
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
  context: 'Academic',
  status: 'Planning',
  tags: [],
  thumbnail: null,
  thumbnailId: 0,
  title: 'test 1',
  updatedAt: now,
  projectVideos: [],
  approved: true,
};

describe('deleteProjectService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns transformed if successful update', async () => {
    vi.mocked(prisma.projects.update).mockResolvedValue(prismaProject);
    vi.mocked(transformProjectToDetail).mockReturnValue(transformed);
    const result = await updateProjectService(1, projectUpdate);

    expect(transformProjectToDetail).toHaveBeenCalledWith(prismaProject);
    expect(result).toBe(transformed);
  });
  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.projects.update).mockRejectedValue('db exploded :(');
    vi.mocked(transformProjectToDetail).mockReturnValue(transformed);
    const result = await updateProjectService(1, projectUpdate);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
