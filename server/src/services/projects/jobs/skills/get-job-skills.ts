import type { JobSkill } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { JobSkillSelector } from '#services/selectors/projects/parts/job-skill.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformJobSkill } from '#services/transformers/projects/parts/job-skill.ts';

type GetServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//GET api/projects/{id}/jobs/{jobId}/skills
//get a job's skills
//needed? maybe not. but i'm leaving this here anyway just in case we do
const getJobSkillsService = async (jobId: number): Promise<JobSkill[] | GetServiceError> => {
  try {
    const job = await prisma.jobs.findUnique({
      where: { jobId },
      include: {
        jobSkills: {
          select: JobSkillSelector,
        },
      },
    });

    if (job === null) {
      return 'NOT_FOUND';
    }

    const transformedSkills = job.jobSkills.map((skill) => {
      const apiUrl = `/api/projects/${job.projectId.toString()}/jobs/${job.jobId.toString()}/skills/${skill.skill.skillId.toString()}`;
      return transformJobSkill(apiUrl, skill);
    });

    return transformedSkills;
  } catch (e) {
    console.error(`Error in getJobSkillsService: ${e as Error}`);
    return 'INTERNAL_ERROR';
  }
};

export default getJobSkillsService;
