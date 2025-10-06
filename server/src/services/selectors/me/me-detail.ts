import { ProjectPreviewSelector } from '../projects/project-preview.ts';
import { UserPreviewSelector } from '../users/user-preview.ts';
import { MePreviewSelector } from './me-preview.ts';
import { MyMajorSelector } from './parts/my-major.ts';
import { MyMemberSelector } from './parts/my-member.ts';
import { MySkillSelector } from './parts/my-skill.ts';
import { MySocialSelector } from './parts/my-social.ts';

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
    select: MyMemberSelector,
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
      createdAt: true,
    },
  },
  following: {
    select: {
      receiverUser: {
        select: UserPreviewSelector,
      },
      createdAt: true,
    },
  },
  followers: {
    select: {
      senderUser: {
        select: UserPreviewSelector,
      },
      createdAt: true,
    },
  },
});
