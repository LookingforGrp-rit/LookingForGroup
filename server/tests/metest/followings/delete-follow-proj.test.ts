import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { deleteProjectFollowService } from '#services/me/followings/delete-follow-proj.ts';

/* eslint-disable @typescript-eslint/unbound-method */

// !! IF NOT_FOUND added in #services/me/followings/delete-follow-proj.ts
// !! then uncomment the test and the all project related mocks

vi.mock('#config/prisma.ts', () => ({
  default: {
    // projects: {
    //     findUnique: vi.fn(),
    // },
    projectFollowings: {
      delete: vi.fn(),
    },
  },
}));

// const prismaProject = {
//     projectId: 1,
// };

const prismaProjectFollowing = {
  userId: 1,
  projectId: 1,
  followedAt: new Date(),
};

describe('deleteProjectFollowService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // remove .skip
  it.skip('returns NOT_FOUND if project does not exist', async () => {
    vi.mocked(prisma.projects.findUnique).mockResolvedValue(null);

    const result = await deleteProjectFollowService(1, 1);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns NO_CONTENT after follow deleted successfully', async () => {
    // vi.mocked(prisma.projects.findUnique).mockResolvedValue(prismaProject as any);
    vi.mocked(prisma.projectFollowings.delete).mockResolvedValue(prismaProjectFollowing);

    const result = await deleteProjectFollowService(1, 1);

    expect(result).toBe('NO_CONTENT');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.projectFollowings.delete).mockRejectedValue(new Error('db cursed'));

    const result = await deleteProjectFollowService(1, 1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
