import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSusbet } from '#services/service-outcomes.ts';

type DeleteSkillsServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type DeleteSkillsServiceSuccess = ServiceSuccessSusbet<'NO_CONTENT'>;

export const deleteSkillsService = async (
  skillId: number,
  userId: number,
): Promise<DeleteSkillsServiceError | DeleteSkillsServiceSuccess> => {
  try {
    //skill validation (do you have this skill)
    const skillExists = await prisma.userSkills.findFirst({
      where: {
        skillId: skillId,
        userId: userId,
      },
    });

    if (!skillExists) return 'NOT_FOUND';

    await prisma.userSkills.delete({
      where: {
        userId_skillId: {
          userId: userId,
          skillId: skillId,
        },
      },
    });

    return 'NO_CONTENT';
  } catch (error) {
    console.error('Error in deleteSkillsService:', error);
    return 'INTERNAL_ERROR';
  }
};
