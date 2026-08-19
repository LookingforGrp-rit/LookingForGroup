import { describe, it, expect, vi, beforeEach } from 'vitest';
import prisma from '#config/prisma.ts';
import { deleteJobSkillService } from '#services/projects/jobs/skills/delete-job-skill.ts';

/* eslint-disable @typescript-eslint/unbound-method */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

vi.mock('#config/prisma.ts', () => ({
  default: {
    jobSkills: {
      delete: vi.fn(),
    },
  },
}));

describe('deleteJobSkillService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns NO_CONTENT when job skill is deleted successfully', async () => {
    vi.mocked(prisma.jobSkills.delete).mockResolvedValue({
      jobId: 15,
      skillId: 1,
      proficiency: 'Intermediate',
      position: 1,
    } as any);

    const result = await deleteJobSkillService(1, 15);

    expect(prisma.jobSkills.delete).toHaveBeenCalledWith({
      where: {
        jobId_skillId: {
          jobId: 15,
          skillId: 1,
        },
      },
    });
    expect(result).toBe('NO_CONTENT');
  });

  it('returns NOT_FOUND when job skill is not found', async () => {
    vi.mocked(prisma.jobSkills.delete).mockRejectedValue(
      Object.assign(new Error('Can not find job skill'), { code: 'P2025' }),
    );

    const result = await deleteJobSkillService(1, 15);

    expect(result).toBe('NOT_FOUND');
  });

  it('returns INTERNAL_ERROR when Prisma throws an unexpected error', async () => {
    vi.mocked(prisma.jobSkills.delete).mockRejectedValue(new Error('db gone wild'));

    const result = await deleteJobSkillService(1, 15);

    expect(result).toBe('INTERNAL_ERROR');
  });
});
