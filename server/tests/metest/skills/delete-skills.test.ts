import type { SkillProficiency } from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { deleteSkillService } from '#services/me/skills/delete-skills.ts';

/* eslint-disable @typescript-eslint/unbound-method */

vi.mock('#config/prisma.ts', () => ({
  default: {
    userSkills: {
      delete: vi.fn(),
    },
  },
}));

const prismaUserSkill = {
  userId: 1,
  skillId: 1,
  position: 1,
  proficiency: 'Novice' as SkillProficiency,
};

describe('deleteSkillService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns NO_CONTENT after user skill is deleted', async () => {
    vi.mocked(prisma.userSkills.delete).mockResolvedValue(prismaUserSkill);

    const result = await deleteSkillService(1, 1);

    expect(result).toBe('NO_CONTENT');
  });

  it('returns NOT_FOUND if user skill does not exist', async () => {
    vi.mocked(prisma.userSkills.delete).mockRejectedValue({ code: 'P2025' });

    const result = await deleteSkillService(1, 1);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.userSkills.delete).mockRejectedValue(new Error('db cursed'));

    const result = await deleteSkillService(1, 1);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
