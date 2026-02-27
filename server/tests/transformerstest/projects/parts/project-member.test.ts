import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ProjectMemberPayload } from '#services/transformers/projects/parts/project-member.ts';
import { transformProjectMember } from '#services/transformers/projects/parts/project-member.ts';
import { transformUserToPreview } from '#services/transformers/users/user-preview.ts';
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
vi.mock('#services/transformers/users/user-preview.ts', () => ({
  transformUserToPreview: vi.fn(),
}));

describe('transformProjectMember', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('maps user, role, and apiUrl correctly', () => {
    const createdAt = new Date('2024-01-01');

    const prismaMember: ProjectMemberPayload = {
      users: { userId: 10 },
      roles: { roleId: 3, label: 'Writer' },
      createdAt: createdAt,
    } as ProjectMemberPayload;

    vi.mocked(transformUserToPreview).mockReturnValue({ userId: 10 } as any);

    const result = transformProjectMember(42, prismaMember);
    console.log('prismamember: ', prismaMember);

    expect(transformUserToPreview).toHaveBeenCalledWith({ userId: 10 });

    expect(result.role).toEqual({
      roleId: 3,
      label: 'Writer',
    });

    expect(result.memberSince).toBe(createdAt);

    expect(result.apiUrl).toBe('/api/projects/42/members/10');
  });
});
