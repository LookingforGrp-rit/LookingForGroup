import type { MySkill, AddUserSkillsInput } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { MySkillSelector } from '#services/selectors/me/parts/my-skill.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformMySkill } from '#services/transformers/me/parts/my-skill.ts';

type AddSkillServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;
type SkillWithUserId = AddUserSkillsInput & { userId: number };

const addSkillService = async (data: SkillWithUserId): Promise<MySkill | AddSkillServiceError> => {
  try {
    //creates the skill
    const result = await prisma.userSkills.create({
      data,
      select: MySkillSelector,
    });

    return transformMySkill(result);
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

export default addSkillService;
