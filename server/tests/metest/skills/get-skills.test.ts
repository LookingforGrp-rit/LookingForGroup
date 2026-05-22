import type { MySkill, SkillType, SkillProficiency } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { getSkillsService } from '#services/me/skills/get-skills.ts';
import { transformMySkill } from '#services/transformers/me/parts/my-skill.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */

vi.mock('#config/prisma.ts', () => ({
  default: {
    userSkills: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/me/parts/my-skill.ts', () => ({
  transformMySkill: vi.fn(),
}));

const prismaUserSkills = [
  {
    userId: 1,
    position: 1,
    proficiency: 'Novice' as SkillProficiency,
    label: '',
    skillId: 1,
    type: 'Designer' as SkillType,
  },
];

const transformed: MySkill = {
  apiUrl: 'api/me/skills',
  position: 1,
  proficiency: 'Novice',
  label: '',
  skillId: 1,
  type: 'Designer' as SkillType,
};

describe('getSkillsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns transformed my skills', async () => {
    vi.mocked(prisma.userSkills.findMany).mockResolvedValue(prismaUserSkills);
    vi.mocked(transformMySkill).mockReturnValue(transformed);

    const result = await getSkillsService(1);

    expect(result).toStrictEqual([transformed]);
  });

  // !! remove skip if NOT_FOUND added in #services/me/skills/get-skills.ts
  it.skip('returns NOT_FOUND if user skill does not exist', async () => {
    vi.mocked(prisma.userSkills.delete).mockRejectedValue({ code: 'P2025' } as any);

    const result = await getSkillsService(1);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.userSkills.findMany).mockRejectedValue(new Error('db cursed'));

    const result = await getSkillsService(1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
