import type {
  JobSkill,
  SkillType,
  SkillCategory,
  SkillProficiency,
} from '@looking-for-group/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import getJobSkillsService from '#services/projects/jobs/skills/get-job-skills.ts';
import { transformJobSkill } from '#services/transformers/projects/parts/job-skill.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

vi.mock('#config/prisma.ts', () => ({
  default: {
    jobs: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('#services/transformers/projects/parts/job-skill.ts', () => ({
  transformJobSkill: vi.fn(),
}));

const prismaJob = {
  projectId: 1,
  jobId: 15,
  jobSkills: [
    {
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
    },
  ],
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

describe('getJobSkillsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns transformed job skills when the job exists', async () => {
    vi.mocked(prisma.jobs.findUnique).mockResolvedValue(prismaJob);
    vi.mocked(transformJobSkill).mockReturnValue(transformedJobSkill);

    const result = await getJobSkillsService(15);

    expect(prisma.jobs.findUnique).toHaveBeenCalledWith({
      where: { jobId: 15 },
      include: {
        jobSkills: {
          select: expect.any(Object),
        },
      },
    });
    expect(transformJobSkill).toHaveBeenCalledWith(
      '/api/projects/1/jobs/15/skills/3',
      prismaJob.jobSkills[0],
    );
    expect(result).toStrictEqual([transformedJobSkill]);
  });

  it('returns NOT_FOUND when the job does not exist', async () => {
    vi.mocked(prisma.jobs.findUnique).mockResolvedValue(null);

    const result = await getJobSkillsService(15);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when prisma throws', async () => {
    vi.mocked(prisma.jobs.findUnique).mockRejectedValue(new Error('db cursed'));

    const result = await getJobSkillsService(15);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
