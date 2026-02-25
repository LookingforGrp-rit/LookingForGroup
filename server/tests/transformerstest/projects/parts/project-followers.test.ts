/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
vi.mock('#services/transformers/users/user-preview.ts', () => ({
  transformUserToPreview: vi.fn(),
}));

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ProjectFollowersPayload } from '#services/transformers/projects/parts/project-followers.ts';
import { transformProjectToFollowers } from '#services/transformers/projects/parts/project-followers.ts';
import { transformUserToPreview } from '#services/transformers/users/user-preview.ts';

describe('transformProjectToFollowers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps followers correctly', () => {
    const prismaProject: ProjectFollowersPayload = {
      projectId: 42,
      _count: {
        projectFollowings: 2,
      },
      projectFollowings: [
        {
          followingAt: new Date('2024-01-01'),
          users: { userId: 1 },
        },
        {
          followedAt: new Date('2024-01-02'),
          users: { userId: 2 },
        },
      ],
    } as ProjectFollowersPayload;

    vi.mocked(transformUserToPreview)
      .mockReturnValueOnce({ userId: 1 } as any)
      .mockReturnValueOnce({ userId: 2 } as any);

    const result = transformProjectToFollowers(prismaProject);

    expect(result.count).toBe(2);

    expect(transformUserToPreview).toHaveBeenCalledTimes(2);

    expect(result.users.length).toBe(2);
    expect(result.users[0].user).toEqual({ userId: 1 });

    expect(result.apiUrl).toBe('/api/projects/42/followers');
  });
});
