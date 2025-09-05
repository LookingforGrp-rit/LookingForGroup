import type { MySkill } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { SkillProficiency } from '#prisma-models/index.js';
import { MySkillSelector } from '#services/selectors/me/my-skill.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformMySkill } from '#services/transformers/me/my-skill.ts';

type AddSkillsServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;

type Skill = {
  userId: number;
  skillId: number;
  position: number;
  proficiency: SkillProficiency;
};

const addSkillsService = async (data: Skill[]): Promise<MySkill[] | AddSkillsServiceError> => {
  try {
    if (data.length === 0) return 'NOT_FOUND';

    //creates the skills
    await prisma.userSkills.createMany({
      data: data,
    });

    const result = await prisma.userSkills.findMany({
      where: {
        userId: data[0].userId,
      },
      select: MySkillSelector,
    });

    return result.map(transformMySkill);
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

export default addSkillsService;
