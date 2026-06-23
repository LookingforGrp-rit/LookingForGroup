import type {
  CreateProjectMemberInput,
  ProjectMember,
  UserPreview,
} from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import type { Visibility } from '#prisma-models/index.js';
import addMemberService from '#services/projects/members/add-member.ts';
import sendInviteService from '#services/projects/members/send-invite.ts';
import { transformProjectMember } from '#services/transformers/projects/parts/project-member.ts';

/* eslint-disable @typescript-eslint/unbound-method */

/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    members: {
      create: vi.fn(),
    },
    roles: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/projects/parts/project-member.ts', () => ({
  transformProjectMember: vi.fn(),
}));

vi.mock('#services/projects/members/send-invite.ts', () => ({
  default: vi.fn(),
}));

const data: CreateProjectMemberInput = {
  ownerUserId: 1,
  prospectiveMemberId: 29,
  roleId: 31,
  message: '',
};

const now = new Date();

const testMember = {
  projectId: 1,
  userId: 29,
  roleId: 31,
  profileVisibility: 'public' as Visibility,
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
    vi.mocked(sendInviteService).mockResolvedValue('OK');
    vi.mocked(transformProjectMember).mockReturnValue(transformedMember);
    const result = await addMemberService(1, data);

    expect(transformProjectMember).toHaveBeenCalled();
    expect(transformProjectMember).toHaveBeenCalledWith(1, testMember);
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

  it('returns INTERNAL_ERROR when the member created successfully but email fails to send', async () => {
    vi.mocked(prisma.members.create).mockResolvedValue(testMember);
    vi.mocked(sendInviteService).mockRejectedValue(new Error('email service error'));
    vi.mocked(transformProjectMember).mockReturnValue(transformedMember);
    const result = await addMemberService(1, data);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
