import type { Major, Medium, Role, Skill, Social, Tag } from '@looking-for-group/shared';
import { containsAllKeys } from './contains-all-keys.ts';
import {
  majorKeys,
  mediumKeys,
  roleKeys,
  skillKeys,
  socialKeys,
  tagKeys,
} from './keys/datasets.ts';

export const isMajor = (obj: Major): void => {
  containsAllKeys('Major', obj, majorKeys);
};

export const isRole = (obj: Role): void => {
  containsAllKeys('Role', obj, roleKeys);
};

export const isSocial = (obj: Social): void => {
  containsAllKeys('Social', obj, socialKeys);
};

export const isSkill = (obj: Skill): void => {
  containsAllKeys('Skill', obj, skillKeys);
};

export const isTag = (obj: Tag): void => {
  containsAllKeys('Tag', obj, tagKeys);
};

export const isMedium = (obj: Medium): void => {
  containsAllKeys('Medium', obj, mediumKeys);
};
