import type { ProjectMember, UserPreview } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import prisma from '#config/prisma.ts';
import { MembersProfileVisibility } from '#prisma-models/index.js';
import getMemberService from '#services/projects/members/get-members.ts';
import { transformProjectMember } from '#services/transformers/projects/parts/project-member.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-unsafe-assignment*/
/* eslint-disable @typescript-eslint/no-unsafe-call*/
/* eslint-disable @typescript-eslint/no-unsafe-member-access*/
/* eslint-disable @typescript-eslint/restrict-template-expressions*/
/* eslint-disable @typescript-eslint/require-await */

vi.mock('#config/prisma.ts', () => ({
  default: {
    members: {
      findMany: vi.fn(),
    },
    majors: {
      findMany: vi.fn(),
    },
    users: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/projects/parts/project-member.ts', () => ({
  transformProjectMember: vi.fn(),
}));

const now = new Date();

const testMembers = [
  {
    projectId: 1,
    userId: 29,
    roleId: 31,
    label: 'Test',
    profileVisibility: 'Public' as MembersProfileVisibility,
    createdAt: now,
  },
  {
    projectId: 1,
    userId: 76,
    roleId: 52,
    label: 'Test 2',
    profileVisibility: 'Public' as MembersProfileVisibility,
    createdAt: now,
  },
];

const transformedMembers: ProjectMember[] = [
  {
    user: { userId: 29 } as UserPreview,
    role: {
      roleId: 31,
      label: 'Test',
    },
    memberSince: now,
    apiUrl: '/api/projects/1/members/29',
  },
  {
    user: { userId: 76 } as UserPreview,
    role: {
      roleId: 52,
      label: 'Test 2',
    },
    memberSince: now,
    apiUrl: '/api/projects/1/members/76',
  },
];

describe('getProjectMemberService', async () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (transformProjectMember as Mock).mockImplementation(
      (projectId, { userId, roleId, label, createdAt }): ProjectMember => {
        return {
          user: { userId: userId } as UserPreview,
          role: {
            roleId: roleId,
            label: label,
          },
          memberSince: createdAt,
          apiUrl: `/api/projects/${projectId.toString()}/members/${userId.toString()}`,
        };
      },
    );
  });

  it('returns the members when get is successful', async () => {
    vi.mocked(prisma.members.findMany).mockResolvedValue(testMembers);
    const result = await getMemberService(1);

    expect(transformProjectMember).toBeCalled();
    expect(transformProjectMember).toBeCalledTimes(2);
    expect(result).toStrictEqual(transformedMembers);
  });
});
