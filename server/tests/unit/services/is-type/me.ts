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
import { isProjectPreview } from './projects.ts';

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
  obj.majors.forEach(isMyMajor);
  obj.skills.forEach(isMySkill);
  obj.socials.forEach(isMySocial);
  obj.projects.forEach(isProjectPreview);
  // isUserFollowsList(obj.followers);
  // isUserFollowsList(obj.following.usersFollowing);
  // isProjectFollowsList(obj.following.projectsFollowing);
};

export const isMePrivate = (obj: MePrivate): void => {
  containsAllKeys('MePrivate', obj, meDetailKeys);
  obj.majors.forEach(isMyMajor);
  obj.skills.forEach(isMySkill);
  obj.socials.forEach(isMySocial);
  obj.projects.forEach(isProjectPreview);
  // isUserFollowsList(obj.followers);
  // isUserFollowsList(obj.following.usersFollowing);
  // isProjectFollowsList(obj.following.projectsFollowing);
};
