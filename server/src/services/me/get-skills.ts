import prisma from '#config/prisma.ts';
import type { UserSkills } from '#prisma-models/index.js';
import type { ServiceErrorSubset } from '#services/service-error.ts';

type GetSkillsError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

export const getSkillsService = async (userId: number): Promise<UserSkills[] | GetSkillsError> => {
  try {
    //all their skills
    const skills = await prisma.userSkills.findMany({
      where: {
        userId: userId,
      },
    });

    return skills;
  } catch (e) {
    console.error(`Error in getSkillsService: ${JSON.stringify(e)}`);
    return 'INTERNAL_ERROR';
  }
};
