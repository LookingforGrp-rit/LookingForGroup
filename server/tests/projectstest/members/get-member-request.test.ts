import type { MemberRequestStatus } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import getMemberRequestService from '#services/projects/members/get-member-request.ts';

/* eslint-disable @typescript-eslint/unbound-method */

/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    memberRequests: {
      findFirst: vi.fn(),
    },
  },
}));

const prismaApplicationRequest = {
  projectId: 100,
  roleId: 17,
  requestId: 50,
  prospectiveMemberId: 15,
  requestStatus: 'Pending' as MemberRequestStatus,
  sentFromProject: false,
};

describe('getMemberRequestService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns NO_CONTENT when get is successful', async () => {
    vi.mocked(prisma.memberRequests.findFirst).mockResolvedValue(prismaApplicationRequest);
    const result = await getMemberRequestService({ requestId: 50 });

    expect(result).toStrictEqual(prismaApplicationRequest);
  });
  it("returns NOT_FOUND when request isn't found", async () => {
    vi.mocked(prisma.memberRequests.findFirst).mockResolvedValue(null);
    const result = await getMemberRequestService({ requestId: 50 });

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.memberRequests.findFirst).mockRejectedValue(new Error('womp womp'));
    const result = await getMemberRequestService({ requestId: 50 });

    expect(result).toBe('INTERNAL_ERROR');
  });
});
