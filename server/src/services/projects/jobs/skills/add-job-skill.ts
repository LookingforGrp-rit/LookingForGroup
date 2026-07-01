import type { AddJobSkillInput, JobSkill } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { JobSkillSelector } from '#services/selectors/projects/parts/job-skill.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformJobSkill } from '#services/transformers/projects/parts/job-skill.ts';

type AddJobSkillServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;
type JobSkillWithId = AddJobSkillInput & { projectId: number; jobId: number };

//POST api/projects/{id}/jobs/{jobId}/skills
//add a skill to a job
const addJobSkillService = async (
  data: JobSkillWithId,
): Promise<JobSkill | AddJobSkillServiceError> => {
  try {
    //creates the skill
    const result = await prisma.jobSkills.create({
      data,
      select: JobSkillSelector,
    });
    const apiUrl = `/api/projects/${data.projectId.toString()}/jobs/${data.jobId.toString()}/skills/${result.skill.skillId.toString()}`;

    return transformJobSkill(apiUrl, result);
  } catch (e) {
    if (e instanceof Object && 'code' in e) {
      if (e.code === 'P2025') {
        return 'NOT_FOUND';
      }

      if (e.code === 'P2002') {
        return 'CONFLICT';
      }
    }

    console.error('Error in addSkillsService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default addJobSkillService;
