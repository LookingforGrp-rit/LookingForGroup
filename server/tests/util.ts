import type { MePrivate } from '@looking-for-group/shared';

export const blankUserPriv: MePrivate = {
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
};
