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

export interface ProjectChanges {
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
  thumbnail: CRUDRequest<UpdateProjectThumbnailInput>,
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
