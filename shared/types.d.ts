// Enums for better typing
export type SkillType = "Developer" | "Designer" | "Artist" | "Music" | string;
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
    | "Purpose"
    | string;
export type AcademicYear =
    | "Freshman"
    | "Sophomore"
    | "Junior"
    | "Senior"
    | "Graduate"
    | string;
export type Visibility = 0 | 1;
export type SkillProficiency =
    | "Novice"
    | "Intermediate"
    | "Advanced"
    | "Expert"


//API REQUEST

declare global{
    namespace Express {
        interface Request {
            currentUser?: string
        }
    }
}

//API RESPONSE

export interface ApiResponse<_data = any> {
    status: number;
    error?: string | null;
    data?: _data | null;
    memetype?: string;
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

export interface UserSkill extends Skill {
    proficiency: SkillProficiency;
    position: number;
}

export interface UserSocial extends Social {
    url: string;
}

export type ProjectFollowsList = {
    projects: ProjectPreview[];
    count: number;
    apiUrl: string;
}

export type UserFollowsList = {
    users: UserPreview[];
    count: number;
    apiUrl: string;
}

export type UserFollowings = {
    senderId: number;
    receiverId: number;
    followedAt: Date;
    apiUrl: string;
};

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
    users: UserPreview[];
    count: number;
    apiUrl: string;
}

// USERS

//show only preview data
export type UserPreview = {
    userId: number;
    firstName: string;
    lastName: string;
    username: string;
    profileImage?: string | null;
    apiUrl: string;
};

//show only non-sensitive data
export type UserDetail = {
    userId: number;
    firstName: string;
    lastName: string;
    username: string;
    profileImage?: string | null;
    headline: string | null;
    pronouns: string | null;
    title: string | null;
    majors: Major[];
    academicYear: string | null;
    location: string | null;
    funFact: string | null;
    bio?: string | null;
    projects: ProjectPreview[];
    skills?: UserSkill[];
    socials?: UserSocial[];
    following: {usersFollowing: UserFollowsList, projectsFollowing: ProjectFollowsList},
    followers: UserFollowsList;
    apiUrl: string;
};

//all user private data
export interface User {
    userId: number;
    username: string;
    ritEmail: string;
    firstName: string;
    lastName: string;
    profileImage?: string | null;
    headline: string | null;
    pronouns: string | null;
    title: string | null;
    academicYear: string | null;
    location: string | null;
    funFact: string | null;
    bio: string | null;
    visibility: Visibility;
    projects: ProjectPreview[];
    majors?: Major[] | null;
    skills?: UserSkill[] | null;
    socials?: Social[] | null;
    phoneNumber: string | null;
    universityId: string | null;
    createdAt: Date;
    updatedAt: Date;
    following: {usersFollowing: UserFollowsList, projectsFollowing: ProjectFollowsList},
    followers: UserFollowsList;
    apiUrl: string;
}

// ME

//show only preview data
export type MePreview = {
    userId: number;
    firstName: string;
    lastName: string;
    username: string;
    profileImage?: string | null;
    apiUrl: string;
};

//show only non-sensitive data
export type MeDetail = {
    userId: number;
    firstName: string;
    lastName: string;
    username: string;
    profileImage?: string | null;
    headline: string | null;
    pronouns: string | null;
    title: string | null;
    majors: MyMajor[];
    academicYear: string | null;
    location: string | null;
    funFact: string | null;
    bio?: string | null;
    projects: ProjectPreview[];
    skills?: MySkill[];
    socials?: MySocial[];
    following: {usersFollowing: UserFollowsList, projectsFollowing: ProjectFollowsList},
    followers: UserFollowsList;
    apiUrl: string;
};

//all user private data
export interface MePrivate {
    userId: number;
    username: string;
    ritEmail: string;
    firstName: string;
    lastName: string;
    profileImage?: string | null;
    headline: string | null;
    pronouns: string | null;
    title: string | null;
    academicYear: string | null;
    location: string | null;
    funFact: string | null;
    bio: string | null;
    visibility: Visibility;
    projects: ProjectPreview[];
    majors?: MyMajor[] | null;
    skills?: MySkill[] | null;
    socials?: MySocial[] | null;
    phoneNumber: string | null;
    universityId: string | null;
    createdAt: Date;
    updatedAt: Date;
    following: {usersFollowing: UserFollowsList, projectsFollowing: ProjectFollowsList},
    followers: UserFollowsList;
    apiUrl: string;
}

//creating users
export interface CreateUserData {
    firstName: string;
    lastName: string;
    headline?: string;
    pronouns?: string;
    title?: string;
    academicYear?: number;
    location?: string;
    funFact?: string;
    majors?: Major[];
    skills?: UserSkill[];
    socials?: Social[];
}

// PROjECT DATA

export interface ProjectFollowings {
    userId: number;
    projectId: number;
    followedAt: Date;
    apiUrl: string;
}

//images for projects
export interface ProjectImage {
    imageId: number;
    image: string;
    altText: '';
    apiUrl: string;
}

//permissions not yet in database
export interface Member {
    projectId: number;
    userId: number;
    roleId: number;
    apiUrl: string;
    //permission: number;
}

// Represents the followers info for a project
export interface ProjectFollowers {
    count: number;
    users: UserPreview[];
    apiUrl: string;
}

// PROJECTS

export interface Project {
    projectId: number;
    title: string;
    hook: string;
    description: string;
    thumbnail?: string | null;
    purpose?: string | null;
    status?: string | null;
    audience?: string | null;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
    mediums: Medium[];
    tags: Tag[];
    projectImages: ProjectImage[];
    projectSocials: Social[];
    jobs: Job[];
    members: Member[];
    apiUrl: string;
}

//show only preview data
export interface ProjectPreview {
    projectId: number;
    title: string;
    hook: string;
    thumbnail?: string | null;
    mediums: Medium[];
    apiUrl: string;
}

// project with the followers data
export interface ProjectWithFollowers extends Project {
    followers: ProjectFollowers;
}

//Jobs for projects
export interface Job {
    projectId: number;
    roleId: number;
    availability: string;
    duration: string;
    location: string;
    compensation: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
    apiUrl: string;
}

// IMAGES

export type ImageUploadResult = {
    location: string;
}