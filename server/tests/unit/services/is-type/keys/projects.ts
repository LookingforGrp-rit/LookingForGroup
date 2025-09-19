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
import {
  blankProjectFollowings,
  blankProjectImage,
  blankProjectMedium,
  blankProjectFollowers,
  blankProjectMember,
  blankProjectSocial,
  blankProjectTag,
  blankProjectJob,
  blankProjectPreview,
  blankProjectDetail,
  blankProjectWithFollowers,
} from '../../../blanks/projects.ts';

export const projectFollowingsKeys: (keyof ProjectFollowings)[] = Object.keys(
  blankProjectFollowings,
) as (keyof ProjectFollowings)[];

export const projectImageKeys: (keyof ProjectImage)[] = Object.keys(
  blankProjectImage,
) as (keyof ProjectImage)[];

export const projectMediumKeys: (keyof ProjectMedium)[] = Object.keys(
  blankProjectMedium,
) as (keyof ProjectMedium)[];

export const projectFollowersKeys: (keyof ProjectFollowers)[] = Object.keys(
  blankProjectFollowers,
) as (keyof ProjectFollowers)[];

export const projectMemberKeys: (keyof ProjectMember)[] = Object.keys(
  blankProjectMember,
) as (keyof ProjectMember)[];

export const projectSocialKeys: (keyof ProjectSocial)[] = Object.keys(
  blankProjectSocial,
) as (keyof ProjectSocial)[];

export const projectTagKeys: (keyof ProjectTag)[] = Object.keys(
  blankProjectTag,
) as (keyof ProjectTag)[];

export const projectJobKeys: (keyof ProjectJob)[] = Object.keys(
  blankProjectJob,
) as (keyof ProjectJob)[];

export const projectPreviewKeys: (keyof ProjectPreview)[] = Object.keys(
  blankProjectPreview,
) as (keyof ProjectPreview)[];

export const projectDetailKeys: (keyof ProjectDetail)[] = Object.keys(
  blankProjectDetail,
) as (keyof ProjectDetail)[];

export const projectWithFollowersKeys: (keyof ProjectWithFollowers)[] = Object.keys(
  blankProjectWithFollowers,
) as (keyof ProjectWithFollowers)[];
