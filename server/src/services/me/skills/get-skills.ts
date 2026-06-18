import type { MySkill } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { MySkillSelector } from '#services/selectors/me/parts/my-skill.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformMySkill } from '#services/transformers/me/parts/my-skill.ts';

type GetSkillsError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;

//GET api/me/skills
export const getSkillsService = async (userId: number): Promise<MySkill[] | GetSkillsError> => {
  try {
    //all their skills
    let skills = await prisma.userSkills.findMany({
      where: {
        userId,
      },
      orderBy: {
        skills: {
          label: 'asc',
        },
      },
      select: MySkillSelector,
    });

    //Array is alphabetized by skill label
    skills = skills.toSorted(
      (skill1, skill2) => skill1.skills.label.charCodeAt(0) - skill2.skills.label.charCodeAt(0),
    );
    return skills.map(transformMySkill);
  } catch (e) {
    console.error(`Error in getSkillsService: ${e as Error}`);
    return 'INTERNAL_ERROR';
  }
};
