
import UserAccessLevel = require("@looking-for-group/shared/enums");
import type { Request } from "express";

// Enums for better typing
export type SkillType = "Developer" | "Designer" | "Engineer" | "Soft" | "Audio" | "Role" | "Major";
export type TagType =
  | "Other"
  | 'Style'
  | 'Genre'
  | "Purpose"
  | "Project Type"
  | "Role"
  | "Major"
  | "Game Engine"
  | "Positions"
//wow.
export type GenreCategory = 'Game' | "Story" | 'Music';
export type StyleCategory = 'Visual' | 'Film/Video';
export type GameEngine = 'Unity' | 'Unreal Engine' | 'Godot' | 'Twine' | 'MonoGame'
export type DesignerCategory = 'Discipline' | 'Design Software' | 'Art and Animation' | 'Photo Editing' | 'Video Software';
export type DeveloperCategory = 'Discipline' | 'Framework' | 'API' | 'Software' | 'Coding Language' | 'Operating System' | 'Game Engine';
export type SoftCategory = 'Discipline' | 'Personal' | 'Team';
export type AudioCategory = 'Discipline' | 'DAW/Audio Editor' | 'Notation' | 'Middleware';
export type EngineerCategory = 'Discipline' | 'Engineering Software' | 'Hardware'
export type SkillCategory = DeveloperCategory | DesignerCategory | AudioCategory | SoftCategory | EngineerCategory | "Other";
export type TagCategory = GenreCategory | StyleCategory | GameEngine | "Other";
export type RitStatus =
  | "FirstYear"
  | "SecondYear"
  | "ThirdYear"
  | "FourthYear"
  | "FifthYear"
  | "GraduateStudent"
  | "Alumni"
  | "Faculty"
  | 'Staff';
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
export type JobLocation = "OnSite" | "Remote" | "Hybrid" | "Flexible";
export type JobCompensation = "Unpaid" | "Paid";
export type MemberRequestStatus = "Accepted" | "Declined" | "Pending";
export type ProjectSortMethod = "Newest" | "A-Z" | "Popular";
export type UserSortMethod = "Newest" | "A-Z";
export type Visibility = "public" | "private";
export type UserAccessLevel = "User" | "Moderator" | "Administrator";
//do we even need this visibility enum at all? it's stored as a 0/1 in the db anyway
//a problem for another day, i really don't feel like fixing it right now

// Structures for type management
export interface StringDictionary<T> {
  [key: string]: T;
}

export interface NumberDictionary<T> {
  [key: number]: T;
}


export type ProjectInfoStage = "Preview" | "Detail" | "Full";

export interface StructuredProjectInfo {
  preview?: ProjectPreview;
  detail?: ProjectDetail;
  full?: ProjectWithFollowers;
}

export interface StructuredUserInfo {
  preview?: UserPreview;
  detail?: UserDetail;
}

//API REQUEST

/**
 * A request that has been made by an authenticated user.
 * Used for routes that make changes to a logged-in user
 */
export interface AuthenticatedRequest extends Request {
  currentUser: { username: string; userId: number; accessLevel: UserAccessLevel };
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
  userId: number,
  username: string,
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

  /**
   * The category of tag, such as "Game"
   */
  category: TagCategory;
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

  /**
   * The category of the skill, such as "Software"
   */
  category: SkillCategory;
}

/**
 * Mediums refer to the medium through which the project is experienced
 */
export interface Medium {
  /**
   * The database ID corresponding to the type
   */
  mediumId: number;

  /**
   * The name of the type, such as "Video Game"
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
  profileVisibility: Visibility;

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
 * Represents all info for a skill that a user has
 */
export interface JobSkill extends Skill {

  /**
   * The proficiency in the skill the job is searching for
   */
  proficiency: SkillProficiency;

  /**
   * The index at which the job skill is displayed
   */
  position: number;

  /**
   * The location of this resource on the server
   */
  apiUrl: string;

  //anything else we would want these to have would go in here

}

/**
 * Represents all info for a social media account that a user has
 */
export interface UserSocial extends Social {
  /**
   * The DB id of this user social
   */
  id: number;

  /**
   * The url to the user's social media account
   */
  url: string;

  /**
   * Alias for the link
   */
  alias: string;
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
  profileVisibility: Visibility;

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
 * The user's preferred name
 */
  preferredName: string;

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

  /**
   * The user's preference on whether or not they wish to display their phone number on their profile
   */
  displayPhone: boolean;

  /**
   * The user's preference on whether or not they wish to display their phone number on their profile
   */
  privacy: Visibility;

  /**
   * The user's phone number (only filled is displayPhone is true)
   */
  phoneNumber?: string | null;

  apiUrl: string;
}

/**
 * The full data of a user, excluding sensitive data
 */
export interface UserDetail extends UserPreview {
  /**
   * The user's RIT status, or null if unset
   */
  ritStatus: RitStatus | null;

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

export interface UserEmail extends Pick<UserPreview, 'userId' | 'firstName' | 'lastName'> {
  /**
   * The user's rit email
   */
  ritEmail: string;
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
* The logged-in user's preferred name
*/
  preferredName: string;
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
   * The logged-in user's RIT Status, or null if unset
   */
  ritStatus: RitStatus;

  /**
   * The logged-in user's location, such as "Rochester, NY"
   */
  location: string;

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
  privacy: Visibility;

  /**
   * The logged-in user's phone number, null if unset
   */
  phoneNumber: string | null;

  /**
   * Whether or not to display the user's phone number 
   */
  displayPhone: boolean

  /**
   * The logged-in user's UID
   */
  googleId: string;

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
 * An video displayed on a project
 */
export interface ProjectVideo {
  /**
   * The database ID corresponding with the video
   */
  videoId: number;

  /**
   * The URL of the video
   */
  videoUrl: string;

  /**
   * The video title
   */
  title: string;

  /**
   * The position of the video
   */
  position: number;

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

export interface ProjectVideo {
  /**
   * UniqueID for the video
   */
  videoId: number;

  /**
   * URL to the video
   */
  videoUrl: string;

  /**
   * Order in which videos are displayed on project
   */
  position: number;

  /**
   * Alt title for screen readers
   */
  title: string;
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
 * Represents a social tied to a project
 */
export interface ProjectSocial extends Social {
  /**
   * DB id of the project social
   */
  id: number;

  /**
   * The url to the project's social media account
   */
  url: string;

  /**
  * Alias of the url
  */
  alias: string;

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

  /**
   * The order this tag is in compared to other tags attached to the project
   */
  displayOrder: number;
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
   * The starting date for this job, as a date. The month is 0-indexed.
   */
  jobStart: Date | null | undefined;

  /**
   * The ending date for this job, as a date. The month is 0-indexed.
   */
  jobEnd: Date | null | undefined;

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
   * The skills the listing is looking for
   */
  jobSkills: JobSkill[];

  /**
   * The date the listing was last updated
   */
  updatedAt: Date;

  /**
   * The location of this resource on the server
   */
  apiUrl: string;
}

// NOTIFICATIONS

/**
 * The preview of what the user sees when they first see a notification.
 */
export interface NotificationPreview {
  /**
   * ID of the notification
   */
  notificationId: string;

  /**
   * The time the notification was sent.
   */
  timeSent: Date;

  /**
   * The subject of the notification.
   */
  subjectLine: string;

  /**
   * Whether or not the notification has been read by its receiver.
   */
  hasBeenRead: boolean;
}

/**
 * The full extent of the notification when the user clicks on it.
 */
export interface NotificationDetail extends NotificationPreview {
  /**
   * The message within the notification.
   */
  message: string;
}

/**
 * Returned by NotificationBuilders to be used by the sendNotification service.
 */
export interface NotificationBuilderResult {
  /**
   * UserId of the receiver.
   */
  receiverId: number;

  /**
   * Line that appears in the list of notifications.
   */
  subjectLine: string;

  /**
   * Full extent of the notification's message.
   */
  message: string;
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
   * The images attached to the project
   */
  projectImages: ProjectImage[];

  /**
   * The youtube links attached to the project
   */
  projectVideos: ProjectVideo[];

  /**
   * The social media accounts related to the project
   */
  projectSocials: ProjectSocial[];

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

  /**
   * Is the project approved?
   */
  approved: boolean;
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
   * The project's sitewide visibility
   */
  globalVisibility: Visibility

  /**
   * The tags attached to the project
   */
  tags: ProjectTag[];

  /**
   * A hook to catch attention to the project
   */
  hook: string;

  /**
   * The creator of the project
   */
  owner: UserPreview;

  /**
   * The open job positions the project is looking to fill
   */
  jobs: ProjectJob[];

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

/**
 * The full data of a project report
 */
export type ProjectReport = {
  /**
   * The location of this resource on the server
   */
  apiUrl: string;

  /**
   * Report ID in the DB
   */
  reportId: number;

  /**
   * Reporter ID
   */
  userId: number;

  /**
   * Reported project ID
   */
  projectId: number;

  /**
   * Reason for the report
   */
  reason: string;
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
    | "preferredName"
    | "headline"
    | "pronouns"
    | "title"
    | "ritStatus"
    | "location"
    | "bio"
    | "phoneNumber"
    | 'privacy'
    | 'displayPhone'
  > & {
    profileImage?: File;
    mentor?: "true" | "false";
  }
>;
export type CreateUserInput = Partial<
  Pick<
    MePrivate,
    | "headline"
    | "pronouns"
    | "title"
    | "ritStatus"
    | "location"
    | "bio"
    | "phoneNumber"
    | 'username'
    | 'privacy'
    | 'displayPhone'
  > & {
    profileImage?: string;
    mentor?: true | false;
  }
> & {
  firstName: string;
  lastName: string;
  preferredName: string;
  googleId?: string;
  username: string;
  ritEmail: string;
};

export type SessionUserData = Partial<{
  firstName: string;
  lastName: string;
  preferredName: string;
  email: string;
  googleId: string;
  userExists: boolean;
}>

/**
 * Data required to add a social media link to a user's profile
 */
export type AddUserSocialInput = Pick<UserSocial, "websiteId" | "url" | "alias">;

/**
 * Data required to update an existing social media link on a user's profile
 */
export type UpdateUserSocialInput = Partial<Pick<UserSocial, "url" | "alias" | "websiteId">>;

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
export type UpdateProjectProfileVisibilityInput = {
  profileVisibility: Visibility;
};

/**
 * The full data of a user report
 */
export type UserReport = {
  /**
   * The location of this resource on the server
   */
  apiUrl: string;

  /**
   * Report ID in the DB
   */
  reportId: number;

  /**
   * ID of the user who made the report
   */
  reporterId: number;

  /**
   * ID of the user being reported
   */
  reportedId: number;

  /**
   * Reason for the report
   */
  reason: string;

  /**
   * Whether the report is still active or has been resolved
   */
  active: boolean;
}

// PROJECTS inputs

/**
 * Data required to create a new project
 */
export type CreateProjectInput = Required<Pick<ProjectDetail, "title">> &
  Partial<
    Pick<
      ProjectDetail,
      "hook" | "description" | "status" | "audience" | "purpose" | 'globalVisibility'
    >
  >;

/**
 * Data required to update an existing project
 */
export type UpdateProjectInput = Partial<CreateProjectInput>;

/**
 * Data required to upload a new image to a project
 */
export type CreateProjectVideoInput = {
  title: string;
  videoUrl: string;
};

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
  ownerUserId: number;
  prospectiveMemberId: number;
  roleId: number;
  message?: string;
};

/**
 * Data required to add owner of a project
 */
export type CreateProjectOwnerInput = {
  userId: number;
  roleId: number;
};

/**
 * Data required to invite a user to join a project
 */
export type SendProjectInviteInput = CreateProjectMemberInput;

/**
 * Data required to request to join a project
 */
export type RequestToJoinInput = CreateProjectMemberInput;

/**
 * Data required to update member request
 */
export type UpdateMemberRequestInput = {
  requestStatus?: MemberRequestStatus,
  roleId?: number,
};

/**
 * Data required to send invitation email to user
 */
export type EmailInput = {
  sender: UserEmail;
  receiver: UserEmail;
  subject: string;
  textBody: string;
  HTMLBody: string;
};

/**
 * Data required to change a member's role in a project
 */
export type UpdateProjectMemberInput = Partial<
  Pick<CreateProjectMemberInput, "roleId">> & {
    profileVisibility?: Visibility;
  };

/**
 * Data stored in a member request
 */
export type MemberRequests = {
  requestId: number;
  prospectiveMemberId: number;
  projectId: number;
  roleId: number;
  sentFromProject: boolean;
  requestStatus: MemberRequestStatus;
};

/**
 * Data for getting a member request
 * (if requestId is provided, others are optional)
 */
type GetMemberRequest = {
  requestId: number;
  prospectiveMemberId?: number;
  projectId?: number;
  roleId?: number;
} | {
  requestId?: undefined;
  prospectiveMemberId: number;
  projectId: number;
  roleId: number;
};

/**
 * Data required to add a social media link to a project
 */
export type AddProjectSocialInput = Pick<ProjectSocial, "websiteId" | "url" | "alias">;

/**
 * Data required to update the url of an existing social media link on a project
 */
export type UpdateProjectSocialInput = Partial<Pick<ProjectSocial, "url" | "alias" | "websiteId">>;

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
export type AddProjectTagInput = Pick<ProjectTag, "tagId" | "displayOrder">;

/**
 * Data required to update a tag on a project
 */
export type UpdateProjectTagInput = Partial<AddProjectTagInput>;

/**
 * Data required to add a type to a project
 */
export type AddProjectMediumInput = Pick<ProjectMedium, "mediumId">;

/**
 * Data required to create a job listing on a project
 */
export type CreateProjectJobInput = Required<
  Pick<ProjectJob, "availability" | "location" | "compensation">
> &
  //might have to move jobStart and jobEnd to required in case the db freaks out
  Partial<Pick<ProjectJob, "description" | "jobSkills" | "jobStart" | "jobEnd">> & {
    roleId: number;
    contactUserId: number;
  };

/**
 * Data required to update an existing job listing on a project
 */
export type UpdateProjectJobInput = Partial<CreateProjectJobInput>;


/**
 * Data required to add a skill to a project
 */
export type AddJobSkillInput = Pick<JobSkill, "skillId" | "proficiency" | "position">

export type UpdateJobSkillInput = Pick<JobSkill, "skillId" | "proficiency" | "position"> //more things if we want to add more things

export type DeleteJobSkillInput = {
  jobId: number,
  skillId: number
}
//this is purely for the frontend because it needs both things for the url, and so the data manager can work properly
//the delete service takes it from the parameters

/**
 * Data required to filter request
 */
export type FilterRequest = {
  mentor?: boolean;
  designer?: boolean;
  developer?: boolean;
  skills?: number[];
  majors?: number[];
  ritStatus?: string[];
  socials?: number[];
  strictness?: 'any' | 'all';
}

/**
 * Data required to create a new tag.
 */
export type CreateTagInput = Pick<Tag, "label" | "type" | "category">;

/**
 * Data required to edit an existing tag.
 */
export type EditTagInput = Partial<CreateTagInput> & { tagId: number }

/**
 * Data required to create a skill.
 */
export type CreateSkillInput = Pick<Skill, "label" | "type" | "category">;

/**
 * Data required to edit an existing skill
 */
export type EditSkillInput = Partial<CreateSkillInput> & { skillId: number };

/**
 * Data required to add a user report
 */
export type AddUserReportInput = {
  reason: string;
};

/**
 * Data required to add a project report
 */
export type AddProjectReportInput = {
  reason: string;
};
};

/**
 * Data required to unapprove an already approved project
 */
export type UnapproveProjectInput = {
  reason: string;
}

/**
 * Data required to send a notification to a moderator
 */
export type ModeratorNotificationInput = {
  modUserId: number;
  receiverId: number;
  subjectLine: string;
  message: string;
}

/**
 * Data required to ban a user from the site
 */
export type BanUserInput = {
  userId: number;
  reason: string;
}
