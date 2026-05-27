import type { ProjectMember, UserPreview } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { MembersProfileVisibility } from '#prisma-models/index.js';
import updateMemberService from '#services/projects/members/update-member.ts';
import { transformProjectMember } from '#services/transformers/projects/parts/project-member.ts';

/* eslint-disable @typescript-eslint/unbound-method */

/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    members: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/projects/parts/project-member.ts', () => ({
  transformProjectMember: vi.fn(),
}));

const data = {
  profileVisibility: 'Private' as MembersProfileVisibility,
};

const now = new Date();

const testMember = {
  projectId: 1,
  userId: 29,
  roleId: 31,
  profileVisibility: 'Public' as MembersProfileVisibility,
  createdAt: now,
};

const updatedMember = {
  projectId: 1,
  userId: 29,
  roleId: 31,
  profileVisibility: 'Private' as MembersProfileVisibility,
  createdAt: now,
};

const transformedMember: ProjectMember = {
  user: { userId: 29 } as UserPreview,
  role: {
    roleId: 31,
    label: 'Test',
  },
  memberSince: now,
  apiUrl: 'api/project/1/members/29',
};

describe('updateProjectMemberService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the member when update is successful', async () => {
    vi.mocked(prisma.members.findUnique).mockResolvedValue(testMember);
    vi.mocked(prisma.members.update).mockResolvedValue(updatedMember);
    vi.mocked(transformProjectMember).mockReturnValue(transformedMember);
    const result = await updateMemberService({ projectId: 100, userId: 29 }, data);

    expect(transformProjectMember).toBeCalled();
    expect(result).toBe(transformedMember);
  });
  it("returns NOT_FOUND when member isn't found", async () => {
    vi.mocked(prisma.members.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.members.update).mockResolvedValue(updatedMember);
    vi.mocked(transformProjectMember).mockReturnValue(transformedMember);
    const result = await updateMemberService({ projectId: 100, userId: 29 }, data);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.members.findUnique).mockRejectedValue(new Error('womp womp'));
    vi.mocked(prisma.members.update).mockResolvedValue(updatedMember);
    vi.mocked(transformProjectMember).mockReturnValue(transformedMember);
    const result = await updateMemberService({ projectId: 100, userId: 29 }, data);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
