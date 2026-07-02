import { Skill } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { ServiceErrorSubset } from '#services/service-outcomes.ts';

type GetSkillServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

const getSkillService = async (skillId: number): Promise<Skill | GetSkillServiceError> => {
  try {
    const result = await prisma.skills.findFirst({
      where: { skillId },
      select: {
        skillId: true,
        label: true,
        type: true,
        category: true,
      },
    });

    if (!result) {
      return 'NOT_FOUND';
    }

    return result as Skill;
  } catch (e) {
    console.error('There was an internal error in getSkillService: ', e);
    return 'INTERNAL_ERROR';
  }
};

export default getSkillService;
