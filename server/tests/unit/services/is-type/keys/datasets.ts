import type { Major, Medium, Role, Skill, Social, Tag } from '@looking-for-group/shared';

const blankMajor: Major = {
  majorId: 0,
  label: '',
};
export const majorKeys: (keyof Major)[] = Object.keys(blankMajor) as (keyof Major)[];

const blankRole: Role = {
  roleId: 0,
  label: '',
};
export const roleKeys: (keyof Role)[] = Object.keys(blankRole) as (keyof Role)[];

const blankSocial: Social = {
  websiteId: 0,
  label: '',
};
export const socialKeys: (keyof Social)[] = Object.keys(blankSocial) as (keyof Social)[];

const blankSkill: Skill = {
  skillId: 0,
  label: '',
  type: 'Developer',
};
export const skillKeys: (keyof Skill)[] = Object.keys(blankSkill) as (keyof Skill)[];

const blankTag: Tag = {
  tagId: 0,
  label: '',
  type: 'Music',
};
export const tagKeys: (keyof Tag)[] = Object.keys(blankTag) as (keyof Tag)[];

const blankMedium: Medium = {
  mediumId: 0,
  label: '',
};
export const mediumKeys: (keyof Medium)[] = Object.keys(blankMedium) as (keyof Medium)[];
