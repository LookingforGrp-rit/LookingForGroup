import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSusbet } from '#services/service-outcomes.ts';

type DeleteSkillServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type DeleteSkillServiceSuccess = ServiceSuccessSusbet<'NO_CONTENT'>;

export const deleteSkillService = async (
  skill: number,
  userId: number,
): Promise<DeleteSkillServiceError | DeleteSkillServiceSuccess> => {
  try {
    await prisma.userSkills.deleteMany({
      where: {
        userId: userId,
        skillId: skill,
      },
    });

    return 'NO_CONTENT';
  } catch (error) {
    console.error('Error in deleteSkillsService:', error);
    return 'INTERNAL_ERROR';
  }
};
