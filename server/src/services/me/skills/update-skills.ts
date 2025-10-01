import type { MySkill, UpdateUserSkillInput } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { MySkillSelector } from '#services/selectors/me/parts/my-skill.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformMySkill } from '#services/transformers/me/parts/my-skill.ts';

type UpdateSkillsServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;

const updateSkillsService = async (
  userId: number,
  skillId: number,
  data: UpdateUserSkillInput,
): Promise<MySkill[] | UpdateSkillsServiceError> => {
  try {
    //skill validation (do you have these skills)
    const skillExists = await prisma.userSkills.findMany({
      where: {
        skillId: skillId,
        userId: userId,
      },
    });

    if (skillExists.length === 0) return 'NOT_FOUND';

    //this is just for proficiency for now
    await prisma.userSkills.update({
      where: {
        userId_skillId: {
          userId,
          skillId: skillId,
        },
      },
      data: {
        ...(data.proficiency !== undefined && { proficiency: data.proficiency }),
        ...(data.position !== undefined && { position: data.position }),
      },
    });

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

    console.error('Error in updateSkillsService:', e);
    return 'INTERNAL_ERROR';
  }
};

export default updateSkillsService;
