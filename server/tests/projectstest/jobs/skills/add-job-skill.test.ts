import type {
  AddJobSkillInput,
  JobSkill,
  SkillType,
  SkillCategory,
  SkillProficiency,
} from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import addJobSkillService from '#services/projects/jobs/skills/add-job-skill.ts';
import { transformJobSkill } from '#services/transformers/projects/parts/job-skill.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

vi.mock('#config/prisma.ts', () => ({
  default: {
    jobSkills: {
      create: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/projects/parts/job-skill.ts', () => ({
  transformJobSkill: vi.fn(),
}));

const jobSkillData: AddJobSkillInput = {
  skillId: 3,
  proficiency: 'Intermediate',
  position: 1,
};

const prismaJobSkill = {
  jobSkillId: 10,
  jobId: 15,
  proficiency: 'Intermediate' as SkillProficiency,
  position: 1,
  skill: {
    skillId: 3,
    category: 'Coding Language' as SkillCategory,
    label: 'TypeScript',
    type: 'Developer' as SkillType,
  },
} as any;

const transformedJobSkill: JobSkill = {
  apiUrl: '/api/projects/1/jobs/15/skills/3',
  skillId: 3,
  label: 'TypeScript',
  category: 'Coding Language',
  type: 'Developer',
  position: 1,
  proficiency: 'Intermediate',
};

describe('addJobSkillService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the transformed when job skill is created successfully', async () => {
    vi.mocked(prisma.jobSkills.create).mockResolvedValue(prismaJobSkill);
    vi.mocked(transformJobSkill).mockReturnValue(transformedJobSkill);

    const result = await addJobSkillService(1, 15, jobSkillData);

    expect(prisma.jobSkills.create).toHaveBeenCalledWith({
      data: {
        jobId: 15,
        skillId: 3,
        proficiency: 'Intermediate',
        position: 1,
      },
      select: expect.any(Object),
    });
    expect(transformJobSkill).toHaveBeenCalledWith(
      '/api/projects/1/jobs/15/skills/3',
      prismaJobSkill,
    );
    expect(result).toBe(transformedJobSkill);
  });

  it('returns NOT_FOUND when Prisma rejects with P2025', async () => {
    vi.mocked(prisma.jobSkills.create).mockRejectedValue({ code: 'P2025' });

    const result = await addJobSkillService(1, 15, jobSkillData);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns CONFLICT when Prisma rejects with P2002', async () => {
    vi.mocked(prisma.jobSkills.create).mockRejectedValue({ code: 'P2002' });

    const result = await addJobSkillService(1, 15, jobSkillData);

    expect(result).toBe('CONFLICT');
  });

  it('returns INTERNAL_ERROR when Prisma throws an unexpected error', async () => {
    vi.mocked(prisma.jobSkills.create).mockRejectedValue(new Error('db gone wild'));

    const result = await addJobSkillService(1, 15, jobSkillData);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
