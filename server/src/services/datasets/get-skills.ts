import prisma from '#config/prisma.ts';
import { SkillSelector } from '#services/selectors/datasets/skill.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
import { transformSkill } from '#services/transformers/datasets/skill.ts';
import type { Skill } from '../../../../shared/types.ts';
// import {
//   sortLabelNumberArrayAlphabetically
// } from "../../helperFunctions.ts"

type GetSkillsServiceError = ServiceErrorSubset<'INTERNAL_ERROR'>;

//GET api/datasets/skills
const getSkillsService = async (): Promise<Skill[] | GetSkillsServiceError> => {
  let skills = await prisma.skills.findMany({
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

  //Should sort the array in alphabetical order
  skills = skills.toSorted(
    (skill1, skill2) => skill1.label.charCodeAt(0) - skill2.label.charCodeAt(0),
  );
  return skills.map(transformSkill);
};

export default getSkillsService;
