import type {
  MePreview,
  MeDetail,
  MePrivate,
  MySkill,
  MySocial,
  MyMajor,
} from '@looking-for-group/shared';

export const blankMySkill: MySkill = {
  apiUrl: '',
  proficiency: 'Novice',
  position: 0,
  skillId: 0,
  label: '',
  type: 'Developer',
};

export const blankMySocial: MySocial = {
  apiUrl: '',
  url: '',
  websiteId: 0,
  label: '',
};

export const blankMePreview: MePreview = {
  userId: 0,
  firstName: '',
  lastName: '',
  username: '',
  profileImage: null,
  apiUrl: '',
};

export const blankMeDetail: MeDetail = {
  headline: '',
  pronouns: '',
  title: '',
  majors: [],
  academicYear: 'Freshman',
  location: '',
  funFact: '',
  bio: '',
  projects: [],
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
  skills: [],
  socials: [],
};

export const blankMePrivate: MePrivate = {
  ritEmail: '',
  visibility: 0,
  phoneNumber: null,
  universityId: '',
  createdAt: Date.prototype,
  updatedAt: Date.prototype,
  headline: '',
  pronouns: '',
  title: '',
  majors: [],
  academicYear: 'Freshman',
  location: '',
  funFact: '',
  bio: '',
  projects: [],
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
  skills: [],
  socials: [],
};

export const blankMyMajor: MyMajor = {
  apiUrl: '',
  majorId: 0,
  label: '',
};
