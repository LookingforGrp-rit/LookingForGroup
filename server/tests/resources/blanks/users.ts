import type {
  ProjectPreview,
  UserPreview,
  UserSkill,
  UserSocial,
  ProjectFollowsList,
  UserFollowsList,
  UserDetail,
  Major,
  User,
  UserMember,
  Role,
  ProjectFollowing,
  UserFollowing,
} from '@looking-for-group/shared';

export const blankUserSkill: UserSkill = {
  skillId: 1,
  label: '',
  type: 'Developer',
  proficiency: 'Novice',
  position: 0,
};

export const blankUserSocial: UserSocial = {
  websiteId: 1,
  label: '',
  url: '',
};

export const blankProjectFollowsList: ProjectFollowsList = {
  projects: Object.prototype as ProjectFollowing[],
  count: 0,
  apiUrl: '',
};

export const blankUserFollowsList: UserFollowsList = {
  users: Object.prototype as UserFollowing[],
  count: 0,
  apiUrl: '',
};

//james testguy shall live on
export const blankUserPreview: UserPreview = {
  userId: 0,
  firstName: 'James',
  lastName: 'Testguy',
  username: 'TESTGUY',
  profileImage: null,
  mentor: false,
  designer: false,
  developer: false,
  apiUrl: '',
};

export const blankUserDetail: UserDetail = {
  headline: '',
  pronouns: '',
  title: '',
  majors: Object.prototype as Major[],
  academicYear: 'Freshman',
  location: '',
  funFact: '',
  bio: '',
  mentor: false,
  designer: false,
  developer: false,
  projects: Object.prototype as UserMember[],
  skills: Object.prototype as UserSkill[],
  socials: Object.prototype as UserSocial[],
  following: {
    usersFollowing: Object.prototype as UserFollowsList,
    projectsFollowing: Object.prototype as ProjectFollowsList,
  },
  followers: Object.prototype as UserFollowsList,
  userId: 0,
  firstName: 'James',
  lastName: 'Testguy',
  username: 'TESTGUY',
  profileImage: null,
  apiUrl: '',
};

//all user private data
export const blankUser: User = {
  ritEmail: '',
  visibility: 1,
  projects: Object.prototype as UserMember[],
  phoneNumber: '',
  universityId: '',
  createdAt: Date.prototype,
  updatedAt: Date.prototype,
  headline: '',
  pronouns: '',
  title: '',
  majors: Object.prototype as Major[],
  academicYear: 'Freshman',
  location: '',
  funFact: '',
  bio: '',
  mentor: false,
  designer: false,
  developer: false,
  skills: Object.prototype as UserSkill[],
  socials: Object.prototype as UserSocial[],
  following: {
    usersFollowing: Object.prototype as UserFollowsList,
    projectsFollowing: Object.prototype as ProjectFollowsList,
  },
  followers: Object.prototype as UserFollowsList,
  userId: 0,
  firstName: 'James',
  lastName: 'Testguy',
  username: 'TESTGUY',
  profileImage: null,
  apiUrl: '',
};

// Represents the member info for a project
export const blankUserMember: UserMember = {
  project: Object.prototype as ProjectPreview,
  role: Object.prototype as Role,
  visibility: 'Private',
  memberSince: Date.prototype,
  apiUrl: '',
};
