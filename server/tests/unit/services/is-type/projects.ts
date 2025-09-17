import type {
  ProjectFollowings,
  ProjectImage,
  ProjectMedium,
  ProjectFollowers,
  ProjectMember,
  ProjectSocial,
  ProjectTag,
  ProjectJob,
  ProjectDetail,
  ProjectPreview,
  ProjectWithFollowers,
} from '@looking-for-group/shared';
import { containsAllKeys } from './contains-all-keys.ts';
import { isRole } from './datasets.ts';
import {
  projectDetailKeys,
  projectFollowersKeys,
  projectFollowingsKeys,
  projectImageKeys,
  projectJobKeys,
  projectMediumKeys,
  projectMemberKeys,
  projectPreviewKeys,
  projectSocialKeys,
  projectTagKeys,
  projectWithFollowersKeys,
} from './keys/projects.ts';

export const isProjectFollowers = (obj: ProjectFollowers): void => {
  containsAllKeys('ProjectFollowers', obj, projectFollowersKeys);
};

export const isProjectFollowings = (obj: ProjectFollowings): void => {
  containsAllKeys('ProjectFollowings', obj, projectFollowingsKeys);
};

export const isProjectImage = (obj: ProjectImage): void => {
  containsAllKeys('ProjectImage', obj, projectImageKeys);
};

export const isProjectJob = (obj: ProjectJob): void => {
  containsAllKeys('ProjectJob', obj, projectJobKeys);
  isRole(obj.role);
};

export const isProjectMedium = (obj: ProjectMedium): void => {
  containsAllKeys('ProjectMedium', obj, projectMediumKeys);
};

export const isProjectMember = (obj: ProjectMember): void => {
  containsAllKeys('ProjectMember', obj, projectMemberKeys);
  // isUserPreview(obj.user);
  isRole(obj.role);
};

export const isProjectSocial = (obj: ProjectSocial): void => {
  containsAllKeys('ProjectSocial', obj, projectSocialKeys);
};

export const isProjectTag = (obj: ProjectTag): void => {
  containsAllKeys('ProjectTag', obj, projectTagKeys);
};

export const isProjectPreview = (obj: ProjectPreview): void => {
  containsAllKeys('ProjectPreview', obj, projectPreviewKeys);
  obj.mediums.forEach(isProjectMedium);
};

export const isProjectDetail = (obj: ProjectDetail): void => {
  containsAllKeys('ProjectDetail', obj, projectDetailKeys);
  obj.mediums.forEach(isProjectMedium);
  // isUserPreview(obj.owner);
  obj.tags.forEach(isProjectTag);
  obj.projectImages.forEach(isProjectImage);
  obj.projectSocials.forEach(isProjectSocial);
  obj.jobs.forEach(isProjectJob);
  obj.members.forEach(isProjectMember);
};

export const isProjectWithFollowers = (obj: ProjectWithFollowers): void => {
  containsAllKeys('ProjectWithFollowers', obj, projectWithFollowersKeys);
  obj.mediums.forEach(isProjectMedium);
  // isUserPreview(obj.owner);
  obj.tags.forEach(isProjectTag);
  obj.projectImages.forEach(isProjectImage);
  obj.projectSocials.forEach(isProjectSocial);
  obj.jobs.forEach(isProjectJob);
  obj.members.forEach(isProjectMember);
  isProjectFollowers(obj.followers);
};
