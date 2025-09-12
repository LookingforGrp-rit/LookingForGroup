import { SkillSelector } from '#services/selectors/datasets/skill.ts';

export const UserSkillSelector = Object.freeze({
  position: true,
  proficiency: true,
  skills: { select: SkillSelector },
});
