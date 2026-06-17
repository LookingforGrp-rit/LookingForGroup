import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import getProjectVideosService from '#services/projects/videos/get-videos.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */

const prismaVideos = [
  {
    videoUrl: 'www.test.com',
    title: 'test vid',
    position: 3,
    videoId: 4,
    projectId: 1,
  },
  {
    videoUrl: 'www.test2.com',
    title: 'test vid 2',
    position: 4,
    projectId: 1,
    videoId: 5,
  },
];

vi.mock('#config/prisma.ts', () => ({
  default: {
    projectVideos: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/projects/parts/project-image.ts', () => ({
  transformProjectImage: vi.fn(),
}));

describe('getVideoService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns the videos if successful', async () => {
    vi.mocked(prisma.projectVideos.findMany).mockResolvedValue(prismaVideos);
    const result = await getProjectVideosService(1);

    expect(result).toStrictEqual(prismaVideos);
  });
  it("returns NOT_FOUND if the project isn't found", async () => {
    vi.mocked(prisma.projectVideos.findMany).mockRejectedValue({ code: 'P2025' });
    const result = await getProjectVideosService(1);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.projectVideos.findMany).mockRejectedValue(new Error('womp womp'));
    const result = await getProjectVideosService(1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
