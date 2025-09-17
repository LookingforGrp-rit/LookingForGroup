import type {
  MePreview,
  MeDetail,
  MePrivate,
  MySkill,
  MySocial,
  MyMajor,
} from '@looking-for-group/shared';

const blankMySkill: MySkill = {
  apiUrl: '',
  proficiency: 'Novice',
  position: 0,
  skillId: 0,
  label: '',
  type: 'Developer',
};
export const mySkillKeys: (keyof MySkill)[] = Object.keys(blankMySkill) as (keyof MySkill)[];

const blankMySocial: MySocial = {
  apiUrl: '',
  url: '',
  websiteId: 0,
  label: '',
};
export const mySocialKeys: (keyof MySocial)[] = Object.keys(blankMySocial) as (keyof MySocial)[];

const blankMyMajor: MyMajor = {
  apiUrl: '',
  majorId: 0,
  label: '',
};
export const myMajorKeys: (keyof MyMajor)[] = Object.keys(blankMyMajor) as (keyof MyMajor)[];

const blankMePreview: MePreview = {
  userId: 0,
  firstName: '',
  lastName: '',
  username: '',
  profileImage: null,
  apiUrl: '',
};
export const mePreviewKeys: (keyof MePreview)[] = Object.keys(
  blankMePreview,
) as (keyof MePreview)[];

const blankMeDetali: MeDetail = {
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
export const meDetailKeys: (keyof MeDetail)[] = Object.keys(blankMeDetali) as (keyof MeDetail)[];

const blankMePrivate: MePrivate = {
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
export const mePrivateKeys: (keyof MePrivate)[] = Object.keys(
  blankMePrivate,
) as (keyof MePrivate)[];
