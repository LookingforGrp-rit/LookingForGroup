import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { deleteSkillFromSiteService } from '#services/admin/delete-skill.ts';

/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    skills: {
      delete: vi.fn(),
    },
  },
}));

const prismaSkill = {
  label: 'TypeScript',
  type: 'Developer',
  category: 'Coding Language',
  skillId: 1,
};

describe('deleteSkillFromSiteService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns NO_CONTENT when skill is deleted', async () => {
    vi.mocked(prisma.skills.delete).mockResolvedValue(prismaSkill);

    const result = await deleteSkillFromSiteService(1);

    expect(result).toBe('NO_CONTENT');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.skills.delete).mockRejectedValue(new Error('db ghosted'));

    const result = await deleteSkillFromSiteService(1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
