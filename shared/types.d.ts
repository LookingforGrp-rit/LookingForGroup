import type { Request } from "express";

// Enums for better typing
export type SkillType = "Developer" | "Designer" | "Artist" | "Music" | "Soft";
export type TagType =
  | "Creative"
  | "Technical"
  | "Games"
  | "Multimedia"
  | "Music"
  | "Other"
  | "Developer Skill"
  | "Designer Skill"
  | "Soft Skill"
  | "Purpose";
export type AcademicYear =
  | "Freshman"
  | "Sophomore"
  | "Junior"
  | "Senior"
  | "Graduate";
export type SkillProficiency =
  | "Novice"
  | "Intermediate"
  | "Advanced"
  | "Expert";
export type ProjectPurpose =
  | "Personal"
  | "PortfolioPiece"
  | "Academic"
  | "CoOp";
export type ProjectStatus =
  | "Planning"
  | "Development"
  | "PostProduction"
  | "Complete";
export type JobAvailability = "FullTime" | "PartTime" | "Flexible";
export type JobDuration = "ShortTerm" | "LongTerm";
export type JobLocation = "OnSite" | "Remote" | "Hybrid";
export type JobCompensation = "Unpaid" | "Paid";
export type Visibility = "Public" | "Private";

//API REQUEST

export interface AuthenticatedRequest extends Request {
  currentUser: number;
}

export interface FilterRequest extends Request {
  strictness: "any" | "all";
  mentor?: boolean;
  designer?: boolean;
  developer?: boolean;
  skills?: number[];
  majors?: number[];
  academicYear?: string[];
  socials?: number[];
}

export interface GetProjectsRequest extends AuthenticatedRequest {
  visibility: "all" | "public" | "private";
  owner: "all" | "me";
}

//API RESPONSE

export interface ApiResponse<_data = any> {
  status: number;
  error?: string | null;
  data?: _data | null;
}

// DATASETS

export interface Role {
  roleId: number;
  label: string;
}

export interface Major {
  majorId: number;
  label: string;
}

export interface Tag {
  tagId: number;
  label: string;
  type: TagType;
}

export interface Social {
  websiteId: number;
  label: string;
}

export interface Skill {
  skillId: number;
  label: string;
  type: SkillType;
}

export interface Medium {
  mediumId: number;
  label: string;
}

//USER DATA

// Represents the member info for a project
export interface UserMember {
  project: ProjectPreview;
  role: Role;
  visibility: Visibility;
  memberSince: Date;
  apiUrl: string;
}

export interface UserSkill extends Skill {
  proficiency: SkillProficiency;
  position: number;
}

export interface UserSocial extends Social {
  url: string;
}

export type ProjectFollowsList = {
  projects: ProjectFollowing[];
  count: number;
  apiUrl: string;
};

export type UserFollowsList = {
  users: UserFollowing[];
  count: number;
  apiUrl: string;
};

export type UserFollowing = {
  user: UserPreview;
  followedAt: Date;
};

export type ProjectFollowing = {
  project: ProjectPreview;
  followedAt: Date;
};

export type ProjectFollower = {
  user: UserPreview;
  followedAt: Date;
};

// replacing this with above ^^^
// export type UserFollowings = {
//   senderId: number;
//   receiverId: number;
//   followedAt: Date;
//   apiUrl: string;
// };

// Represents the member info for a project
export interface MyMember {
  project: ProjectPreview;
  role: Role;
  visibility: Visibility;
  memberSince: Date;
  apiUrl: string;
}

export interface MySkill extends UserSkill {
  apiUrl: string;
}

export interface MySocial extends UserSocial {
  apiUrl: string;
}

export interface MyMajor extends Major {
  apiUrl: string;
}

export type MyFollowsList = {
  users: MyFollowing[];
  count: number;
  apiUrl: string;
};

export type MyFollowing = {
  user: UserPreview;
  followedAt: Date;
  apiUrl: string;
};

export type MyProjectFollowsList = {
  projects: MyProjectFollowing[];
  count: number;
  apiUrl: string;
};

export type MyProjectFollowing = {
  project: ProjectPreview;
  followedAt: Date;
  apiUrl: string;
};

// USERS

//show only preview data
export interface UserPreview {
  userId: number;
  firstName: string;
  lastName: string;
  username: string;
  profileImage: string | null;
  mentor: boolean;
  designer: boolean;
  developer: boolean;
  apiUrl: string;
  headline: string;
  pronouns: string;
  title: string;
  funFact: string;
  location: string;
  majors: Major[];
}

//show only non-sensitive data
export interface UserDetail extends UserPreview {
  academicYear: AcademicYear | null;
  bio: string;
  projects: UserMember[];
  skills: UserSkill[];
  socials: UserSocial[];
  following: {
    usersFollowing: UserFollowsList;
    projectsFollowing: ProjectFollowsList;
  };
  followers: UserFollowsList;
}

//all user private data
export interface User extends UserDetail {
  ritEmail: string;
  visibility: Visibility;
  phoneNumber: string | null;
  universityId: string;
  createdAt: Date;
  updatedAt: Date;
}

// ME

//show only preview data
export interface MePreview {
  userId: number;
  firstName: string;
  lastName: string;
  username: string;
  profileImage: string | null;
  mentor: boolean;
  designer: boolean;
  developer: boolean;
  apiUrl: string;
}

//show only non-sensitive data
export interface MeDetail extends MePreview {
  headline: string;
  pronouns: string;
  title: string;
  majors: MyMajor[];
  academicYear: AcademicYear;
  location: string;
  funFact: string;
  bio: string;
  mentor: boolean;
  projects: MyMember[];
  skills: MySkill[];
  socials: MySocial[];
  following: {
    usersFollowing: MyFollowsList;
    projectsFollowing: MyProjectFollowsList;
  };
  followers: UserFollowsList;
}

//all user private data
export interface MePrivate extends MeDetail {
  ritEmail: string;
  visibility: Visibility;
  phoneNumber: string | null;
  universityId: string;
  createdAt: Date;
  updatedAt: Date;
}

// PROjECT DATA

// export interface ProjectFollowings {
//   userId: number;
//   projectId: number;
//   followedAt: Date;
//   apiUrl: string;
// }

//images for projects
export interface ProjectImage {
  imageId: number;
  image: string;
  altText: string;
  apiUrl: string;
}

//mediums for projects
export interface ProjectMedium extends Medium {
  apiUrl: string;
}

//permissions not yet in database
export interface Member {
  projectId: number;
  user: UserPreview;
  role: Role;
  apiUrl: string;
  //permission: number;
}

// Represents the followers info for a project
export interface ProjectFollowers {
  count: number;
  users: ProjectFollower[];
  apiUrl: string;
}

// Represents the member info for a project
export interface ProjectMember {
  user: UserPreview;
  role: Role;
  memberSince: Date;
  apiUrl: string;
}

// Represents the social info for a project
export interface ProjectSocial extends Social {
  url: string;
  apiUrl: string;
}

export interface ProjectTag extends Tag {
  apiUrl: string;
}

// Represents the job info for a project
export interface ProjectJob {
  jobId: number;
  role: Role;
  availability: JobAvailability;
  duration: JobDuration;
  location: JobLocation;
  compensation: JobCompensation;
  contact: UserPreview;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  apiUrl: string;
}

// PROJECTS

export interface ProjectDetail extends ProjectPreview {
  description: string;
  purpose: ProjectPurpose | null;
  status: ProjectStatus;
  audience: string;
  createdAt: Date;
  updatedAt: Date;
  tags: Tag[];
  projectImages: ProjectImage[];
  projectSocials: ProjectSocial[];
  jobs: ProjectJob[];
  members: ProjectMember[];
}

//show only preview data
export interface ProjectPreview {
  projectId: number;
  title: string;
  hook: string;
  owner: UserPreview;
  thumbnail: ProjectImage | null;
  thumbnailId: number;
  mediums: ProjectMedium[];
  apiUrl: string;
}

// project with the followers data
export interface ProjectWithFollowers extends ProjectDetail {
  followers: ProjectFollowers;
}

//Jobs for projects
export interface Job {
  jobId: number;
  projectId: number;
  roleId: number;
  availability: JobAvailability;
  duration: JobDuration;
  location: JobLocation;
  compensation: JobCompensation;
  description: string;
  createdAt: Date;
  updatedAt: Date;
  apiUrl: string;
}

// IMAGES

export type ImageUploadResult = {
  location: string;
};

// API Inputs

// ME inputs

export type UpdateUserInput = Partial<
  Pick<
    MePrivate,
    | "firstName"
    | "lastName"
    | "headline"
    | "pronouns"
    | "title"
    | "academicYear"
    | "location"
    | "funFact"
    | "bio"
    | "phoneNumber"
  > & {
    profileImage?: File;
    mentor?: "true" | "false";
    visibility?: "1" | "0";
  }
>;

export type AddUserSocialInput = Pick<UserSocial, "websiteId" | "url">;
export type UpdateUserSocialInput = Partial<Pick<UserSocial, "url">>;

export type AddUserSkillsInput = Pick<
  UserSkill,
  "skillId" | "position" | "proficiency"
>;
export type UpdateUserSkillInput = Partial<
  Pick<UserSkill, "position" | "proficiency">
>;

export type AddUserMajorInput = Pick<Major, "majorId">;

export type UpdateUserProjectVisibilityInput = {
  visibility: Visibility;
};

// PROJECTS inputs
export type CreateProjectInput = Required<Pick<ProjectDetail, "title">> &
  Partial<
    Pick<
      ProjectDetail,
      "hook" | "description" | "status" | "audience" | "purpose"
    >
  >;
export type UpdateProjectInput = Partial<CreateProjectInput>;

export type CreateProjectImageInput = Pick<ProjectImage, "altText"> & {
  image: File;
};
export type UpdateProjectImageInput = Partial<CreateProjectImageInput>;
export type ReorderProjectImagesInput = {
  imageOrder: number[];
};

export type CreateProjectMemberInput = {
  userId: number;
  roleId?: number;
};
export type UpdateProjectMemberInput = Partial<
  Pick<CreateProjectMemberInput, "roleId">
>;

export type AddProjectSocialInput = Pick<ProjectSocial, "websiteId" | "url">;
export type UpdateProjectSocialInput = Partial<Pick<ProjectSocial, "url">>;
export type UpdateProjectThumbnailInput = {
  thumbnail: number;
};

export type AddProjectTagsInput = Pick<ProjectTag, "tagId">;

export type AddProjectMediumsInput = Pick<ProjectMedium, "mediumId">;

export type CreateProjectJobInput = Required<
  Pick<ProjectJob, "availability" | "duration" | "location" | "compensation">
> &
  Partial<Pick<ProjectJob, "description">> & {
    roleId: number;
    contactUserId: number;
  };

export type UpdateProjectJobInput = Partial<CreateProjectJobInput>;
