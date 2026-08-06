import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { editSkillService } from '#services/admin/edit-skill.ts';

/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    skills: {
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const prismaSkill = {
  label: 'TypeScript',
  type: 'Developer',
  category: 'Coding Language',
  skillId: 1,
};

const returnedSkill = {
  label: 'C#',
  type: 'Developer',
  category: 'Coding Language',
  skillId: 1,
};

describe('editSkillService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the skill when skill is created', async () => {
    vi.mocked(prisma.skills.findFirst).mockResolvedValue(prismaSkill);
    vi.mocked(prisma.skills.update).mockResolvedValue(returnedSkill);

    const result = await editSkillService({
      skillId: 1,
      label: 'C#',
    });

    expect(result).toBe(returnedSkill);
  });

  it('returns NOT_FOUND when skill does not exists', async () => {
    vi.mocked(prisma.skills.findFirst).mockResolvedValue(null);

    const result = await editSkillService({
      skillId: 1,
      label: 'C#',
    });

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.skills.findFirst).mockResolvedValue(prismaSkill);
    vi.mocked(prisma.skills.update).mockRejectedValue(new Error('db ghosted'));

    const result = await editSkillService({
      skillId: 1,
      label: 'C#',
    });

    expect(result).toBe('INTERNAL_ERROR');
  });
});
