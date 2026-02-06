import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { transformProjectToPreview } from '#services/transformers/projects/project-preview.ts';
import { getUserProjectsService } from '#services/users/get-user-proj.ts';
/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

//mocking
vi.mock('#config/prisma.ts', () => ({
  default: {
    projects: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/projects/project-preview.ts', () => ({
  transformProjectToPreview: vi.fn(),
}));

const mockProjects = [
  { project_id: 10, title: 'projectAlpha', createdAt: new Date() },
  { project_id: 11, title: 'projectBeta', createdAt: new Date() },
];

const mockPreviews = [
  { project_id: 10, title: 'projectAlpha' },
  { project_id: 11, title: 'projectBeta' },
];

describe('getuserProjectsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(transformProjectToPreview).mockImplementation((p: any) => ({
      projectId: p.projectId,
      title: p.title,
      hook: p.hook,
      owner: p.users,
      thumbnail: p.thumbnail,
      mediums: p.mediums,
      thumbnailId: p.thumbnailId ?? null,
      apiUrl: p.apiUrl ?? '',
    }));
  });
  it('returns transformed projects for a user', async () => {
    vi.mocked(prisma.projects.findMany).mockResolvedValue(mockProjects as any);
    const result = await getUserProjectsService(42);

    // expect(prisma.projects.findMany).toHaveBeenCalledWith({
    //     where: {
    //         members: {
    //             every: {
    //                 userId: 42,
    //                 profileVisibility: 'public',
    //             },
    //         },
    //     },
    //     orderBy: {createdAt: 'desc' },
    //     select: expect.any(Object),
    // });

    expect(transformProjectToPreview).toHaveBeenCalledTimes(2);
    expect(result).toEqual(mockPreviews);
  });

  it('returns NOT_FOUND when noprojects exist', async () => {
    vi.mocked(prisma.projects.findMany).mockResolvedValue([]);
    const result = await getUserProjectsService(999);
    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.projects.findMany).mockRejectedValue(new Error('db exploded :('));

    const result = await getUserProjectsService(1);
    expect(result).toBe('INTERNAL_ERROR');
  });
});
