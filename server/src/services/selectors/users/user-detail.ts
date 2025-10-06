import { ProjectPreviewSelector } from '../projects/project-preview.ts';
import { UserMajorSelector } from './parts/user-major.ts';
import { UserMemberSelector } from './parts/user-member.ts';
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
    select: UserMemberSelector,
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
      followedAt: true,
    },
  },
  following: {
    select: {
      receiverUser: {
        select: UserPreviewSelector,
      },
      followedAt: true,
    },
  },
  followers: {
    select: {
      senderUser: {
        select: UserPreviewSelector,
      },
      followedAt: true,
    },
  },
});
