import type { MemberRequestStatus } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import getApplicationsService from '#services/projects/members/get-proj-applications.ts';

/* eslint-disable @typescript-eslint/unbound-method */

/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    memberRequests: {
      findMany: vi.fn(),
    },
  },
}));

const prismaApplicationRequests = [
  {
    projectId: 100,
    roleId: 17,
    requestId: 50,
    prospectiveMemberId: 15,
    requestStatus: 'Pending' as MemberRequestStatus,
    sentFromProject: false,
  },
  {
    projectId: 100,
    roleId: 17,
    requestId: 50,
    prospectiveMemberId: 16,
    requestStatus: 'Pending' as MemberRequestStatus,
    sentFromProject: false,
  },
];

describe('getMemberRequestService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns NO_CONTENT when get is successful', async () => {
    vi.mocked(prisma.memberRequests.findMany).mockResolvedValue(prismaApplicationRequests);
    const result = await getApplicationsService(100);

    expect(result).toStrictEqual(prismaApplicationRequests);
  });
  it("returns NOT_FOUND when request isn't found", async () => {
    vi.mocked(prisma.memberRequests.findMany).mockResolvedValue([]);
    const result = await getApplicationsService(100);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.memberRequests.findMany).mockRejectedValue(new Error('womp womp'));
    const result = await getApplicationsService(100);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
