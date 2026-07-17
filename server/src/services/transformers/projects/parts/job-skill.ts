import type { JobSkill } from '@looking-for-group/shared';
import prisma from '#config/prisma.ts';
import { JobSkillSelector } from '#services/selectors/projects/parts/job-skill.ts';
import { transformSkill } from '#services/transformers/datasets/skill.ts';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sampleJobSkill = prisma.jobSkills.findMany({
  select: JobSkillSelector,
});

type JobSkillGetPayload = Awaited<typeof sampleJobSkill>[number];

//map to shared type
export const transformJobSkill = (
  apiUrl: string,
  { proficiency, skill: { category, skillId, label, type }, position }: JobSkillGetPayload,
): JobSkill => {
  return {
    apiUrl,
    ...transformSkill({ category, skillId, label, type }),
    position,
    proficiency,
  };
};
