export interface SkillGroup<T> {
  /** Name shown in the group's header, e.g. "Developer" */
  label: string;
  /** Tag color name used by the `label-{color}` CSS classes */
  color: string;
  skills: T[];
}

// Display order, matching the tabs in the skills editor. Each type has its own tag color.
const GROUPS = [
  { type: 'Developer', color: 'yellow' },
  { type: 'Designer', color: 'red' },
  { type: 'Soft', color: 'purple' },
  { type: 'Audio', color: 'periwinkle' },
  { type: 'Engineer', color: 'cyan' },
];

const OTHER = { label: 'Other', color: 'grey' };

/**
 * Splits a person's skills into groups by skill type, so each color gets its own header.
 * Groups come in a fixed order, a group with no skills is left out, and skills with a type
 * we don't have a color for go in a final "Other" group. Skills keep their `position` order
 * within a group. The list passed in is not changed.
 *
 * @param skills - the person's skills
 * @returns the non-empty groups, in display order
 */
export function groupSkillsByType<T extends { type: string; position: number }>(
  skills: T[],
): SkillGroup<T>[] {
  const known = new Set(GROUPS.map((group) => group.type));
  const byPosition = [...skills].sort((a, b) => a.position - b.position);

  const groups: SkillGroup<T>[] = GROUPS.map((group) => ({
    label: group.type,
    color: group.color,
    skills: byPosition.filter((skill) => skill.type === group.type),
  }));
  groups.push({ ...OTHER, skills: byPosition.filter((skill) => !known.has(skill.type)) });

  return groups.filter((group) => group.skills.length > 0);
}
