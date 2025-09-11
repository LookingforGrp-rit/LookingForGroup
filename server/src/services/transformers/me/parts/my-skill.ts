import type { MySkill } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { MySkillSelector } from '#services/selectors/me/parts/my-skill.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleSkills = prisma.userSkills.findMany({
  select: MySkillSelector,
});

type UserSkillsGetPayload = Awaited<typeof sampleSkills>[number];

//map to shared type
export const transformMySkill = ({
  proficiency,
  position,
  skills: { skillId, label, type },
}: UserSkillsGetPayload): MySkill => {
  return {
    apiUrl: `api/me/skills/${skillId.toString()}`,
    proficiency,
    position,
    skillId,
    label,
    type,
  };
};
