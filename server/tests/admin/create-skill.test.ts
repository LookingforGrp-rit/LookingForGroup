import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { createSkillService } from '#services/admin/create-skill.ts';

/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    skills: {
      create: vi.fn(),
    },
  },
}));

const prismaSkill = {
  label: 'TypeScript',
  type: 'Developer',
  category: 'Coding Language',
  skillId: 1,
};

describe('createSkillService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the skill when skill is created', async () => {
    vi.mocked(prisma.skills.create).mockResolvedValue(prismaSkill);

    const result = await createSkillService({
      label: 'TypeScript',
      type: 'Developer',
      category: 'Coding Language',
    });

    expect(result).toBe(prismaSkill);
  });

  it('returns CONFLICT when skill already exists', async () => {
    const error = Object.assign(new Error('Skill already exists'), { code: 'P2002' });
    vi.mocked(prisma.skills.create).mockRejectedValue(error);

    const result = await createSkillService({
      label: 'TypeScript',
      type: 'Developer',
      category: 'Coding Language',
    });

    expect(result).toBe('CONFLICT');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.skills.create).mockRejectedValue(new Error('db ghosted'));

    const result = await createSkillService({
      label: 'TypeScript',
      type: 'Developer',
      category: 'Coding Language',
    });

    expect(result).toBe('INTERNAL_ERROR');
  });
});
