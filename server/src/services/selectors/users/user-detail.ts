import { ProjectPreviewSelector } from '../projects/project-preview.ts';
import { UserMajorSelector } from './parts/user-major.ts';
import { UserSkillSelector } from './parts/user-skill.ts';
import { UserSocialSelector } from './parts/user-social.ts';
import { UserPreviewSelector } from './user-preview.ts';

export const UserDetailSelector = Object.freeze({
  _count: {
    select: {
      following: true,
      followers: true,
      projectFollowings: true,
    },
  },
  ...UserPreviewSelector,
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
  majors: { select: UserMajorSelector },
  userSkills: {
    select: UserSkillSelector,
  },
  userSocials: {
    select: UserSocialSelector,
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
