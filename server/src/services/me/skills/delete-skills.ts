import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSusbet } from '#services/service-outcomes.ts';

type DeleteSkillServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type DeleteSkillServiceSuccess = ServiceSuccessSusbet<'NO_CONTENT'>;

//DELETE api/me/skills/{id}
export const deleteSkillService = async (
  skillId: number,
  userId: number,
): Promise<DeleteSkillServiceError | DeleteSkillServiceSuccess> => {
  try {
    await prisma.userSkills.delete({
      where: {
        userId_skillId: {
          userId,
          skillId,
        },
      },
    });

    return 'NO_CONTENT';
  } catch (error) {
    console.error('Error in deleteSkillsService:', error);

    if (error instanceof Object && 'code' in error) {
      if (error.code === 'P2025') {
        return 'NOT_FOUND';
      }
    }

    return 'INTERNAL_ERROR';
  }
};
