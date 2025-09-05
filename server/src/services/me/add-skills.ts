import prisma from '#config/prisma.ts';
import { SkillProficiency } from '#prisma-models/index.js';
//import { MySkillSelector } from '#services/selectors/me/my-skill.ts';
import type { ServiceErrorSubset } from '#services/service-outcomes.ts';
//import { transformMySkill } from '#services/transformers/me/my-skill.ts';

type AddSkillsServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND' | 'CONFLICT'>;

type Skill = {
  userId: number;
  skillId: number;
  position: number;
  proficiency: SkillProficiency;
};

//this would take type Skill in place of data with the Skill type implemented
//Skill[] if we plan to handle adding multiple skills at once, and just Skill if one
const addSkillsService = async (
  data: Skill[],
): Promise<ReturnType<typeof prisma.userSkills.createMany> | AddSkillsServiceError> => {
  try {
    if (data.length === 0) return 'NOT_FOUND';

    //creates the skills
    const result = await prisma.userSkills.createMany({
      data: data,
    });

    return result;
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
