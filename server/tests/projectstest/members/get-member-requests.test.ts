import type { MemberRequestStatus } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import getMemberRequestsService from '#services/projects/members/get-member-requests.ts';

/* eslint-disable @typescript-eslint/unbound-method */

/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    memberRequests: {
      findMany: vi.fn(),
    },
  },
}));

const prismaRequests = [
  {
    projectId: 1,
    roleId: 17,
    requestId: 50,
    prospectiveMemberId: 15,
    requestStatus: 'Pending' as MemberRequestStatus,
    sentFromProject: false,
  },
  {
    projectId: 1,
    roleId: 32,
    requestId: 97,
    prospectiveMemberId: 41,
    requestStatus: 'Pending' as MemberRequestStatus,
    sentFromProject: true,
  },
];

describe('getMemberRequestService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns array of member requests when get is successful', async () => {
    vi.mocked(prisma.memberRequests.findMany).mockResolvedValue(prismaRequests);
    const result = await getMemberRequestsService(1);

    expect(result).toStrictEqual(prismaRequests);
  });
  it('returns [] when no requests are found', async () => {
    vi.mocked(prisma.memberRequests.findMany).mockResolvedValue([]);
    const result = await getMemberRequestsService(1);

    expect(result).toStrictEqual([]);
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.memberRequests.findMany).mockRejectedValue(new Error('womp womp'));
    const result = await getMemberRequestsService(1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
