import type { MySkill, UserSkill, SkillType } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import addSkillService from '#services/me/skills/add-skills.ts';
import { transformMySkill } from '#services/transformers/me/parts/my-skill.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */

vi.mock('#config/prisma.ts', () => ({
  default: {
    userSkills: {
      create: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/me/parts/my-skill.ts', () => ({
  transformMySkill: vi.fn(),
}));

const prismaUserSkill: UserSkill = {
  position: 1,
  proficiency: 'Novice',
  label: '',
  skillId: 1,
  type: 'Designer' as SkillType,
};

const transformed: MySkill = {
  apiUrl: 'api/me/skills',
  ...prismaUserSkill,
};

describe('addSkillService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns transformed my skill obj after user skill is successfully created', async () => {
    vi.mocked(prisma.userSkills.create).mockResolvedValue({ ...prismaUserSkill, userId: 1 });
    vi.mocked(transformMySkill).mockReturnValue(transformed);

    const result = await addSkillService({
      position: 1,
      proficiency: 'Novice',
      skillId: 1,
      userId: 1,
    });

    expect(result).toEqual(transformed);
  });

  it('returns NOT_FOUND if skill does not exist', async () => {
    vi.mocked(prisma.userSkills.create).mockRejectedValue({ code: 'P2025' } as any);

    const result = await addSkillService({
      position: 1,
      proficiency: 'Novice',
      skillId: 1,
      userId: 1,
    });

    expect(result).toBe('NOT_FOUND');
  });

  it('returns CONFLICT if user skill already exists', async () => {
    vi.mocked(prisma.userSkills.create).mockRejectedValue({ code: 'P2002' } as any);

    const result = await addSkillService({
      position: 1,
      proficiency: 'Novice',
      skillId: 1,
      userId: 1,
    });

    expect(result).toBe('CONFLICT');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.userSkills.create).mockRejectedValue(new Error('db cursed'));

    const result = await addSkillService({
      position: 1,
      proficiency: 'Novice',
      skillId: 1,
      userId: 1,
    });

    expect(result).toBe('INTERNAL_ERROR');
  });
});
