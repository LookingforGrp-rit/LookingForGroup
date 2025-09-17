import type {
  MePreview,
  MeDetail,
  MePrivate,
  MySkill,
  MySocial,
  MyMajor,
} from '@looking-for-group/shared';
import { containsAllKeys } from './contains-all-keys.ts';
import { meDetailKeys, mePreviewKeys, myMajorKeys, mySkillKeys, mySocialKeys } from './keys/me.ts';

export const isMySkill = (obj: MySkill): void => {
  containsAllKeys('MySkill', obj, mySkillKeys);
};

export const isMySocial = (obj: MySocial): void => {
  containsAllKeys('MySocial', obj, mySocialKeys);
};

export const isMyMajor = (obj: MyMajor): void => {
  containsAllKeys('MyMajor', obj, myMajorKeys);
};

export const isMePreview = (obj: MePreview): void => {
  containsAllKeys('MePreview', obj, mePreviewKeys);
};

export const isMeDetail = (obj: MeDetail): void => {
  containsAllKeys('MeDetail', obj, meDetailKeys);
  obj.majors.forEach((major) => {
    isMyMajor(major);
  });
  obj.skills.forEach((skill) => {
    isMySkill(skill);
  });
  obj.socials.forEach((social) => {
    isMySocial(social);
  });
  // TODO add checks for projects, following, followers
};

export const isMePrivate = (obj: MePrivate): void => {
  //shut up eslint
  // TODO this
  containsAllKeys('MePrivate', obj, meDetailKeys);
};
