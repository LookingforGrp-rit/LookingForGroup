import type {
  ProjectFollowsList,
  ProjectPreview,
  Role,
  UserDetail,
  UserFollowings,
  UserFollowsList,
  UserMember,
  UserPreview,
  UserSkill,
  UserSocial,
} from '@looking-for-group/shared';

export const blankUserSkill: UserSkill = {
  proficiency: 'Novice',
  position: 0,
  skillId: 0,
  label: '',
  type: 'Developer',
};

export const blankUserSocial: UserSocial = {
  url: '',
  websiteId: 0,
  label: '',
};

export const blankProjectFollowsList: ProjectFollowsList = {
  projects: [],
  count: 0,
  apiUrl: '',
};

export const blankUserFollowsList: UserFollowsList = {
  users: [],
  count: 0,
  apiUrl: '',
};

export const blankUserFollowings: UserFollowings = {
  senderId: 0,
  receiverId: 0,
  followedAt: Date.prototype,
  apiUrl: '',
};

export const blankUserPreview: UserPreview = {
  userId: 0,
  firstName: '',
  lastName: '',
  username: '',
  profileImage: null,
  apiUrl: '',
};

export const blankUserDetail: UserDetail = {
  headline: '',
  pronouns: '',
  title: '',
  majors: [],
  academicYear: null,
  location: '',
  funFact: '',
  bio: '',
  projects: [],
  skills: [],
  socials: [],
  following: {
    usersFollowing: {
      users: [],
      count: 0,
      apiUrl: '',
    },
    projectsFollowing: {
      projects: [],
      count: 0,
      apiUrl: '',
    },
  },
  followers: {
    users: [],
    count: 0,
    apiUrl: '',
  },
  userId: 0,
  firstName: '',
  lastName: '',
  username: '',
  profileImage: null,
  apiUrl: '',
};

export const blankUserMember: UserMember = {
  project: Object.prototype as ProjectPreview,
  role: Object.prototype as Role,
  memberSince: Date.prototype,
  apiUrl: '',
};
