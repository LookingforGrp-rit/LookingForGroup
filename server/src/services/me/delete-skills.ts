import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset, ServiceSuccessSusbet } from '#services/service-outcomes.ts';

type DeleteSkillsServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type DeleteSkillsServiceSuccess = ServiceSuccessSusbet<'NO_CONTENT'>;

type Skills = {
  skillIds: number[];
};

export const deleteSkillsService = async (
  skills: Skills,
  userId: number,
): Promise<DeleteSkillsServiceError | DeleteSkillsServiceSuccess> => {
  try {
    const skillData = skills.skillIds;

    //skill validation (do you have these skills)
    const skillExists = await prisma.userSkills.findMany({
      where: {
        skillId: {
          in: skillData,
        },
        userId: userId,
      },
    });

    if (skillExists.length === 0) return 'NOT_FOUND';

    await prisma.userSkills.deleteMany({
      where: {
        userId: userId,
        skillId: {
          in: skillData,
        },
      },
    });

    return 'NO_CONTENT';
  } catch (error) {
    console.error('Error in deleteSkillsService:', error);
    return 'INTERNAL_ERROR';
  }
};
