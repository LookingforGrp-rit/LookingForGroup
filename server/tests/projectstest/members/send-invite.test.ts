import type { ProjectWithFollowers, Visibility } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import getRolesService from '#services/datasets/get-roles.ts';
import { sendEmail } from '#services/mailer.ts';
import getProjectByIdService from '#services/projects/get-proj-id.ts';
import sendInviteService from '#services/projects/members/send-invite.ts';

/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    users: {
      findUnique: vi.fn(),
    },
    roles: {
      findMany: vi.fn(),
    },
    members: {
      create: vi.fn(),
    },
  },
}));

vi.mock('#services/datasets/get-roles.ts', () => ({
  default: vi.fn(),
}));

vi.mock('#services/projects/get-proj-id.ts', () => ({
  default: vi.fn(),
}));

vi.mock('#services/mailer.ts', () => ({
  sendEmail: vi.fn(),
}));

const now = new Date();

const prismaRoles = [
  {
    roleId: 1,
    label: 'Artist',
  },
  {
    roleId: 2,
    label: 'Producer',
  },
];

const prismaUser = {
  userId: 1,
  username: '',
  displayPhone: false,
  ritEmail: 'email@rit.edu',
  firstName: '',
  lastName: '',
  preferredName: '',
  profileImage: null,
  headline: '',
  pronouns: '',
  title: '',
  academicYear: null,
  location: '',
  funFact: '',
  bio: '',
  privacy: 'public' as Visibility,
  mentor: false,
  createdAt: now,
  updatedAt: now,
  phoneNumber: null,
  googleId: '',
  moderator: true,
};

const prismaProject: ProjectWithFollowers = {
  apiUrl: '',
  audience: '',
  createdAt: now,
  description: '',
  globalVisibility: 'public',
  followers: {
    apiUrl: '',
    count: 0,
    users: [],
  },
  hook: '',
  jobs: [],
  mediums: [],
  members: [],
  owner: {
    apiUrl: '',
    designer: false,
    developer: true,
    firstName: '',
    funFact: '',
    displayPhone: false,
    privacy: 'public',
    headline: '',
    lastName: '',
    location: '',
    majors: [],
    mentor: false,
    preferredName: '',
    profileImage: '',
    pronouns: '',
    title: '',
    userId: 1,
    username: '',
  },
  projectId: 1,
  projectImages: [],
  projectSocials: [],
  purpose: 'Academic',
  status: 'Planning',
  tags: [],
  thumbnail: null,
  thumbnailId: 0,
  title: '',
  updatedAt: now,
};

describe('sendInviteService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns NO_CONTENT when the email is sent successful', async () => {
    vi.mocked(getRolesService).mockResolvedValue(prismaRoles);
    vi.mocked(prisma.users.findUnique).mockResolvedValue(prismaUser);
    vi.mocked(prisma.users.findUnique).mockResolvedValue(prismaUser);
    vi.mocked(getProjectByIdService).mockResolvedValue(prismaProject);
    vi.mocked(sendEmail).mockResolvedValue('NO_CONTENT');

    const result = await sendInviteService(1, {
      inviterUserId: 1,
      inviteeUserId: 2,
      message: 'hello',
      roleId: 1,
    });

    expect(prisma.users.findUnique).toHaveBeenCalledTimes(2);
    expect(result).toBe('NO_CONTENT');
  });

  it('returns INTERNAL_ERROR when failed to fetch roles', async () => {
    vi.mocked(getRolesService).mockRejectedValue('INTERNAL_ERROR');

    const result = await sendInviteService(1, {
      inviterUserId: 1,
      inviteeUserId: 2,
      message: 'hello',
      roleId: 1,
    });

    expect(result).toBe('INTERNAL_ERROR');
  });

  it('returns NOT_FOUND when role not found', async () => {
    vi.mocked(getRolesService).mockResolvedValue([]);

    const result = await sendInviteService(1, {
      inviterUserId: 1,
      inviteeUserId: 2,
      message: 'hello',
      roleId: 1,
    });

    expect(result).toBe('NOT_FOUND');
  });

  it('returns NOT_FOUND when either the inviter or invitee is not found', async () => {
    vi.mocked(getRolesService).mockResolvedValue(prismaRoles);
    vi.mocked(prisma.users.findUnique).mockResolvedValue(null);

    const result = await sendInviteService(1, {
      inviterUserId: 1,
      inviteeUserId: 2,
      message: 'hello',
      roleId: 1,
    });

    expect(prisma.users.findUnique).toHaveBeenCalledTimes(1);
    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when failed to fetch project', async () => {
    vi.mocked(getRolesService).mockResolvedValue(prismaRoles);
    vi.mocked(prisma.users.findUnique).mockResolvedValue(prismaUser);
    vi.mocked(prisma.users.findUnique).mockResolvedValue(prismaUser);
    vi.mocked(getProjectByIdService).mockRejectedValue('INTERNAL_ERROR');

    const result = await sendInviteService(1, {
      inviterUserId: 1,
      inviteeUserId: 2,
      message: 'hello',
      roleId: 1,
    });

    expect(prisma.users.findUnique).toHaveBeenCalledTimes(2);
    expect(result).toBe('INTERNAL_ERROR');
  });

  it('returns INTERNAL_ERROR when project not found', async () => {
    vi.mocked(getRolesService).mockResolvedValue(prismaRoles);
    vi.mocked(prisma.users.findUnique).mockResolvedValue(prismaUser);
    vi.mocked(prisma.users.findUnique).mockResolvedValue(prismaUser);
    vi.mocked(getProjectByIdService).mockRejectedValue('NOT_FOUND');

    const result = await sendInviteService(1, {
      inviterUserId: 1,
      inviteeUserId: 2,
      message: 'hello',
      roleId: 1,
    });

    expect(prisma.users.findUnique).toHaveBeenCalledTimes(2);
    expect(result).toBe('INTERNAL_ERROR');
  });

  it('returns INTERNAL_ERROR when the invitee is added as pending but failed to send email', async () => {
    vi.mocked(getRolesService).mockResolvedValue(prismaRoles);
    vi.mocked(prisma.users.findUnique).mockResolvedValue(prismaUser);
    vi.mocked(prisma.users.findUnique).mockResolvedValue(prismaUser);
    vi.mocked(getProjectByIdService).mockResolvedValue(prismaProject);
    vi.mocked(sendEmail).mockResolvedValue('INTERNAL_ERROR');

    const result = await sendInviteService(1, {
      inviterUserId: 1,
      inviteeUserId: 2,
      message: 'hello',
      roleId: 1,
    });

    expect(prisma.users.findUnique).toHaveBeenCalledTimes(2);
    expect(result).toBe('INTERNAL_ERROR');
  });

  it("returns NOT_FOUND when it can't find the right data", async () => {
    vi.mocked(getRolesService).mockResolvedValue(prismaRoles);
    vi.mocked(prisma.users.findUnique).mockRejectedValue({ code: 'P2025' });

    const result = await sendInviteService(1, {
      inviterUserId: 1,
      inviteeUserId: 2,
      message: 'hello',
      roleId: 1,
    });

    expect(result).toBe('NOT_FOUND');
  });

  it('returns CONFLICT when there is a conflict', async () => {
    vi.mocked(getRolesService).mockResolvedValue(prismaRoles);
    vi.mocked(prisma.users.findUnique).mockRejectedValue({ code: 'P2002' });

    const result = await sendInviteService(1, {
      inviterUserId: 1,
      inviteeUserId: 2,
      message: 'hello',
      roleId: 1,
    });

    expect(result).toBe('CONFLICT');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(getRolesService).mockResolvedValue(prismaRoles);
    vi.mocked(prisma.users.findUnique).mockRejectedValue(new Error('db on fire'));

    const result = await sendInviteService(1, {
      inviterUserId: 1,
      inviteeUserId: 2,
      message: 'hello',
      roleId: 1,
    });

    expect(result).toBe('INTERNAL_ERROR');
  });
});
