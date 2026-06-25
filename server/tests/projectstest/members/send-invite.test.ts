import type {
  MemberRequestStatus,
  RequestToJoinInput,
  ProjectWithFollowers,
} from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import type { Users } from '#prisma-models/index.js';
import getRolesService from '#services/datasets/get-roles.ts';
import { sendEmail } from '#services/mailer.ts';
import getProjectByIdService from '#services/projects/get-proj-id.ts';
import sendInviteService from '#services/projects/members/send-invite.ts';

/* eslint-disable @typescript-eslint/unbound-method */

/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    memberRequests: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    users: {
      findUnique: vi.fn(),
    },
    roles: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('#services/datasets/get-roles.ts', () => ({
  default: vi.fn(),
}));

vi.mock('#services/mailer.ts', () => ({
  sendEmail: vi.fn(),
}));

vi.mock('#services/projects/get-proj-id.ts', () => ({
  default: vi.fn(),
}));

const requestData: RequestToJoinInput = {
  prospectiveMemberId: 10,
  ownerUserId: 1,
  message: 'Hi',
  roleId: 15,
};

const exampleRoles = [
  {
    roleId: 15,
    label: 'test',
  },
];

const project: ProjectWithFollowers = {
  projectId: 100,
  apiUrl: '/api/projectid/100',
} as ProjectWithFollowers;

const prismaApplicationRequest = {
  projectId: 100,
  roleId: 15,
  requestId: 50,
  prospectiveMemberId: 10,
  requestStatus: 'Pending' as MemberRequestStatus,
  sentFromProject: false,
};

describe('requestToJoinService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns OK when successful', async () => {
    vi.mocked(prisma.memberRequests.findFirst).mockResolvedValue(null);
    vi.mocked(getRolesService).mockResolvedValue(exampleRoles);
    vi.mocked(prisma.users.findUnique).mockResolvedValueOnce({ userId: 10 } as Users);
    vi.mocked(prisma.users.findUnique).mockResolvedValueOnce({ userId: 1 } as Users);
    vi.mocked(getProjectByIdService).mockResolvedValue(project);
    vi.mocked(sendEmail).mockResolvedValue('NO_CONTENT');
    vi.mocked(prisma.memberRequests.create).mockResolvedValue(prismaApplicationRequest);

    const result = await sendInviteService(100, requestData);
    expect(result).toBe('OK');
  });

  it('returns CONFLICT when the request already exists', async () => {
    vi.mocked(prisma.memberRequests.findFirst).mockResolvedValue(prismaApplicationRequest);
    vi.mocked(getRolesService).mockResolvedValue(exampleRoles);
    //vi.mocked(prisma.users.findUnique).mockResolvedValueOnce({userId: 10} as Users);
    //vi.mocked(prisma.users.findUnique).mockResolvedValueOnce({userId: 1} as Users);
    vi.mocked(getProjectByIdService).mockResolvedValue(project);
    vi.mocked(sendEmail).mockResolvedValue('NO_CONTENT');
    vi.mocked(prisma.memberRequests.create).mockResolvedValue(prismaApplicationRequest);

    const result = await sendInviteService(100, requestData);
    expect(result).toBe('CONFLICT');
  });

  it("returns NOT_FOUND if role doesn't exist", async () => {
    vi.mocked(prisma.memberRequests.findFirst).mockResolvedValue(null);
    vi.mocked(getRolesService).mockResolvedValue([{ roleId: 16, label: 'stinky' }]);
    //vi.mocked(prisma.users.findUnique).mockResolvedValueOnce({userId: 10} as Users);
    //vi.mocked(prisma.users.findUnique).mockResolvedValueOnce({userId: 1} as Users);
    vi.mocked(getProjectByIdService).mockResolvedValue(project);
    vi.mocked(sendEmail).mockResolvedValue('NO_CONTENT');
    vi.mocked(prisma.memberRequests.create).mockResolvedValue(prismaApplicationRequest);

    const result = await sendInviteService(100, requestData);
    expect(result).toBe('NOT_FOUND');
  });

  it("returns NOT_FOUND if requester doesn't exist", async () => {
    vi.mocked(prisma.memberRequests.findFirst).mockResolvedValue(null);
    vi.mocked(getRolesService).mockResolvedValue(exampleRoles);
    vi.mocked(prisma.users.findUnique).mockResolvedValueOnce(null);
    //vi.mocked(prisma.users.findUnique).mockResolvedValueOnce({userId: 1} as Users);
    vi.mocked(getProjectByIdService).mockResolvedValue(project);
    vi.mocked(sendEmail).mockResolvedValue('NO_CONTENT');
    vi.mocked(prisma.memberRequests.create).mockResolvedValue(prismaApplicationRequest);

    const result = await sendInviteService(100, requestData);
    expect(result).toBe('NOT_FOUND');
  });

  it("returns NOT_FOUND if owner doesn't exist", async () => {
    vi.mocked(prisma.memberRequests.findFirst).mockResolvedValue(null);
    vi.mocked(getRolesService).mockResolvedValue(exampleRoles);
    vi.mocked(prisma.users.findUnique).mockResolvedValueOnce({ userId: 10 } as Users);
    vi.mocked(prisma.users.findUnique).mockResolvedValueOnce(null);
    vi.mocked(getProjectByIdService).mockResolvedValue(project);
    vi.mocked(sendEmail).mockResolvedValue('NO_CONTENT');
    vi.mocked(prisma.memberRequests.create).mockResolvedValue(prismaApplicationRequest);

    const result = await sendInviteService(100, requestData);
    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR if prisma throws', async () => {
    vi.mocked(prisma.memberRequests.findFirst).mockResolvedValue(null);
    vi.mocked(getRolesService).mockResolvedValue(exampleRoles);
    vi.mocked(prisma.users.findUnique).mockResolvedValueOnce({ userId: 10 } as Users);
    vi.mocked(prisma.users.findUnique).mockResolvedValueOnce({ userId: 1 } as Users);
    vi.mocked(getProjectByIdService).mockResolvedValue(project);
    vi.mocked(sendEmail).mockResolvedValue('NO_CONTENT');
    vi.mocked(prisma.memberRequests.create).mockRejectedValue(new Error('womp womp'));

    const result = await sendInviteService(100, requestData);
    expect(result).toBe('INTERNAL_ERROR');
  });
});
