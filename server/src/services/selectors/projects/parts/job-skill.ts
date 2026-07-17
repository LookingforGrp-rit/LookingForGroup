import { SkillSelector } from '#services/selectors/datasets/skill.ts';

export const JobSkillSelector = Object.freeze({
  proficiency: true,
  position: true,
  skill: {
    select: SkillSelector,
  },
});
