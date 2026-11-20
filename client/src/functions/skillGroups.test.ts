import { describe, expect, it } from 'vitest';
import { groupSkillsByType } from './skillGroups';

const skill = (label: string, type: string, position: number) => ({ label, type, position });

describe('groupSkillsByType', () => {
  it('puts each skill type in its own group with that type\'s color', () => {
    const groups = groupSkillsByType([
      skill('React', 'Developer', 0),
      skill('Figma', 'Designer', 1),
      skill('Teamwork', 'Soft', 2),
      skill('Mixing', 'Audio', 3),
      skill('Unity', 'Engineer', 4),
    ]);

    expect(groups.map((g) => [g.label, g.color])).toStrictEqual([
      ['Developer', 'yellow'],
      ['Designer', 'red'],
      ['Soft', 'purple'],
      ['Audio', 'periwinkle'],
      ['Engineer', 'cyan'],
    ]);
  });

  it('uses a fixed group order whatever order the skills arrive in', () => {
    const groups = groupSkillsByType([
      skill('Teamwork', 'Soft', 0),
      skill('Mixing', 'Audio', 1),
      skill('React', 'Developer', 2),
    ]);

    expect(groups.map((g) => g.label)).toStrictEqual(['Developer', 'Soft', 'Audio']);
  });

  it('leaves out groups with no skills', () => {
    const groups = groupSkillsByType([skill('React', 'Developer', 0)]);

    expect(groups).toHaveLength(1);
    expect(groups[0].label).toBe('Developer');
  });

  it('keeps the position order inside a group', () => {
    const [developers] = groupSkillsByType([
      skill('C#', 'Developer', 5),
      skill('React', 'Developer', 1),
      skill('CSS', 'Developer', 3),
    ]);

    expect(developers.skills.map((s) => s.label)).toStrictEqual(['React', 'CSS', 'C#']);
  });

  it('puts unknown types in a grey "Other" group at the end', () => {
    const groups = groupSkillsByType([
      skill('Juggling', 'Circus', 0),
      skill('React', 'Developer', 1),
    ]);

    expect(groups.map((g) => [g.label, g.color])).toStrictEqual([
      ['Developer', 'yellow'],
      ['Other', 'grey'],
    ]);
    expect(groups[1].skills[0].label).toBe('Juggling');
  });

  it('returns no groups when there are no skills', () => {
    expect(groupSkillsByType([])).toStrictEqual([]);
  });

  it('does not change the list it was given', () => {
    const input = [skill('B', 'Developer', 2), skill('A', 'Developer', 1)];
    const copy = [...input];

    groupSkillsByType(input);

    expect(input).toStrictEqual(copy);
  });
});
