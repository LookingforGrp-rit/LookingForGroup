import type {
  CreateProjectMemberInput,
  ProjectMember,
  UserPreview,
} from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { MembersProfileVisibility } from '#prisma-models/index.js';
import addMemberService from '#services/projects/members/add-member.ts';
import { transformProjectMember } from '#services/transformers/projects/parts/project-member.ts';

/* eslint-disable @typescript-eslint/unbound-method */

/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    members: {
      create: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/projects/parts/project-member.ts', () => ({
  transformProjectMember: vi.fn(),
}));

const data: CreateProjectMemberInput = {
  userId: 29,
  roleId: 31,
};

const now = new Date();

const testMember = {
  projectId: 1,
  userId: 29,
  roleId: 31,
  profileVisibility: 'Public' as MembersProfileVisibility,
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

describe('addProjectMemberService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the member when add is successful', async () => {
    vi.mocked(prisma.members.create).mockResolvedValue(testMember);
    vi.mocked(transformProjectMember).mockReturnValue(transformedMember);
    const result = await addMemberService(1, data);

    expect(transformProjectMember).toBeCalled();
    expect(transformProjectMember).toBeCalledWith(1, testMember);
    expect(result).toBe(transformedMember);
  });
  it("returns NOT_FOUND when it can't find the right data", async () => {
    vi.mocked(prisma.members.create).mockRejectedValue({ code: 'P2025' });
    vi.mocked(transformProjectMember).mockReturnValue(transformedMember);
    const result = await addMemberService(1, data);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns CONFLICT when there is a conflict', async () => {
    vi.mocked(prisma.members.create).mockRejectedValue({ code: 'P2002' });
    vi.mocked(transformProjectMember).mockReturnValue(transformedMember);
    const result = await addMemberService(1, data);

    expect(result).toBe('CONFLICT');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.members.create).mockRejectedValue(new Error('womp womp'));
    vi.mocked(transformProjectMember).mockReturnValue(transformedMember);
    const result = await addMemberService(1, data);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
