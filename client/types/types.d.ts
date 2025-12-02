import {
  AddProjectMediumsInput,
  AddProjectSocialInput,
  AddProjectTagsInput,
  CreateProjectImageInput,
  CreateProjectJobInput,
  CreateProjectMemberInput,
  UpdateProjectImageInput,
  UpdateProjectInput,
  UpdateProjectJobInput,
  UpdateProjectMemberInput,
  UpdateProjectSocialInput,
  ProjectDetail,
  ProjectImage,
  ProjectTag,
  ProjectSocial,
  ProjectJob,
  ProjectMedium,
  ProjectMember,
  UserPreview,
  UpdateProjectThumbnailInput,
  Role,
  AddUserMajorInput,
  AddUserSkillsInput,
  AddUserSocialInput,
  UpdateUserInput,
  UpdateUserSocialInput,
  UpdateUserSkillInput,
  AcademicYear,
  MyMember,
  MySkill,
  MeDetail,
  UpdateUserProjectVisibilityInput,
} from "@looking-for-group/shared";

/**
 * Nested modified {@link Partial}
 * @see {@link https://norday.tech/posts/2021/typescript-partial/}
 */
export type Fillable<T> = {
  [attr in keyof T]: T[attr] extends object
    ? Fillable<T[attr]> | null
    : T[attr] | null;
};

type Id = {
  id: {
    type: "canon" | "local";
    value: number;
  };
};
type CRUDRequest<T> = Id & { data: T };

type Pending<T> = Fillable<
  Omit<
    T,
    "apiUrl" | "createdAt" | "updatedAt" | "memberSince" | "imageId" | "jobId"
  >
> & { localId: number | null };

// PROFILE CHANGES

interface ProjectChanges {
  create: ProjectChangesCreates;
  update: ProjectChangesUpdates;
  delete: ProjectChangesDeletes;
}

interface ProjectChangesCreates {
  tags: CRUDRequest<AddProjectTagsInput>[];
  projectImages: CRUDRequest<CreateProjectImageInput>[];
  projectSocials: CRUDRequest<AddProjectSocialInput>[];
  jobs: CRUDRequest<CreateProjectJobInput>[];
  members: CRUDRequest<CreateProjectMemberInput>[];
  mediums: CRUDRequest<AddProjectMediumsInput>[];
}

interface ProjectChangesUpdates {
  fields: CRUDRequest<UpdateProjectInput>;
  thumbnail: CRUDRequest<UpdateProjectThumbnailInput>;
  projectImages: CRUDRequest<UpdateProjectImageInput>[];
  projectSocials: CRUDRequest<UpdateProjectSocialInput>[];
  jobs: CRUDRequest<UpdateProjectJobInput>[];
  members: CRUDRequest<UpdateProjectMemberInput>[];
}

interface ProjectChangesDeletes {
  tags: CRUDRequest<null>[];
  projectImages: CRUDRequest<null>[];
  projectSocials: CRUDRequest<null>[];
  jobs: CRUDRequest<null>[];
  members: CRUDRequest<null>[];
  mediums: CRUDRequest<null>[];
}

interface PendingProjectImage extends Pending<ProjectImage> {
  image: File | null;
}

interface PendingProjectMember extends Pending<ProjectMember> {
  user: UserPreview | null;
  role: Role | null;
}

type PendingProjectTag = Omit<ProjectTag, "apiUrl">;

type PendingProjectMedium = Omit<ProjectMedium, "apiUrl">;

interface PendingProject extends Omit<Pending<ProjectDetail>, "localId"> {
  thumbnail: ProjectImage | PendingProjectImage | null;
  tags: (ProjectTag | PendingProjectTag)[];
  projectImages: (ProjectImage | PendingProjectImage)[];
  projectSocials: (ProjectSocial | Pending<ProjectSocial>)[];
  jobs: (ProjectJob | Pending<ProjectJob>)[];
  members: (ProjectMember | PendingProjectMember)[];
  mediums: (ProjectMedium | PendingProjectMedium)[];
}

// USER CHANGES

interface UserChanges {
  create: UserChangesCreates;
  update: UserChangesUpdates;
  delete: UserChangesDeletes;
}

interface UserChangesCreates {
  majors: CRUDRequest<AddUserMajorInput>[];
  skills: CRUDRequest<AddUserSkillsInput>[];
  socials: CrudRequest<AddUserSocialInput>[];
}

interface UserChangesUpdates {
  fields: CRUDRequest<UpdateUserInput>;
  skills: CRUDRequest<UpdateUserSkillInput>[];
  socials: CRUDRequest<UpdateUserSocialInput>[];
  projectVisibilities: CRUDRequest<UpdateUserProjectVisibilityInput>[];
}

interface UserChangesDeletes {
  majors: CRUDRequest<null>[];
  skills: CRUDRequest<null>[];
  socials: CRUDRequest<null>[];
}

type PendingProfileImage = File;

interface PendingMajor extends Exclude<MyMajor, "apiUrl" | "majorId"> {
  localId: string;
};

interface PendingUserSkill extends Exclude<MySkill, "apiUrl" | "skillId"> {
  localId: string;
}

interface PendingUserSocial extends Exclude<MySocial, "apiUrl" | "websiteId"> {
  localId: string;
}

interface PendingUserMember extends Exclude<MyMember, "apiUrl"> {
  localId: string;
}

interface PendingUserProfile extends Exclude<MeDetail, "apiUrl"> {
  profileImage: string | null | PendingProfileImage;
  majors: (MyMajor | PendingMajor)[];
  academicYear: AcademicYear | null;
  projects: (MyMember | PendingUserMember)[];
  skills: (MySkill | PendingUserSkill)[];
  socials: (MySocial | PendingUserSocial)[];
}