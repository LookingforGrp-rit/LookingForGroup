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
} from "@looking-for-group/shared";

/**
 * Nested modified {@link Partial}
 * @see {@link https://norday.tech/posts/2021/typescript-partial/}
 */
export type Fillable<T> = {
  [attr in keyof T]: T[attr] extends object
    ? Fillable<T[attr]>
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

type Id = { id: number };
type CRUDRequest<T> = Id & { data: T };
