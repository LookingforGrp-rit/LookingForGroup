import { SkillSelector } from '#services/selectors/datasets/skill.ts';

export const JobSkillSelector = Object.freeze({
  proficiency: true,
  skill: {
    select: SkillSelector,
  },
  jobId: true,
});
