import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';

type DeleteJobSkillServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type DeleteJobSkillServiceSuccess = ServiceSuccessSubset<'NO_CONTENT'>;

//DELETE api/projects/{id}/jobs/{jobId}/skills/{skillId}
//delete a skill from a job
export const deleteJobSkillService = async (
  skillId: number,
  jobId: number,
): Promise<DeleteJobSkillServiceSuccess | DeleteJobSkillServiceError> => {
  try {
    await prisma.jobSkills.delete({
      where: {
        jobId_skillId: {
          jobId,
          skillId,
        },
      },
    });

    return 'NO_CONTENT';
  } catch (error) {
    console.error('Error in deleteJobSkillService:', error);

    if (error instanceof Object && 'code' in error) {
      if (error.code === 'P2025') {
        return 'NOT_FOUND';
      }
    }

    return 'INTERNAL_ERROR';
  }
};
