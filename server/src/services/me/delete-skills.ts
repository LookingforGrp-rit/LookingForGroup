import prisma from '#config/prisma.ts';
import type { UserSkills } from '#prisma-models/index.js';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type DeleteSkillsServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

export const deleteSkillsService = async (
  skillId: number,
  userId: number,
): Promise<UserSkills | DeleteSkillsServiceError> => {
  try {
    //skill validation (do you have this skill)
    const skillExists = await prisma.userSkills.findFirst({
      where: {
        skillId: skillId,
        userId: userId,
      },
    });

    if (!skillExists) return 'NOT_FOUND';

    const skill = await prisma.userSkills.delete({
      where: {
        userId_skillId: {
          userId: userId,
          skillId: skillId,
        },
      },
    });

    return skill;
  } catch (error) {
    console.error('Error in deleteSkillsService:', error);
    return 'INTERNAL_ERROR';
  }
};
