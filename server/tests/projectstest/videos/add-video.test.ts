import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import type { Prisma } from '#prisma-models/index.js';
import addVideoService from '#services/projects/videos/add-video.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */

const videoData: Prisma.ProjectVideosCreateInput = {
  videoUrl: 'www.test.com',
  title: 'test video',
  position: 3,
  projects: {
    connect: {
      projectId: 1,
    },
  },
};

const prismaVideo = {
  videoUrl: 'www.test.com',
  title: 'test image',
  position: 3,
  projectId: 1,
  videoId: 4,
};

vi.mock('#config/prisma.ts', () => ({
  default: {
    projectVideos: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe('addVideoService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns CREATED if successful', async () => {
    vi.mocked(prisma.projectVideos.create).mockResolvedValue(prismaVideo);
    const result = await addVideoService(videoData);

    expect(result).toBe('CREATED');
  });

  it('returns NOT_FOUND if prisma throws', async () => {
    vi.mocked(prisma.projectVideos.create).mockRejectedValue({ code: 'P2025' });
    const result = await addVideoService(videoData);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.projectVideos.create).mockRejectedValue(new Error('womp womp'));
    const result = await addVideoService(videoData);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
