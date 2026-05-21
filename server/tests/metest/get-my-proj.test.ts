import type {
  ProjectDetail,
  ProjectMedium,
  ProjectPurpose,
  ProjectStatus,
  UserPreview,
  ProjectImage,
} from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import prisma from '#config/prisma.ts';
import { getMyProjectsService } from '#services/me/get-my-proj.ts';
import { transformProjectToDetail } from '#services/transformers/projects/project-detail.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */

vi.mock('#config/prisma.ts', () => ({
  default: {
    projects: {
      findMany: vi.fn(),
    },
    members: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/projects/project-detail.ts', () => ({
  transformProjectToDetail: vi.fn(),
}));

const now = new Date();

describe('getMyProjectsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns all transformed projects when no filters are provided', async () => {
    const primsaProjects: ProjectDetail[] = [
      {
        apiUrl: '/api/projects/1',
        audience: '',
        createdAt: now,
        description: '',
        hook: '',
        jobs: [],
        mediums: [],
        members: [],
        owner: { userId: 1 } as UserPreview,
        projectId: 1,
        projectImages: [],
        projectSocials: [],
        purpose: 'Academic' as ProjectPurpose,
        status: 'Planning' as ProjectStatus,
        tags: [],
        thumbnail: null,
        thumbnailId: 0,
        title: 'test 1',
        updatedAt: now,
      },
      {
        apiUrl: '/api/projects/2',
        audience: '',
        createdAt: now,
        description: '',
        hook: '',
        jobs: [],
        mediums: [],
        members: [],
        owner: { userId: 2 } as UserPreview,
        projectId: 2,
        projectImages: [],
        projectSocials: [],
        purpose: 'Academic' as ProjectPurpose,
        status: 'Planning' as ProjectStatus,
        tags: [],
        thumbnail: null,
        thumbnailId: 0,
        title: 'test 2',
        updatedAt: now,
      },
    ];

    const transformed: ProjectDetail[] = [
      {
        apiUrl: '/api/projects/1',
        audience: '',
        createdAt: now,
        description: '',
        hook: '',
        jobs: [],
        mediums: [],
        members: [],
        owner: { userId: 1 } as UserPreview,
        projectId: 1,
        projectImages: [],
        projectSocials: [],
        purpose: 'Academic' as ProjectPurpose,
        status: 'Planning' as ProjectStatus,
        tags: [],
        thumbnail: null,
        thumbnailId: 0,
        title: 'test 1',
        updatedAt: now,
      },
      {
        apiUrl: '/api/projects/2',
        audience: '',
        createdAt: now,
        description: '',
        hook: '',
        jobs: [],
        mediums: [],
        members: [],
        owner: { userId: 2 } as UserPreview,
        projectId: 2,
        projectImages: [],
        projectSocials: [],
        purpose: 'Academic' as ProjectPurpose,
        status: 'Planning' as ProjectStatus,
        tags: [],
        thumbnail: null,
        thumbnailId: 0,
        title: 'test 2',
        updatedAt: now,
      },
    ];

    (prisma.projects.findMany as Mock).mockResolvedValue(primsaProjects);
    vi.mocked(transformProjectToDetail).mockImplementation((p: any) => ({
      apiUrl: p.apiUrl as string,
      audience: '',
      createdAt: now,
      description: '',
      hook: p.hook as string,
      jobs: [],
      mediums: p.mediums as ProjectMedium[],
      members: [],
      owner: p.owner as UserPreview,
      projectId: p.projectId as number,
      projectImages: [],
      projectSocials: [],
      purpose: 'Academic' as ProjectPurpose,
      status: 'Planning' as ProjectStatus,
      tags: [],
      thumbnail: p.thumbnail as ProjectImage,
      thumbnailId: 0,
      title: p.title as string,
      updatedAt: now,
    }));

    const result = await getMyProjectsService(1, 'all');
    // console.log(result);
    expect(vi.mocked(prisma.projects.findMany)).toHaveBeenCalled();
    expect(result).toEqual(transformed);
  });

  // !!SKIPPED visibility filters (implement later?)

  it('returns NOT_FOUND when no associated projects found', async () => {
    vi.mocked(prisma.projects.findMany).mockResolvedValue([]);

    const result = await getMyProjectsService(1, 'all');

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR on exception', async () => {
    (prisma.projects.findMany as Mock).mockRejectedValue(new Error('db exploded :fire:'));

    const result = await getMyProjectsService(1, 'all');

    expect(result).toBe('INTERNAL_ERROR');
  });
});
