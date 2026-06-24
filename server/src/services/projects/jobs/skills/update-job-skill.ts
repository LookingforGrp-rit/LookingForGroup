import type { JobSkill, UpdateJobSkillInput } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { JobSkillSelector } from '#services/selectors/projects/parts/job-skill.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformJobSkill } from '#services/transformers/projects/parts/job-skill.ts';

type UpdateJobSkillsServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;

//PATCH api/projects/{id}/jobs/{jobId}/skills/{skillId}
//update a job skill
const updateJobSkillsService = async (
  projectId: number,
  jobId: number,
  skillId: number,
  data: UpdateJobSkillInput,
): Promise<JobSkill | UpdateJobSkillsServiceError> => {
  try {
    // update the skill with proficiency (and whatever else would be added to it)
    const result = await prisma.jobSkills.update({
      where: {
        jobId_skillId: {
          jobId,
          skillId,
        },
      },
      data: {
        ...(data.proficiency !== undefined && { proficiency: data.proficiency }), //this is currently defaulting to novice when it's sent in, but it can handle different changes to it
      },
      select: JobSkillSelector,
    });
    const apiUrl = `/api/projects/${projectId.toString()}/jobs/${jobId.toString()}/skills/${result.skill.skillId.toString()}`;

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

    console.error('Error in updateSkillsService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default updateJobSkillsService;
