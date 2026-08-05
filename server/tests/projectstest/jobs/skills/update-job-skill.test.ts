import type {
  JobSkill,
  SkillType,
  SkillCategory,
  SkillProficiency,
} from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import updateJobSkillsService from '#services/projects/jobs/skills/update-job-skill.ts';
import { transformJobSkill } from '#services/transformers/projects/parts/job-skill.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    jobSkills: {
      update: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/projects/parts/job-skill.ts', () => ({
  transformJobSkill: vi.fn(),
}));

const prismaJobSkill = {
  jobSkillId: 10,
  jobId: 15,
  proficiency: 'Advanced' as SkillProficiency,
  position: 1,
  skill: {
    skillId: 3,
    category: 'Coding Language' as SkillCategory,
    label: 'TypeScript',
    type: 'Developer' as SkillType,
  },
};

const transformedJobSkill: JobSkill = {
  apiUrl: '/api/projects/1/jobs/15/skills/3',
  skillId: 3,
  label: 'TypeScript',
  category: 'Coding Language',
  type: 'Developer',
  position: 1,
  proficiency: 'Advanced',
};

describe('updateJobSkillsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the transformed updated job skill when successful', async () => {
    vi.mocked(prisma.jobSkills.update).mockResolvedValue(prismaJobSkill as any);
    vi.mocked(transformJobSkill).mockReturnValue(transformedJobSkill);

    const result = await updateJobSkillsService(1, 15, 3, {
      skillId: 3,
      proficiency: 'Advanced',
      position: 1,
    });

    expect(transformJobSkill).toHaveBeenCalledWith(
      '/api/projects/1/jobs/15/skills/3',
      prismaJobSkill,
    );
    expect(result).toStrictEqual(transformedJobSkill);
  });

  it('returns CONFLICT when the job skill conflicts', async () => {
    const error = Object.assign(new Error('conflict'), { code: 'P2002' });
    vi.mocked(prisma.jobSkills.update).mockRejectedValue(error);

    const result = await updateJobSkillsService(1, 15, 3, {
      skillId: 3,
      proficiency: 'Advanced',
      position: 1,
    });

    expect(result).toBe('CONFLICT');
  });

  it('returns NOT_FOUND when the job skill does not exist', async () => {
    const error = Object.assign(new Error('not found'), { code: 'P2025' });
    vi.mocked(prisma.jobSkills.update).mockRejectedValue(error);

    const result = await updateJobSkillsService(1, 15, 3, {
      skillId: 3,
      proficiency: 'Advanced',
      position: 1,
    });

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.jobSkills.update).mockRejectedValue(new Error('db cursed'));

    const result = await updateJobSkillsService(1, 15, 3, {
      skillId: 3,
      proficiency: 'Advanced',
      position: 1,
    });

    expect(result).toBe('INTERNAL_ERROR');
  });
});
