import type { MySkill, SkillType, SkillProficiency } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import updateSkillsService from '#services/me/skills/update-skills.ts';
import { transformMySkill } from '#services/transformers/me/parts/my-skill.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    userSkills: {
      update: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/me/parts/my-skill.ts', () => ({
  transformMySkill: vi.fn(),
}));

const prismaUserSkills = {
  proficiency: 'Novice' as SkillProficiency,
  position: 1,
  skills: {
    skillId: 1,
    label: '',
    type: 'Designer' as SkillType,
  },
};

const transformed: MySkill = {
  apiUrl: 'api/me/skills',
  position: 2,
  proficiency: 'Advanced',
  label: '',
  skillId: 1,
  type: 'Designer' as SkillType,
};

describe('updateSkillsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns transformed my skills', async () => {
    vi.mocked(prisma.userSkills.update).mockResolvedValue(prismaUserSkills as any);
    vi.mocked(transformMySkill).mockReturnValue(transformed);

    const result = await updateSkillsService(1, 1, {
      position: 2,
      proficiency: 'Advanced' as SkillProficiency,
    });

    expect(result).toBe(transformed);
  });

  it('returns NOT_FOUND if skill does not exist', async () => {
    vi.mocked(prisma.userSkills.update).mockRejectedValue({ code: 'P2025' } as any);

    const result = await updateSkillsService(1, 1, {
      position: 2,
      proficiency: 'Advanced' as SkillProficiency,
    });

    expect(result).toBe('NOT_FOUND');
  });

  it('returns CONFLICT if proficiency and/or position is causing conflicts', async () => {
    vi.mocked(prisma.userSkills.update).mockRejectedValue({ code: 'P2002' } as any);

    const result = await updateSkillsService(1, 1, {
      position: 2,
      proficiency: 'Advanced' as SkillProficiency,
    });

    expect(result).toBe('CONFLICT');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.userSkills.update).mockRejectedValue(new Error('db cursed'));

    const result = await updateSkillsService(1, 1, {
      position: 2,
      proficiency: 'Advanced' as SkillProficiency,
    });

    expect(result).toBe('INTERNAL_ERROR');
  });
});
