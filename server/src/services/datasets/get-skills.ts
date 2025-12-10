import prisma from '#config/prisma.ts';
import { SkillSelector } from '#services/selectors/datasets/skill.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformSkill } from '#services/transformers/datasets/skill.ts';
import type { Skill } from '../../../../shared/types.ts';

type GetSkillsServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

//GET api/datasets/skills
const getSkillsService = async (): Promise<Skill[] | GetSkillsServiceError> => {
  try {
    const skills = await prisma.skills.findMany({
      select: SkillSelector,
      orderBy: [
        {
          type: 'asc',
        },
        {
          label: 'asc',
        },
      ],
    });

    return skills.map(transformSkill);
  } catch (e) {
    console.error(`Error in getSkillsService: ${JSON.stringify(e)}`);

    return 'INTERNAL_ERROR';
  }
};

export default getSkillsService;
