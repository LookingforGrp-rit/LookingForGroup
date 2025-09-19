import type {
  MePreview,
  MeDetail,
  MePrivate,
  MySkill,
  MySocial,
  MyMajor,
} from '@looking-for-group/shared';
import {
  blankMySkill,
  blankMySocial,
  blankMeDetail,
  blankMePreview,
  blankMePrivate,
  blankMyMajor,
} from '../../../blanks/me.ts';

export const mySkillKeys: (keyof MySkill)[] = Object.keys(blankMySkill) as (keyof MySkill)[];

export const mySocialKeys: (keyof MySocial)[] = Object.keys(blankMySocial) as (keyof MySocial)[];

export const myMajorKeys: (keyof MyMajor)[] = Object.keys(blankMyMajor) as (keyof MyMajor)[];

export const mePreviewKeys: (keyof MePreview)[] = Object.keys(
  blankMePreview,
) as (keyof MePreview)[];

export const meDetailKeys: (keyof MeDetail)[] = Object.keys(blankMeDetail) as (keyof MeDetail)[];

export const mePrivateKeys: (keyof MePrivate)[] = Object.keys(
  blankMePrivate,
) as (keyof MePrivate)[];
