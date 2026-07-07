import type { EditSkillInput, Skill } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';

type EditSkillServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

export const editSkillService = async (
  input: EditSkillInput,
): Promise<Skill | EditSkillServiceError> => {
  try {
    const skillResult = await prisma.skills.findFirst({
      where: {
        skillId: input.skillId,
      },
      select: {
        label: true,
        type: true,
        category: true,
      },
    });

    if (!skillResult) {
      return 'NOT_FOUND';
    }

    const result = await prisma.skills.update({
      where: {
        skillId: input.skillId,
      },
      data: {
        label: input.label ?? skillResult.label,
        type: input.type ?? skillResult.type,
        category: input.category ?? skillResult.category,
      },
    });

    return result as Skill;
  } catch (e) {
    console.error('There was an error in EditSkillService: ', e);
    return 'INTERNAL_ERROR';
  }
};
