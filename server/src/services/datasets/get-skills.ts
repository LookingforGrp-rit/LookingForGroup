import prisma from '#config/prisma.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import type { Skill } from '../../../../shared/types.ts';

type GetSkillsServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

const getSkillsService = async (): Promise<Skill[] | GetSkillsServiceError> => {
  try {
    return await prisma.skills.findMany({
      select: {
        skillId: true,
        label: true,
        type: true,
      },
    });
  } catch (e) {
    console.error(`Error in getSkillsService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default getSkillsService;
