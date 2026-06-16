import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import deleteVideoService from '#services/projects/videos/delete-video.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    projectVideos: {
      delete: vi.fn(),
    },
  },
}));

describe('deleteVideoService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('returns CREATED if successful', async () => {
    const result = await deleteVideoService(1);

    expect(result).toBe('NO_CONTENT');
  });

  it('returns NOT_FOUND if prisma throws', async () => {
    vi.mocked(prisma.projectVideos.delete).mockRejectedValue({ code: 'P2025' });
    const result = await deleteVideoService(1);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.projectVideos.delete).mockRejectedValue(new Error('womp womp'));
    const result = await deleteVideoService(1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
