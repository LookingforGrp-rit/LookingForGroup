import { ProjectPreviewSelector } from '../projects/project-preview.ts';
import { UserPreviewSelector } from '../users/user-preview.ts';
import { MePreviewSelector } from './me-preview.ts';
import { MyMajorSelector } from './my-major.ts';
import { MySkillSelector } from './my-skill.ts';
import { MySocialSelector } from './my-social.ts';

export const MeDetailSelector = Object.freeze({
  _count: {
    select: {
      following: true,
      followers: true,
      projectFollowings: true,
    },
  },
  ...MePreviewSelector,
  headline: true,
  pronouns: true,
  bio: true,
  academicYear: true,
  location: true,
  funFact: true,
  title: true,
  members: {
    select: {
      projects: {
        select: ProjectPreviewSelector,
      },
    },
  },
  majors: {
    select: MyMajorSelector,
  },
  userSkills: {
    select: MySkillSelector,
  },
  userSocials: {
    select: MySocialSelector,
  },
  projectFollowings: {
    select: {
      projects: {
        select: ProjectPreviewSelector,
      },
    },
  },
  following: {
    select: {
      senderUser: {
        select: UserPreviewSelector,
      },
    },
  },
  followers: {
    select: {
      receiverUser: {
        select: UserPreviewSelector,
      },
    },
  },
});
