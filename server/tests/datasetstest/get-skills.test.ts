import type { Skill } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import getSkillsService from '#services/datasets/get-skills.ts';
import { transformSkill } from '#services/transformers/datasets/skill.ts';

/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    skills: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/datasets/skill.ts', () => ({
  transformSkill: vi.fn(),
}));

describe('getSkillsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns transformed skill when found', async () => {
    const prismaSkills: Skill[] = [
      { skillId: 1, label: 'C++', type: 'Developer' },
      { skillId: 44, label: 'Canva', type: 'Designer' },
    ];

    const transformed: Skill[] = [
      { skillId: 1, label: 'C++', type: 'Developer' },
      { skillId: 44, label: 'Canva', type: 'Designer' },
    ];

    vi.mocked(prisma.skills.findMany).mockResolvedValue(prismaSkills);
    vi.mocked(transformSkill).mockImplementation((skill) => skill as Skill);

    const result = await getSkillsService();

    console.log(result);

    expect(vi.mocked(prisma.skills.findMany)).toHaveBeenCalled();
    expect(vi.mocked(transformSkill)).toHaveBeenCalledTimes(2);
    expect(result).toEqual(transformed);
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.skills.findMany).mockRejectedValue(new Error('db on fire'));

    const result = await getSkillsService();

    expect(result).toBe('INTERNAL_ERROR');
  });
});
