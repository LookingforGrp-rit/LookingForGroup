import type {
  MemberRequestStatus,
  ProjectContext,
  ProjectStatus,
  Visibility,
} from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import updateMemberRequestService from '#services/projects/members/update-member-request.ts';

/* eslint-disable @typescript-eslint/unbound-method */

/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    projects: {
      findFirst: vi.fn(),
    },
    memberRequests: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    majors: {
      findMany: vi.fn(),
    },
    users: {
      findMany: vi.fn(),
    },
    members: {
      findMany: vi.fn(),
    },
    blocklist: {
      findMany: vi.fn(),
    },
  },
}));
const now = new Date();
const prismaProject = {
  audience: '',
  createdAt: now,
  description: '',
  hook: '',
  projectId: 100,
  globalVisibility: 'public' as Visibility,
  context: 'Academic' as ProjectContext,
  status: 'Planning' as ProjectStatus,
  thumbnailId: 8,
  title: 'test 1',
  updatedAt: now,
  userId: 1,
  approved: true,
};

const prismaApplicationRequest = {
  projectId: 100,
  roleId: 17,
  requestId: 50,
  prospectiveMemberId: 15,
  requestStatus: 'Pending' as MemberRequestStatus,
  sentFromProject: false,
};

const prismaInvitationRequest = {
  projectId: 100,
  roleId: 17,
  requestId: 50,
  prospectiveMemberId: 15,
  requestStatus: 'Pending' as MemberRequestStatus,
  sentFromProject: true,
};

describe('updateMemberRequestService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns OK when update is successful', async () => {
    vi.mocked(prisma.memberRequests.findUnique).mockResolvedValue(prismaInvitationRequest);
    vi.mocked(prisma.projects.findFirst).mockResolvedValue(prismaProject);
    vi.mocked(prisma.memberRequests.update).mockResolvedValue(prismaInvitationRequest);
    const result = await updateMemberRequestService(50, 15, { requestStatus: 'Accepted' });

    expect(result).toBe('OK');
  });

  it("returns NOT_FOUND if the request doesn't exist", async () => {
    vi.mocked(prisma.memberRequests.findUnique).mockResolvedValue(null);
    vi.mocked(prisma.projects.findFirst).mockResolvedValue(prismaProject);
    vi.mocked(prisma.memberRequests.update).mockResolvedValue(prismaInvitationRequest);
    const result = await updateMemberRequestService(50, 15, { requestStatus: 'Accepted' });

    expect(result).toBe('NOT_FOUND');
  });

  it('returns FORBIDDEN if the user is neither the invitee nor a project owner updating roleId', async () => {
    vi.mocked(prisma.memberRequests.findUnique).mockResolvedValue(prismaInvitationRequest);
    vi.mocked(prisma.projects.findFirst).mockResolvedValue(prismaProject);
    vi.mocked(prisma.memberRequests.update).mockResolvedValue(prismaInvitationRequest);
    const result = await updateMemberRequestService(50, 1, { requestStatus: 'Accepted' });
    const result2 = await updateMemberRequestService(50, 12, { requestStatus: 'Accepted' });

    expect(result).toBe('FORBIDDEN');
    expect(result2).toBe('FORBIDDEN');
  });

  it('allows the project owner to update the roleId of a pending invitation', async () => {
    vi.mocked(prisma.memberRequests.findUnique).mockResolvedValue(prismaInvitationRequest);
    vi.mocked(prisma.projects.findFirst).mockResolvedValue(prismaProject);
    vi.mocked(prisma.memberRequests.update).mockResolvedValue({
      ...prismaInvitationRequest,
      roleId: 18,
    });

    const result = await updateMemberRequestService(50, 1, { roleId: 18 });

    expect(result).toBe('OK');
  });

  it('returns FORBIDDEN if the user is not the project owner for an application', async () => {
    vi.mocked(prisma.memberRequests.findUnique).mockResolvedValue(prismaApplicationRequest);
    vi.mocked(prisma.projects.findFirst).mockResolvedValue(prismaProject);
    vi.mocked(prisma.memberRequests.update).mockResolvedValue(prismaApplicationRequest);
    const result = await updateMemberRequestService(50, 15, { requestStatus: 'Accepted' });
    const result2 = await updateMemberRequestService(50, 12, { requestStatus: 'Accepted' });

    expect(result).toBe('FORBIDDEN');
    expect(result2).toBe('FORBIDDEN');
  });

  it("returns INTERNAL_ERROR if the project doesn't exist", async () => {
    vi.mocked(prisma.memberRequests.findUnique).mockResolvedValue(prismaInvitationRequest);
    vi.mocked(prisma.projects.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.memberRequests.update).mockResolvedValue(prismaInvitationRequest);
    const result = await updateMemberRequestService(50, 15, { requestStatus: 'Accepted' });

    expect(result).toBe('INTERNAL_ERROR');
  });

  it('returns INTERNAL_ERROR if the prisma throws', async () => {
    vi.mocked(prisma.memberRequests.findUnique).mockRejectedValue(new Error('womp womp'));
    vi.mocked(prisma.projects.findFirst).mockResolvedValue(null);
    vi.mocked(prisma.memberRequests.update).mockResolvedValue(prismaInvitationRequest);
    const result = await updateMemberRequestService(50, 15, { requestStatus: 'Accepted' });

    expect(result).toBe('INTERNAL_ERROR');
  });
});
