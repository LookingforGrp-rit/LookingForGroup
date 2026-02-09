import type { Request } from "express";

// Enums for better typing
export type SkillType = "Developer" | "Designer" | "FArtist" | "Music" | "Soft";
export type TagType =
  | "Creative"
  | "Technical"
  | "Games"
  | "Multimedia"
  | "Music"
  | "Other"
  | "Developer"
  | "Designer"
  | "Soft"
  | "Purpose"
  | "Project Type"
  | "Role"
  | "Major";
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

// Structures for type management
export interface StringDictionary<T> {
	[key : string]: T;
}

export interface NumberDictionary<T> {
  [key : number] : T;
}

interface ProjectType {
  project_type: string;
}

export type ProjectInfoStage = "Preview" | "Detail" | "Full";

export interface StructuredProjectInfo {
  preview? : ProjectPreview;
  detail? : ProjectDetail;
  full? : ProjectWithFollowers;
}

export interface StructuredUserInfo {
  preview? : UserPreview;
  detail? : UserDetail;
}

export interface UserAndProjectInfo {
  tags?: Tag[];
  title?: string;
  hook?: string;
  project_types?: ProjectType[];
  job_title?: string;
  major?: string;
  skills?: Skill[];
  first_name?: string;
  last_name?: string;
  username?: string;
  name?: string;
  bio?: string;
  projectId?: number;
  userId?: number;
}

//API REQUEST

/**
 * A request that has been made by an authenticated user.
 * Used for routes that make changes to a logged-in user
 */
export interface AuthenticatedRequest extends Request {
  currentUser: number;
}

//API RESPONSE

/**
 * Standard response for all API requests
 */
export interface ApiResponse<_data = any> {
  /**
   * Status code
   */
  // TODO redundant, remove
  status: number;

  /**
   * Error message
   */
  // TODO either remove nullable or optional
  error?: string | null;

  /**
   * Response data if successful
   */
  // TODO either remove nullable or optional
  data?: _data | null;
}

export interface UserIdentifiers {
  userId : number,
  username : string,
}

export interface UsernameResponse extends ApiResponse {
  data?: UserIdentifiers;
}

// DATASETS

/**
 * Roles refer to a project member's function within that project.
 * A user in multiple projects may have different roles in each.
 * If a member of a project was a "Backend Developer", then that would be their role.
 */
export interface Role {
  /**
   * The database ID corresponding with the role
   */
  roleId: number;

  /**
   * The name of the role, such as "Backend Developer"
   */
  label: string;
}

/**
 * Majors refer to a user's major. Users may have multiple majors
 */
export interface Major {
  /**
   * The database ID corresponding with the major
   */
  majorId: number;

  /**
   * The name of the major, such as "New Media Interactive Developement"
   */
  label: string;
}

/**
 * Tags refer to attributes attached to projects.
 * These refer to desired skills a project is looking for or genres a project fits into.
 */
export interface Tag {
  /**
   * The database ID corresponding with the tag
   */
  tagId: number;

  /**
   * The name of the tag, such as "First-Person Shooter"
   */
  label: string;

  /**
   * The type of tag, such as "Purpose"
   */
  type: TagType;
}

/**
 * Socials refer to links to external social media accounts for users and projects.
 * A user or project is currently limited to one social link for each social media website.
 */
export interface Social {
  /**
   * The database ID corresponding to the website for which the social links to
   */
  websiteId: number;

  /**
   * The name of the website, such as "Discord"
   */
  label: string;
}

/**
 * Skills refer to skills a user has. The skills are categorized by area of expertise.
 */
export interface Skill {
  /**
   * The database ID corresponding to the skill
   */
  skillId: number;

  /**
   * The name of the skill, such as "Figma"
   */
  label: string;

  /**
   * The type of skill, such as "Designer"
   */
  type: SkillType;
}

/**
 * Mediums refer to the medium through which a project is experienced.
 */
export interface Medium {
  /**
   * The database ID corresponding to the medium
   */
  mediumId: number;

  /**
   * The name of the medium, such as "Video Game"
   */
  label: string;
}

//USER DATA

/**
 * Represents all membership info as it relates to a user who is a member of a project
 */
export interface UserMember {
  /**
   * The project the user is a member of
   */
  project: ProjectPreview;

  /**
   * The user's role in the project
   */
  role: Role;

  /**
   * Is this project visible on the user's profile?
   */
  visibility: Visibility;

  /**
   * The date the user became a member
   */
  memberSince: Date;

  /**
   * Location of this resource on the server
   */
  apiUrl: string;
}

/**
 * Represents all info for a skill that a user has
 */
export interface UserSkill extends Skill {
  /**
   * How proficient is the user in this skill
   */
  proficiency: SkillProficiency;

  /**
   * What position should this skill be ordered in on the user's profile
   */
  position: number;
}

/**
 * Represents all info for a social media account that a user has
 */
export interface UserSocial extends Social {
  /**
   * The url to the user's social media account
   */
  url: string;
}

/**
 * Represents all info about projects that a user is following
 */
export type ProjectFollowsList = {
  /**
   * The projects the user follows
   */
  projects: ProjectFollowing[];

  /**
   * The total number of projects a user follows
   */
  count: number;

  /**
   * Location of this resource on the server
   */
  apiUrl: string;
};

/**
 * Represents all info about users that a known user is following or followed by
 */
export type UserFollowsList = {
  /**
   * The users that the user either follows or is followed by
   */
  users: UserFollowing[];

  /**
   * The total number of users the user follows or is followed by
   */
  count: number;

  /**
   * Location of this resource on the server
   */
  apiUrl: string;
};

/**
 * Represents a follow between the a known user and another
 */
export type UserFollowing = {
  /**
   * The other user
   */
  user: UserPreview;

  /**
   * The date the follow occured
   */
  followedAt: Date;
};

/**
 * Represents a project that was followed by a known user
 */
export type ProjectFollowing = {
  /**
   * The project that was followed
   */
  project: ProjectPreview;

  /**
   * The date the follow occured
   */
  followedAt: Date;
};

/**
 * Represents a user that follows a known project
 */
export type ProjectFollower = {
  /**
   * The user that followed the project
   */
  user: UserPreview;

  /**
   * The date the follow occured
   */
  followedAt: Date;
};

/**
 *  Represents all membership info as it relates to a project that the logged-in user is a member of
 */
export interface MyMember {
  /**
   * The project the logged-in user is a member of
   */
  project: ProjectPreview;

  /**
   * The logged-in user's role in the project
   */
  role: Role;

  /**
   * Is this project visible on the logged-in user's profile?
   */
  visibility: Visibility;

  /**
   * The date the logged-in user became a member
   */
  memberSince: Date;

  /**
   * Location of this resource on the server
   */
  apiUrl: string;
}

/**
 * Represents all info for a skill that the logged-in user has
 */
export interface MySkill extends UserSkill {
  /**
   * Location of this resource on the server
   */
  apiUrl: string;
}

/**
 * Represents all info for a social media account that the logged-in user has
 */
export interface MySocial extends UserSocial {
  /**
   * Location of this resource on the server
   */
  apiUrl: string;
}

/**
 * Represents all info for a major that the logged-in user is in
 */
export interface MyMajor extends Major {
  /**
   * Location of this resource on the server
   */
  apiUrl: string;
}

/**
 * Represents all info about users that the logged-in user is following or followed by
 */
export type MyFollowsList = {
  /**
   * The users that the logged-in user either follows or is followed by
   */
  users: MyFollowing[];

  /**
   * The total number of users the logged-in user follows or is followed by
   */
  count: number;

  /**
   * Location of this resource on the server
   */
  apiUrl: string;
};

/**
 * Represents a follow between the logged-in user and another
 */
export type MyFollowing = {
  /**
   * The other user
   */
  user: UserPreview;

  /**
   * The date the follow occured
   */
  followedAt: Date;

  /**
   * Location of this resource on the server
   */
  apiUrl: string;
};

/**
 * Represents all info about projects that the logged-in user is following
 */
export type MyProjectFollowsList = {
  /**
   * The projects that the logged-in user follows
   */
  projects: MyProjectFollowing[];

  /**
   * The total number of projects the logged-in user follows
   */
  count: number;

  /**
   * Location of this resource on the server
   */
  apiUrl: string;
};

/**
 * Represents a project that was followed by the logged-in user
 */
export type MyProjectFollowing = {
  /**
   * The project that was followed
   */
  project: ProjectPreview;

  /**
   * The date the follow occured
   */
  followedAt: Date;

  /**
   * Location of this resource on the server
   */
  apiUrl: string;
};

// USERS

/**
 * Only the data needed for displaying a preview card of a user's profile
 */
export interface UserPreview {
  /**
   * The user's database ID
   */
  userId: number;

  /**
   * The user's first name
   */
  firstName: string;

  /**
   * The user's last name
   */
  lastName: string;

  /**
   * The users's username
   */
  username: string;

  /**
   * The location of the user's profile image, or null if unset
   */
  profileImage: string | null;

  /**
   * If the user has self-identified as a mentor
   */
  mentor: boolean;

  /**
   * If the user has selected any designer skills
   */
  designer: boolean;

  /**
   * If the user has selected any developer skills
   */
  developer: boolean;

  /**
   * The user's headline
   */
  headline: string;

  /**
   * The user's pronouns
   */
  pronouns: string;

  /**
   * The user's title, such as "Student" or "Developer"
   */
  title: string;

  /**
   * A fun fact about the user
   */
  funFact: string;

  /**
   * The user's location, such as "Rochester, NY"
   */
  location: string;

  /**
   * The majors a user is a part of
   */
  majors: Major[];

  /**
   * Location of this resource on the server
   */
  apiUrl: string;
}

/**
 * The full data of a user, excluding sensitive data
 */
export interface UserDetail extends UserPreview {
  /**
   * The user's academic year, or null if unset
   */
  academicYear: AcademicYear | null;

  /**
   * The user's bio
   */
  bio: string;

  /**
   * Projects the user is a member of and has chosen to show on their profile
   */
  projects: UserMember[];

  /**
   * Skills the user has selected
   */
  skills: UserSkill[];

  /**
   * Social media accounts the user has
   */
  socials: UserSocial[];

  /**
   * All entities the user follows
   */
  following: {
    /**
     * All users the user follows
     */
    usersFollowing: UserFollowsList;

    /**
     * All projects the user follows
     */
    projectsFollowing: ProjectFollowsList;
  };

  /**
   * All users who follow this user
   */
  followers: UserFollowsList;
}

// ME

// TODO should MePreview use the same properties as UserPreview?
/**
 * Only the data needed for displaying a preview card of the logged-in user's profile
 */
export interface MePreview {
  /**
   * The logged-in user's database ID
   */
  userId: number;
  /**
   * The logged-in user's first name
   */
  firstName: string;
  /**
   * The logged-in user's last name
   */
  lastName: string;
  /**
   * The logged-in users's username
   */
  username: string;
  /**
   * The location of the logged-in user's profile image, or null if unset
   */
  profileImage: string | null;
  /**
   * If the logged-in user has self-identified as a mentor
   */
  mentor: boolean;
  /**
   * If the logged-in user has selected any designer skills
   */
  designer: boolean;
  /**
   * If the logged-in user has selected any developer skills
   */
  developer: boolean;
  /**
   * Location of this resource on the server
   */
  apiUrl: string;
}

/**
 * The full data of the logged-in user, excluding sensitive data
 */
export interface MeDetail extends MePreview {
  /**
   * The logged-in user's headline
   */
  headline: string;

  /**
   * The logged-in user's pronouns
   */
  pronouns: string;

  /**
   * The logged-in user's title, such as "Student" or "Developer"
   */
  title: string;

  /**
   * The majors the logged-in user is a part of
   */
  majors: MyMajor[];

  /**
   * The logged-in user's academic year, or null if unset
   */
  academicYear: AcademicYear;

  /**
   * The logged-in user's location, such as "Rochester, NY"
   */
  location: string;

  /**
   * A fun fact about the logged-in user
   */
  funFact: string;

  /**
   * The logged-in user's bio
   */
  bio: string;

  /**
   * If the logged-in user has self-identified as a mentor
   */
  mentor: boolean;

  /**
   * Projects the logged-in user is a member of and has chosen to show on their profile
   */
  projects: MyMember[];

  /**
   * Skills the logged-in user has selected
   */
  skills: MySkill[];

  /**
   * Social media accounts the logged-in user has
   */
  socials: MySocial[];

  /**
   * All entities the logged-in user follows
   */
  following: {
    /**
     * All users the logged-in user follows
     */
    usersFollowing: MyFollowsList;

    /**
     * All projects the logged-in user follows
     */
    projectsFollowing: MyProjectFollowsList;
  };

  /**
   * All users who follow the logged-in user
   */
  followers: UserFollowsList;
}

/**
 * The full data of a user, including sensitive data
 */
export interface MePrivate extends MeDetail {
  /**
   * The logged-in user's RIT email
   */
  ritEmail: string;

  /**
   * Whether the logged-in user has set their profile to be Public or Private
   */
  // TODO implement or remove
  visibility: Visibility;

  /**
   * The logged-in user's phone number, null if unset
   */
  phoneNumber: string | null;

  /**
   * The logged-in user's UID
   */
  universityId: string;

  /**
   * The date on which the logged-in user's account was created
   */
  createdAt: Date;

  /**
   * The date on which the logged-in user's account was last updated
   */
  updatedAt: Date;
}

// PROjECT DATA

/**
 * An image displayed on a project
 */
export interface ProjectImage {
  /**
   * The database ID corresponding with the image
   */
  imageId: number;

  /**
   * The location of the image file
   */
  image: string;

  /**
   * The alt text
   */
  altText: string;

  /**
   * The location of this resource on the server
   */
  apiUrl: string;
}

/**
 * Represents a medium tied to a project
 */
export interface ProjectMedium extends Medium {
  /**
   * The location of this resource on the server
   */
  apiUrl: string;
}

/**
 * Represents all info about users who follow a known project
 */
export interface ProjectFollowers {
  /**
   * The total number of users who follow the project
   */
  count: number;

  /**
   * All the users who follow the project
   */
  users: ProjectFollower[];

  /**
   * The location of this resource on the server
   */
  apiUrl: string;
}

/**
 * Represents a user who is a member of a known project
 */
export interface ProjectMember {
  /**
   * The user who is a member of the project
   */
  user: UserPreview;

  /**
   * The user's role in the project
   */
  role: Role;

  /**
   * The date the user became a member of the project
   */
  memberSince: Date;

  /**
   * The location of this resource on the server
   */
  apiUrl: string;
}

/**
 * Represents a tag tied to a project
 */
export interface ProjectSocial extends Social {
  /**
   * The url to the project's social media account
   */
  url: string;

  /**
   * The location of this resource on the server
   */
  apiUrl: string;
}

/**
 * Represents all info for a social media account that the logged-in user has
 */
export interface ProjectTag extends Tag {
  /**
   * The location of this resource on the server
   */
  apiUrl: string;
}

/**
 * Represents an open job listing for a known project
 */
export interface ProjectJob {
  /**
   * The database ID corresponding with the job
   */
  jobId: number;

  /**
   * The role for which the job is for, such as "Artist"
   */
  role: Role;

  /**
   * The desired work availability for the position, such as "Full-Time"
   */
  availability: JobAvailability;

  /**
   * The duration of the position, such as "Short-Term"
   */
  duration: JobDuration;

  /**
   * The on/off-site location of the job, such as "Remote"
   */
  location: JobLocation;

  /**
   * Whether the job is compensated or not, such as "Unpaid"
   */
  compensation: JobCompensation;

  /**
   * The user who applicants should reach out to
   */
  contact: UserPreview;

  /**
   * A description of the job listing
   */
  description: string;

  /**
   * The date the listing was created
   */
  createdAt: Date;

  /**
   * The date the listing was last updated
   */
  updatedAt: Date;

  /**
   * The location of this resource on the server
   */
  apiUrl: string;
}

// PROJECTS

/**
 * The full data of a project, excluding followers
 */
export interface ProjectDetail extends ProjectPreview {
  /**
   * The project's description
   */
  description: string;

  /**
   * The project's purpose, such as "Personal", null if unset
   */
  purpose: ProjectPurpose | null;

  /**
   * The current status of the project, such as "Development"
   */
  status: ProjectStatus;

  /**
   * The target audience of the project
   */
  audience: string;

  /**
   * The tags attached to the project
   */
  tags: Tag[];

  /**
   * The images attached to the project
   */
  projectImages: ProjectImage[];

  /**
   * The social media accounts related to the project
   */
  projectSocials: ProjectSocial[];

  /**
   * The open job positions the project is looking to fill
   */
  jobs: ProjectJob[];

  /**
   * All members of the project, including the creator
   */
  members: ProjectMember[];

  /**
   * The date the project was created
   */
  createdAt: Date;

  /**
   * The date the project was last updated
   */
  updatedAt: Date;
}

/**
 * Only the data needed for displaying a preview card of a project
 */
export interface ProjectPreview {
  /**
   * The database ID corresponding to the project
   */
  projectId: number;

  /**
   * The project title
   */
  title: string;

  /**
   * A hook to catch attention to the project
   */
  hook: string;

  /**
   * The creator of the project
   */
  owner: UserPreview;

  /**
   * The project thumbnail, null if unset
   */
  thumbnail: ProjectImage | null;

  /**
   * The imageId of the {@link ProjectImage} used as the thumbnail
   */
  // TODO remove and change references to `thumbnail.imageId`
  thumbnailId: number;

  /**
   * The mediums attached to the project
   */
  mediums: ProjectMedium[];

  /**
   * The location of this resource on the server
   */
  apiUrl: string;
}

/**
 * The full data of a project, including followers
 */
export interface ProjectWithFollowers extends ProjectDetail {
  /**
   * The project's followers
   */
  followers: ProjectFollowers;
}

// IMAGES

/**
 * The result of uploading an image to the server
 */
export type ImageUploadResult = {
  /**
   * The url to the image's location on the server
   */
  location: string;
};

// API Inputs

// ME inputs

/**
 * Data required to update a user
 */
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
    // TODO update to use Visibility enum
    visibility?: "1" | "0";
  }
>;

/**
 * Data required to add a social media link to a user's profile
 */
export type AddUserSocialInput = Pick<UserSocial, "websiteId" | "url">;

/**
 * Data required to update an existing social media link on a user's profile
 */
export type UpdateUserSocialInput = Partial<Pick<UserSocial, "url">>;

/**
 * Data required to add a skill to a user's profile
 */
export type AddUserSkillsInput = Pick<
  UserSkill,
  "skillId" | "position" | "proficiency"
>;

/**
 * Data required to update an existing skill on a user's profile
 */
export type UpdateUserSkillInput = Partial<
  Pick<UserSkill, "position" | "proficiency">
>;

/**
 * Data required to add a major to a user's profile
 */
export type AddUserMajorInput = Pick<Major, "majorId">;

/**
 * Data required to show or hide a project on a user's profile
 */
export type UpdateUserProjectVisibilityInput = {
  visibility: Visibility;
};

// PROJECTS inputs

/**
 * Data required to create a new project
 */
export type CreateProjectInput = Required<Pick<ProjectDetail, "title">> &
  Partial<
    Pick<
      ProjectDetail,
      "hook" | "description" | "status" | "audience" | "purpose"
    >
  >;

/**
 * Data required to update an existing project
 */
export type UpdateProjectInput = Partial<CreateProjectInput>;

/**
 * Data required to upload a new image to a project
 */
export type CreateProjectImageInput = Pick<ProjectImage, "altText"> & {
  image: File;
};

/**
 * Data required to edit the image or alt text on a project
 */
export type UpdateProjectImageInput = Partial<CreateProjectImageInput>;

/**
 * Data rquired to change the order images appear on a project page
 */
export type ReorderProjectImagesInput = {
  imageOrder: number[];
};

/**
 * Data required to add a user as a member of a project, role defaults to "Member"
 */
export type CreateProjectMemberInput = {
  userId: number;
  roleId?: number;
};

/**
 * Data required to change a member's role in a project
 */
export type UpdateProjectMemberInput = Partial<
  Pick<CreateProjectMemberInput, "roleId">
>;

/**
 * Data required to add a social media link to a project
 */
export type AddProjectSocialInput = Pick<ProjectSocial, "websiteId" | "url">;

/**
 * Data required to update the url of an existing social media link on a project
 */
export type UpdateProjectSocialInput = Partial<Pick<ProjectSocial, "url">>;

/**
 * Data required to change which project image is used as the thumbnail
 */
export type UpdateProjectThumbnailInput = {
  // TODO rename to projectImageId for clarity
  thumbnail: number;
};

/**
 * Data required to add a tag to a project
 */
// TODO rename to AddProjectTagInput (no plural)
export type AddProjectTagsInput = Pick<ProjectTag, "tagId">;

/**
 * Data required to add a medium to a project
 */
// TODO rename to AddProjectMediumInput (no plural)
export type AddProjectMediumsInput = Pick<ProjectMedium, "mediumId">;

/**
 * Data required to create a job listing on a project
 */
export type CreateProjectJobInput = Required<
  Pick<ProjectJob, "availability" | "duration" | "location" | "compensation">
> &
  Partial<Pick<ProjectJob, "description">> & {
    roleId: number;
    contactUserId: number;
  };

/**
 * Data required to update an existing job listing on a project
 */
export type UpdateProjectJobInput = Partial<CreateProjectJobInput>;


/**
 * Data required to filter request
 */
export type FilterRequest = {
  mentor?: boolean;
  designer?: boolean;
  developer?: boolean;
  skills?: number[];
  majors?: number[];
  academicYear?: string[];
  socials?: number[];
  strictness?: 'any' | 'all';
}