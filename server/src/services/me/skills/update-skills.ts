import type { MySkill, UpdateUserSkillInput } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { MySkillSelector } from '#services/selectors/me/parts/my-skill.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformMySkill } from '#services/transformers/me/parts/my-skill.ts';

type UpdateSkillsServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;

//PATCH api/me/skills/{id}
const updateSkillsService = async (
  userId: number,
  skillId: number,
  data: UpdateUserSkillInput,
): Promise<MySkill | UpdateSkillsServiceError> => {
  try {
    //this is just for proficiency for now
    const result = await prisma.userSkills.update({
      where: {
        userId_skillId: {
          userId,
          skillId,
        },
      },
      data: {
        ...(data.proficiency !== undefined && { proficiency: data.proficiency }), //this is currently defaulting to novice, but it can handle different changes to it
        ...(data.position !== undefined && { position: data.position }), //maybe it will find use someday
      },
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

    console.error('Error in updateSkillsService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default updateSkillsService;
