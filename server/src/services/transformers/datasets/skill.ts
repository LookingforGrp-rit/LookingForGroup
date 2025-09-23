import type { Skill, SkillType } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { SkillSelector } from '#services/selectors/datasets/skill.ts';

//sample project from prisma to be mapped
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleSkills = prisma.skills.findMany({
  select: SkillSelector,
});

type SkillsGetPayload = Awaited<typeof sampleSkills>[number];

//map to shared type
export const transformSkill = ({ skillId, label, type }: SkillsGetPayload): Skill => {
  return {
    skillId,
    label,
    type: type as SkillType,
  };
};
