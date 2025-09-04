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
    position: number;
}

export interface UserSocial {
    userId: number;
    websiteId: number;
    url: string;
    social: Social;
}


export type UserFollowings = {
    senderId: number;
    receiverId: number;
    followedAt: Date;
};


// USERS

//show only preview data
export type UserPreview = {
    userId: number;
    firstName: string;
    lastName: string;
    username: string;
    profileImage?: string | null;
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
    major: string | null;
    academicYear: string | null;
    location: string | null;
    funFact: string | null;
    bio?: string | null;
    skills?: UserSkill[] | null;
    //might need to add userSocial
    socials?: Social[] | null;
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
    majorId: number | null;
    academicYear: string | null;
    location: string | null;
    funFact: string | null;
    bio: string | null;
    visibility: Visibility;
    skills?: UserSkill[] | null;
    socials?: Social[] | null;
    phoneNumber: string | null;
    universityId: number | null;
    createdAt: Date;
    updatedAt: Date;
}

//creating users
export interface CreateUserData {
    firstName: string;
    lastName: string;
    headline?: string;
    pronouns?: string;
    title?: string;
    majorId?: number;
    academicYear?: number;
    location?: string;
    funFact?: string;
    skills?: UserSkill[];
    socials?: Social[];
}


// PROjECT DATA

export interface ProjectFollowings {
    userId: number;
    projectId: number;
    followedAt: Date;
}

//images for projects
export interface ProjectImage {
    imageId: number;
    image: string;
    altText: '';
}

//tags for projects
export interface ProjectTag {
    projectId: number;
    tagId: number;
    label: string;
    type: TagType;
    position: number;
}

//permissions not yet in database
export interface Member {
    projectId: number;
    userId: number;
    roleId: number;
    //permission: number;
}

// Represents the followers info for a project
export interface ProjectFollowers {
    count: number;
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
    //might need to add projectGenre
    medium: Medium[];
    projectTags: ProjectTag[];
    projectImages: ProjectImage[];
    //might need to add projectSocial
    projectSocials: Social[];
    jobs: Job[];
    members: Member[];
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
}

// IMAGES

export type ImageUploadResult = {
    location: string;
}