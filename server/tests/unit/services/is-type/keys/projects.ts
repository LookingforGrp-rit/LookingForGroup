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
  UserPreview,
  Role,
} from '@looking-for-group/shared';

const blankProjectFollowings: ProjectFollowings = {
  userId: 0,
  projectId: 0,
  followedAt: Date.prototype,
  apiUrl: '',
};
export const projectFollowingsKeys: (keyof ProjectFollowings)[] = Object.keys(
  blankProjectFollowings,
) as (keyof ProjectFollowings)[];

const blankProjectImage: ProjectImage = {
  imageId: 0,
  image: '',
  altText: '',
  apiUrl: '',
};
export const projectImageKeys: (keyof ProjectImage)[] = Object.keys(
  blankProjectImage,
) as (keyof ProjectImage)[];

const blankProjectMedium: ProjectMedium = {
  apiUrl: '',
  mediumId: 0,
  label: '',
};
export const projectMediumKeys: (keyof ProjectMedium)[] = Object.keys(
  blankProjectMedium,
) as (keyof ProjectMedium)[];

const blankProjectFollowers: ProjectFollowers = {
  count: 0,
  users: [],
  apiUrl: '',
};
export const projectFollowersKeys: (keyof ProjectFollowers)[] = Object.keys(
  blankProjectFollowers,
) as (keyof ProjectFollowers)[];

const blankProjectMember: ProjectMember = {
  user: Object.prototype as UserPreview,
  role: Object.prototype as Role,
  memberSince: Date.prototype,
  apiUrl: '',
};
export const projectMemberKeys: (keyof ProjectMember)[] = Object.keys(
  blankProjectMember,
) as (keyof ProjectMember)[];

const blankProjectSocial: ProjectSocial = {
  url: '',
  apiUrl: '',
  websiteId: 0,
  label: '',
};
export const projectSocialKeys: (keyof ProjectSocial)[] = Object.keys(
  blankProjectSocial,
) as (keyof ProjectSocial)[];

const blankProjectTag: ProjectTag = {
  apiUrl: '',
  tagId: 0,
  label: '',
  type: 'Music',
};
export const projectTagKeys: (keyof ProjectTag)[] = Object.keys(
  blankProjectTag,
) as (keyof ProjectTag)[];

const blankProjectJob: ProjectJob = {
  jobId: 0,
  role: Object.prototype as Role,
  availability: 'FullTime',
  duration: 'ShortTerm',
  location: 'OnSite',
  compensation: 'Unpaid',
  description: '',
  createdAt: Date.prototype,
  updatedAt: Date.prototype,
  apiUrl: '',
};
export const projectJobKeys: (keyof ProjectJob)[] = Object.keys(
  blankProjectJob,
) as (keyof ProjectJob)[];

const blankProjectPreview: ProjectPreview = {
  projectId: 0,
  title: '',
  hook: '',
  thumbnail: null,
  mediums: [],
  apiUrl: '',
};
export const projectPreviewKeys: (keyof ProjectPreview)[] = Object.keys(
  blankProjectPreview,
) as (keyof ProjectPreview)[];

const blankProjectDetail: ProjectDetail = {
  description: '',
  purpose: null,
  status: 'Planning',
  audience: '',
  createdAt: Date.prototype,
  updatedAt: Date.prototype,
  owner: Object.prototype as UserPreview,
  tags: [],
  projectImages: [],
  projectSocials: [],
  jobs: [],
  members: [],
  projectId: 0,
  title: '',
  hook: '',
  thumbnail: null,
  mediums: [],
  apiUrl: '',
};
export const projectDetailKeys: (keyof ProjectDetail)[] = Object.keys(
  blankProjectDetail,
) as (keyof ProjectDetail)[];

const blankProjectWithFollowers: ProjectWithFollowers = {
  followers: Object.prototype as ProjectFollowers,
  description: '',
  purpose: null,
  status: 'Planning',
  audience: '',
  createdAt: Date.prototype,
  updatedAt: Date.prototype,
  owner: Object.prototype as UserPreview,
  tags: [],
  projectImages: [],
  projectSocials: [],
  jobs: [],
  members: [],
  projectId: 0,
  title: '',
  hook: '',
  thumbnail: null,
  mediums: [],
  apiUrl: '',
};
export const projectWithFollowersKeys: (keyof ProjectWithFollowers)[] = Object.keys(
  blankProjectWithFollowers,
) as (keyof ProjectWithFollowers)[];
