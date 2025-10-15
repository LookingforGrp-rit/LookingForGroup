import { GET, POST, PUT, DELETE, PATCH } from "./index";
import type {
  ApiResponse,
  UserPreview,
  UserDetail,
  ProjectPreview,
  ProjectFollowing,
  UserFollowing,
  MePrivate,
  MySocial,
  MySkill,
  Major,
  Skill,
  Role,
  Medium,
  Tag,
  Social,
  UpdateUserInput,
  AddUserSocialInput,
  UpdateUserSocialInput,
  AddUserSkillsInput,
  UpdateUserSkillInput,
  AddUserMajorInput,
  MyMajor,
} from "@looking-for-group/shared";

/* USER CRUD */

//This probably will change with shibboleth???
/**
 * Creates a new user
 * @param userData - data for creating a user
 * @returns status - 200 if valid, 400 if not
 */
export const createNewUser = async (
  userData: UserPreview
): Promise<ApiResponse> => {
  const apiURL = "/users";

  return await POST(apiURL, userData);
};

/**
 * Checks if the user is logged in (shibboleth) and returns username if they are
 * @returns ApiResponse with username is logged in, 404 if guest
 */
export const getCurrentUsername = async (): Promise<ApiResponse> => {
  // const apiURL = `/me/get-username`;
  const apiURL = `/me`;
  const response = await GET(apiURL);

  console.log(response);
  return {
    status: response.status,
    data:
      response.status === 200
        ? {
            userId: (response.data as MePrivate).userId,
            username: (response.data as MePrivate).username,
          }
        : null,
    error: response.error,
  };
};

/**
 * Gets all data on all public users. Does not return private ones
 * @returns result - JSONified data of all users, else if error, '400'.
 */
export const getUsers = async (): Promise<ApiResponse<UserPreview[]>> => {
  const apiURL = `/users`;
  const response = await GET(apiURL);
  //TODO: revisit this to make it include filters
  //but filters are a stretch goal anyway so it's not too important
  console.log(response);
  return response;
};

/**
 * Gets all data on one specific user, specified by URL.
 * @param id - database id for user
 * @returns result - JSONified data of specified user.
 */
export const getUsersById = async (
  id: string
): Promise<ApiResponse<UserDetail>> => {
  const apiURL = `/users/${id}`;
  const response = await GET(apiURL);

  console.log(response);
  return response;
};

//Gets the current user by ID
export const getCurrentUserById = async (): Promise<ApiResponse<MePrivate>> => {
  const apiURL = `/me`;
  const response = await GET(apiURL);

  console.log(response);
  return response;
};

/**
 * Edit information for one user, specified by URL.
 * @param userData - The data to change for the user
 * @returns response data
 */
export const editUser = async (
  userData: UpdateUserInput
): Promise<ApiResponse<MePrivate>> => {
  const apiURL = `/me`;
  const form = new FormData();

  for (const [name, value] of Object.entries(userData)) {
    if (value !== null) form.append(name, value);
  }

  const response = await PATCH(apiURL, form);

  if (response.error) console.log(`Error in editUser: ${response.error}`);
  return response as ApiResponse<MePrivate>; //it would get mad at me if i didn't do this soooo
};

//Removes a user specified by URL.
export const deleteUser = async (): Promise<ApiResponse> => {
  const apiURL = `/me`;
  const response = await DELETE(apiURL);

  console.log(response);
  return response;
};

/* ACCOUNT INFO/ PASSWORD RESET*/

/* LOOKUP USER */

/**
 * Get User by Username
 * @param username - Username of user to be recieved
 * @return data, list of 1 user, or 400 if not successful
 */
export const getUserByUsername = async (
  username: string
): Promise<ApiResponse<UserPreview>> => {
  const url = `/users/search-username/${username}`;
  const response = await GET(url);

  console.log(response);
  return response;
};

/**
 * Get User by email
 * @param email - email of user to be recieved
 * @return data, list of 1 user, or 400 if not successful
 */
export const getUserByEmail = async (
  email: string
): Promise<ApiResponse<UserPreview>> => {
  const url = `/users/search-email/${email}`;
  const response = await GET(url);

  console.log(response);
  return response;
};

/* USER FOLLOWINGS */

/**
 * Get people that a user is following.
 * @param {number} id - id of the user that we are searching.
 * @returns array of users following, or 400 if unsuccessful.
 */
export const getUserFollowing = async (
  id: number
): Promise<ApiResponse<UserPreview[]>> => {
  const url = `/users/${id}/followings/people`;
  const response = await GET(url);

  console.log(response);
  return response;
};

/** Get list of users that are following the specified user
 * @param {number} id - id of the user that we are searching.
 */
export const getUserFollowers = async (id: number): Promise<ApiResponse> => {
  const url = `/users/${id}/followers`;
  const response = await GET(url);

  console.log(response);
  return response;
};

/**
 * Follow a person for a user.
 * @param {number} userId - ID of the user being followed
 * @returns 201 if successful, 400 if not
 */
export const addUserFollowing = async (
  userId: number
): Promise<ApiResponse<UserFollowing>> => {
  const url = `/me/followings/people/${userId}`;
  const response = await POST(url, {});

  if (response.error)
    console.log(`Error in addUserFollowing: ${response.error}`);
  console.log(response);
  return response as ApiResponse<UserFollowing>;
};

/**
 * Unfollow person for a user. Unauthorized until shibboleth.
 * @param {number} userId - ID of the user being followed
 */
export const deleteUserFollowing = async (id: number) => {
  const url = `/me/followings/people/${id}`;
  const response = await DELETE(url);

  console.log(response);
  return response;
};

/* PROJECT FOLLOWINGS/VISIBILITY */

//Get the current user's projects
export const getProjectsByUser = async (): Promise<
  ApiResponse<ProjectPreview[]>
> => {
  const url = `/me/projects`;
  const response = await GET(url);

  console.log(response);
  return response;
};

/**
 * Get all projects the user is a member of and has set to be public for the profile page
 * @param userId - user to search
 * @return - array of projects, or 400 if unsuccessful.
 */
export const getVisibleProjects = async (
  userId: number
): Promise<ApiResponse<ProjectPreview[]>> => {
  const url = `/users/${userId}/projects`;
  const response = await GET(url);

  console.log(response);
  return response;
};

/**
 * Update project visibility for a project a user is a member of. Invalid until shibboleth
 * @param projectID - ID of the project
 * @param _visibility - either "public" or "private", set visibility
 * @return 201 if successful, 400 if not
 */
export const updateProjectVisibility = async (
  projectID: number,
  _visibility: string
) => {
  const url = `me/projects/${projectID}/visibility`;
  const visData = { visibility: _visibility }; //it's expecting this
  const response = await PUT(url, visData);

  if (response.error)
    console.log(`Error in updateProjectVisibility: ${response.error}`);
  console.log(response);
  return response;
};

/**
 * Leaves a project a user is a member of
 * @param projectID - ID of the project you're leaving
 * @return 201 if successful, 400 if not
 */
export const leaveProject = async (projectID: number) => {
  const url = `me/projects/${projectID}/leave`;
  const response = await DELETE(url);

  if (response.error) console.log(`Error in leaveProject: ${response.error}`);
  console.log(response);
  return response;
};

/**
 * Get projects the user is following.
 * @param userId - ID of the user.
 * @returns array of projects, or 400 if error.
 */
export const getProjectFollowing = async (
  userId: number
): Promise<ApiResponse<ProjectPreview[]>> => {
  const url = `/users/${userId}/followings/projects`;
  const response = await GET(url);

  console.log(response);
  return response;
};

/**
 * Follow a project for a user.
 * @param projectId - ID of the project you're following
 * @returns 201 if successful, 400 if not.
 */
export const addProjectFollowing = async (
  projectId: number
): Promise<ApiResponse<ProjectFollowing>> => {
  const url = `/me/followings/projects/${projectId}`;
  const response = await POST(url, {});

  if (response.error)
    console.log(`Error in addProjectFollowing: ${response.error}`);
  console.log(response);
  return response as ApiResponse<ProjectFollowing>;
};

/**
 * Unfollow a project for a user.
 * @param projectId - ID of the project you're unfollowing
 * @returns 200 if successful, 400 if not.
 */
export const deleteProjectFollowing = async (
  projectId: number
): Promise<ApiResponse> => {
  const url = `/me/followings/projects/${projectId}`;
  const response = await DELETE(url);

  console.log(response);
  return response;
};

// Get socials for the current user based on ID.
export const getUserSocials = async (): Promise<ApiResponse<MySocial[]>> => {
  const url = `/me/socials`;
  const response = await GET(url);

  console.log(response);
  return response;
};

// Add socials for the current user by ID
/**
 * @param socialData - Data used to add the social
 */
export const addUserSocials = async (
  socialData: AddUserSocialInput
): Promise<ApiResponse<MySocial>> => {
  const apiURL = `/me/socials`;
  const response = await POST(apiURL, socialData);

  if (response.error) console.log(`Error in addUserSocials: ${response.error}`);
  console.log(response);
  return response as ApiResponse<MySocial>;
};

// Update socials specified by the current user
/**
 * @param websiteId - ID of the social to be updated
 * @param socialData - Data used to update the social
 */
export const updateUserSocials = async (
  websiteId: number,
  socialData: UpdateUserSocialInput
): Promise<ApiResponse<MySocial>> => {
  const apiURL = `/me/socials/${websiteId}`;
  const response = await PATCH(apiURL, socialData);

  if (response.error)
    console.log(`Error in updateUserSocials: ${response.error}`);
  console.log(response);
  return response as ApiResponse<MySocial>;
};

// Delete user socials
/**
 * @param websiteId - ID of the social to be deleted
 */
export const deleteUserSocials = async (
  websiteId: number
): Promise<ApiResponse> => {
  const url = `/me/socials/${websiteId}`;
  const response = await DELETE(url);

  console.log(response);
  return response;
};

// Get skills for the current user based on ID
export const getUserSkills = async (): Promise<ApiResponse<MySkill[]>> => {
  const url = `/me/skills`;
  const response = await GET(url);

  console.log(response);
  return response;
};

// Add a skill to the current user
/**
 * @param skillData - Data with which to add a skill
 */
export const addUserSkills = async (
  skillData: AddUserSkillsInput
): Promise<ApiResponse<MySkill>> => {
  const url = `/me/skills`;
  const response = await POST(url, skillData);

  if (response.error) console.log(`Error in addUserSkills: ${response.error}`);
  console.log(response);
  return response as ApiResponse<MySkill>;
};

// Updates a user skill
/**
 * @param skillId - ID of the skill to be updated
 * @param skillData - Data with which to update the skill
 */
export const updateUserSkills = async (
  skillId: number,
  skillData: UpdateUserSkillInput
): Promise<ApiResponse<MySkill>> => {
  const url = `/me/skills/${skillId}`;
  const response = await PATCH(url, skillData);

  if (response.error)
    console.log(`Error in updateUserSkills: ${response.error}`);
  console.log(response);
  return response as ApiResponse<MySkill>;
};

// Delete a user skill
/**
 * @param skillId - ID of the skill
 */
export const deleteUserSkills = async (
  skillId: number
): Promise<ApiResponse<null>> => {
  const url = `/me/skills/${skillId}`;
  const response = await DELETE(url);

  console.log(response);
  return response as ApiResponse<null>;
};

// Get majors for the current user based on ID
export const getUserMajors = async (): Promise<ApiResponse<MyMajor[]>> => {
  const url = `/me/majors`;
  const response = await GET(url);

  console.log(response);
  return response;
};

// Add a major to the current user
export const addUserMajor = async (
  majorData: AddUserMajorInput
): Promise<ApiResponse<MyMajor>> => {
  const url = `/me/majors`;
  const response = await POST(url, majorData);

  if (response.error) console.log(`Error in addUserMajor: ${response.error}`);
  console.log(response);
  return response as ApiResponse<MyMajor>;
};

// Delete a user major
/**
 * @param majorId - ID of the major to be deleted
 */
export const deleteUserMajor = async (
  majorId: number
): Promise<ApiResponse<null>> => {
  const url = `/me/majors/${majorId}`;
  const response = await DELETE(url);

  console.log(response);
  return response as ApiResponse<null>;
};

/* DATASETS */

/**
 * Retrieves list of majors.
 */
export const getMajors = async (): Promise<ApiResponse<Major[]>> => {
  const apiURL = `/datasets/majors`;
  const response = await GET(apiURL);

  console.log(response);
  return response;
};

/**
 * Gets list of job titles.
 */
export const getJobTitles = async (): Promise<ApiResponse<Role[]>> => {
  const apiURL = `/datasets/roles`;
  const response = await GET(apiURL);

  console.log(response);
  return response;
};

/**
 * Retrieves list of project types.
 */
export const getProjectTypes = async (): Promise<ApiResponse<Medium[]>> => {
  const apiURL = `/datasets/mediums`;
  const response = await GET(apiURL);

  console.log(response);
  return response;
};

/**
 * Gets list of skills.
 */
export const getSkills = async (): Promise<ApiResponse<Skill[]>> => {
  const apiURL = `/datasets/skills`;
  const response = await GET(apiURL);

  console.log(response);
  return response;
};

/**
 * Retrieves list of tags.
 */
export const getTags = async (): Promise<ApiResponse<Tag[]>> => {
  const apiURL = `/datasets/tags`;
  const response = await GET(apiURL);

  console.log(response);
  return response;
};

/**
 * Gets list of socials links.
 */
export const getSocials = async (): Promise<ApiResponse<Social[]>> => {
  const apiURL = `/datasets/socials`;
  const response = await GET(apiURL);

  console.log(response);
  return response;
};

export default {
  createNewUser,
  getUsers,
  getUsersById,
  editUser,
  deleteUser,
  getUserByUsername,
  getUserByEmail,
  getUserFollowing,
  getUserFollowers,
  addUserFollowing,
  deleteUserFollowing,
  getProjectsByUser,
  getVisibleProjects,
  updateProjectVisibility,
  leaveProject,
  getProjectFollowing,
  addProjectFollowing,
  deleteProjectFollowing,
  getUserSocials,
  addUserSocials,
  updateUserSocials,
  deleteUserSocials,
  getUserSkills,
  addUserSkills,
  updateUserSkills,
  deleteUserSkills,
  getUserMajors,
  addUserMajor,
  deleteUserMajor,
  getMajors,
  getJobTitles,
  getProjectTypes,
  getSkills,
  getTags,
  getSocials,
};
