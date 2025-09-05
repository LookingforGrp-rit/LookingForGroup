import type { MySkill } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { MySkillSelector } from '#services/selectors/me/my-skill.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformMySkill } from '#services/transformers/me/my-skill.ts';

type AddSkillsServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;

//the skills (or their idsanyway)
type SkillsInput = {
  skills?: number[];
};

//putting this here because this is what a single skill will look like
//once proficiency is added properly
// type Skill = {
//   skillId?: number;
//   proficiency?: number; (number bc it'd probably be pulled by id)
// };

//this would take type Skill in place of data with the Skill type implemented
//Skill[] if we plan to handle adding multiple skills at once, and just Skill if one
const addSkillsService = async (
  userId: number,
  data: SkillsInput,
): Promise<MySkill[] | AddSkillsServiceError> => {
  try {
    if (!data.skills) return 'NOT_FOUND';

    //creates the skills form the skillIds they gave us
    for (let i = 0; i < data.skills.length; i++) {
      //this SHOULD be able to just be data: data[i]
      //and if not we can just populate it manually
      await prisma.userSkills.create({
        data: {
          userId: userId,
          skillId: data.skills[i],
          position: 0,
          proficiency: 'Novice',
        },
      });
    }

    const result = await prisma.userSkills.findMany({
      where: {
        userId,
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
