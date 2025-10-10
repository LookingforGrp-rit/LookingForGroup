import type {
  ProjectFollowing,
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
  ProjectFollowsList,
} from '@looking-for-group/shared';

export const blankProjectImage: ProjectImage = {
  imageId: 0,
  image: '',
  altText: '',
  apiUrl: '',
};

export const blankProjectMedium: ProjectMedium = {
  apiUrl: '',
  mediumId: 0,
  label: '',
};

export const blankProjectFollowers: ProjectFollowers = {
  count: 0,
  users: [],
  apiUrl: '',
};

export const blankProjectMember: ProjectMember = {
  user: Object.prototype as UserPreview,
  role: Object.prototype as Role,
  memberSince: Date.prototype,
  apiUrl: '',
};

export const blankProjectSocial: ProjectSocial = {
  url: '',
  apiUrl: '',
  websiteId: 0,
  label: '',
};

export const blankProjectTag: ProjectTag = {
  apiUrl: '',
  tagId: 0,
  label: '',
  type: 'Music',
};

export const blankProjectJob: ProjectJob = {
  jobId: 0,
  role: Object.prototype as Role,
  availability: 'FullTime',
  duration: 'ShortTerm',
  location: 'OnSite',
  contact: Object.prototype as UserPreview,
  compensation: 'Unpaid',
  description: '',
  createdAt: Date.prototype,
  updatedAt: Date.prototype,
  apiUrl: '',
};

export const blankProjectPreview: ProjectPreview = {
  projectId: 0,
  title: '',
  hook: '',
  thumbnail: null,
  mediums: [],
  apiUrl: '',
};

export const blankProjectDetail: ProjectDetail = {
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

export const blankProjectFollowsList: ProjectFollowsList = {
  projects: [] as ProjectFollowing[],
  count: 5,
  apiUrl: '',
};

export const blankProjectWithFollowers: ProjectWithFollowers = {
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
