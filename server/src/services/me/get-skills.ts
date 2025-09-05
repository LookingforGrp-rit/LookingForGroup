import type { MySkill } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { MySkillSelector } from '#services/selectors/me/my-skill.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformMySkill } from '#services/transformers/me/my-skill.ts';

type GetSkillsError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

export const getSkillsService = async (userId: number): Promise<MySkill[] | GetSkillsError> => {
  try {
    //all their skills
    const skills = await prisma.userSkills.findMany({
      where: {
        userId,
      },
      select: MySkillSelector,
    });

    return skills.map(transformMySkill);
  } catch (e) {
    console.error(`Error in getSkillsService: ${JSON.stringify(e)}`);
    return 'INTERNAL_ERROR';
  }
};
