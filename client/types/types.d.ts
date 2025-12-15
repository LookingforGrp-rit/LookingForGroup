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

/**
 * Contains a type and a value.
 * The type refers to whether a resource exists canonically or locally.
 * A good rule of thumb is if the resource already has an ID on the server,
 * it is a canon id. If the ID *will* be created once the request is handled,
 * then the resource will have a local ID that will be replaced once the
 * resource is created on the server.
 */
type Id = {
  id: {
    type: "canon" | "local";
    value: number;
  };
};

/**
 * The id corresponding to the resource and the data to use as the request body
 */
type CRUDRequest<T> = Id & { data: T };

/**
 * Helper function to remove server-created properties and allow for null values.
 */
type Pending<T> = Fillable<
  Omit<
    T,
    "apiUrl" | "createdAt" | "updatedAt" | "memberSince" | "imageId" | "jobId"
  >
> & { localId: number | null };

// PROJECT CHANGES

/**
 * All changes to be made to a project
 */
interface ProjectChanges {
  /**
   * All resources to be created
   */
  create: ProjectChangesCreates;
  /**
   * All resources to be updated
   */
  update: ProjectChangesUpdates;
  /**
   * All resources to be deleted
   */
  delete: ProjectChangesDeletes;
}

/**
 * All resources to be created
 */
interface ProjectChangesCreates {
  /**
   * All tags to be created
   */
  tags: CRUDRequest<AddProjectTagsInput>[];

  /**
   * All project images to be created
   */
  projectImages: CRUDRequest<CreateProjectImageInput>[];

  /**
   * All project socials to be created
   */
  projectSocials: CRUDRequest<AddProjectSocialInput>[];

  /**
   * All jobs to be created
   */
  jobs: CRUDRequest<CreateProjectJobInput>[];

  /**
   * All members to be created
   */
  members: CRUDRequest<CreateProjectMemberInput>[];

  /**
   * All mediums to be created
   */
  mediums: CRUDRequest<AddProjectMediumsInput>[];
}

/**
 * All resources to be updated
 */
interface ProjectChangesUpdates {
  /**
   * The basic info to be updated
   */
  fields: CRUDRequest<UpdateProjectInput>;

  /**
   * The thumbnail to be updated
   */
  thumbnail: CRUDRequest<UpdateProjectThumbnailInput>;
  
  /**
   * All images to be updated
   */
  projectImages: CRUDRequest<UpdateProjectImageInput>[];

  /**
   * All socials to be updated
   */
  projectSocials: CRUDRequest<UpdateProjectSocialInput>[];

  /**
   * All jobs to be updated
   */
  jobs: CRUDRequest<UpdateProjectJobInput>[];

  /**
   * All members to be updated
   */
  members: CRUDRequest<UpdateProjectMemberInput>[];
}

/**
 * All resources to be delted
 */
interface ProjectChangesDeletes {
  /**
   * All tags to be deleted
   */
  tags: CRUDRequest<null>[];

  /**
   * All project images to be deleted
   */
  projectImages: CRUDRequest<null>[];

  /**
   * All project socials to be deleted
   */
  projectSocials: CRUDRequest<null>[];

  /**
   * All jobs to be deleted
   */
  jobs: CRUDRequest<null>[];

  /**
   * All members to be deleted
   */
  members: CRUDRequest<null>[];

  /**
   * All mediums to be deleted
   */
  mediums: CRUDRequest<null>[];
}

/**
 * An image that hasn't been saved on the server yet
 */
interface PendingProjectImage extends Pending<ProjectImage> {
  image: File | null;
}

/**
 * A member that hasn't been saved on the server yet
 */
interface PendingProjectMember extends Pending<ProjectMember> {
  user: UserPreview | null;
  role: Role | null;
}

/**
 * A project tag that hasn't been saved on the server yet
 */
type PendingProjectTag = Omit<ProjectTag, "apiUrl">;

/**
 * A project medium that hasn't been saved on the server yet
 */
type PendingProjectMedium = Omit<ProjectMedium, "apiUrl">;

/**
 * A project with unsaved local changes
 */
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

/**
 * All changes to be made to a user
 */
interface UserChanges {
  /**
   * All resources to be created
   */
  create: UserChangesCreates;

  /**
   * All resources to be updated
   */
  update: UserChangesUpdates;

  /**
   * All resources to be deleted
   */
  delete: UserChangesDeletes;
}

/**
 * All resources to be created
 */
interface UserChangesCreates {
  /**
   * All majors to be created
   */
  majors: CRUDRequest<AddUserMajorInput>[];

  /**
   * All skills to be created
   */
  skills: CRUDRequest<AddUserSkillsInput>[];

  /**
   * All socials to be created
   */
  socials: CrudRequest<AddUserSocialInput>[];
}

/**
 * All resources to be updated
 */
interface UserChangesUpdates {
  /**
   * All basic info to be updated
   */
  fields: CRUDRequest<UpdateUserInput>;

  /**
   * All skills to be updated
   */
  skills: CRUDRequest<UpdateUserSkillInput>[];

  /**
   * All socials to be updated
   */
  socials: CRUDRequest<UpdateUserSocialInput>[];

  /**
   * All project visibilities to be updated
   */
  projectVisibilities: CRUDRequest<UpdateUserProjectVisibilityInput>[];
}

/**
 * All resources to be deleted
 */
interface UserChangesDeletes {
  /**
   * All majors to be deleted
   */
  majors: CRUDRequest<null>[];

  /**
   * All skills to be deleted
   */
  skills: CRUDRequest<null>[];

  /**
   * All socials to be deleted
   */
  socials: CRUDRequest<null>[];
}

/**
 * A profile image that hasn't been uploaded yet
 */
type PendingProfileImage = File;

/**
 * A major that hasn't been added on the server yet
 */
interface PendingMajor extends Exclude<MyMajor, "apiUrl" | "majorId"> {
  localId: string;
}

/**
 * A user skill that hasn't been saved on the server yet
 */
interface PendingUserSkill extends Exclude<MySkill, "apiUrl" | "skillId"> {
  localId: string;
}

/**
 * A user social that hasn't been saved on the server yet
 */
interface PendingUserSocial extends Exclude<MySocial, "apiUrl" | "websiteId"> {
  localId: number;
}

/**
 * A project membership that hasn't been saved on the server yet
 */
interface PendingUserMember extends Exclude<MyMember, "apiUrl"> {
  localId: string;
}

/**
 * A user with unsaved local changes
 */
interface PendingUserProfile extends Exclude<MeDetail, "apiUrl"> {
  profileImage: string | null | PendingProfileImage;
  majors: (MyMajor | PendingMajor)[];
  academicYear: AcademicYear | null;
  projects: (MyMember | PendingUserMember)[];
  skills: (MySkill | PendingUserSkill)[];
  socials: (MySocial | PendingUserSocial)[];
}
