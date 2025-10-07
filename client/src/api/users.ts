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
  Major, Skill, Role, Medium, Tag, Social,
  UpdateUserInput,
  AddUserSocialInput,
  UpdateUserSocialInput,
  AddUserSkillsInput,
  UpdateUserSkillInput
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
  const apiURL = `/me/get-username`;
  const response = await GET(apiURL);

  console.log(response);
  return response;
};

/**
 * Gets all data on all public users. Does not return private ones
 * @returns result - JSONified data of all users, else if error, '400'.
 */
export const getUsers = async (): Promise<ApiResponse<UserPreview[]>> => {
  const apiURL = `/users`;
  const response = await GET(apiURL);

  console.log(response);
  return response;
};

/**
 * Gets all data on one specific user, specified by URL.
 * @param id - database id for user
 * @returns result - JSONified data of specified user.
 */
export const getUsersById = async (id: string): Promise<ApiResponse<UserDetail>> => {
  const apiURL = `/users/${id}`;
  const response = await GET(apiURL);

  console.log(response);
  return response;
};

/**
 * Gets the current user by ID
 * @param devId - ID to be used as the current user
 */
export const getCurrentUserById = async (devId?: number): Promise<ApiResponse<MePrivate>> => {
  const apiURL = `/me${devId ? `?devId=${devId}` : ""}`;
  const response = await GET(apiURL);

  console.log(response);
  return response;
}

/**
 * Edit information for one user, specified by URL.
 * @param devId - user_id for user
 * @param data - mapped(eg {data1:'value1', data2:'value2'}) data to change for user
 * @returns response data
 */
export const editUser = async (
  data: UpdateUserInput,
  devId?: number
): Promise<ApiResponse<MePrivate>> => {
  const apiURL = `/me${devId ? `?devId=${devId}` : ""}`;
  const form = new FormData();
  
  for (const [name, value] of Object.entries(data)){
    if(value !== null) form.append(name, value);
  }

  const response = await PATCH(apiURL, form);

  if(response.error) console.log(`Error in editUser: ${response.error}`);
  return response as ApiResponse<MePrivate>; //it would get mad at me if i didn't do this soooo
};

/**
 * Removes a user specified by URL.
 * @returns response data
 * @param devId - ID to be used as the current user
 */
export const deleteUser = async (devId?: number): Promise<ApiResponse> => {
  const apiURL = `/me${devId ? `?devId=${devId}` : ""}`;
  const response = await DELETE(apiURL);

  console.log(response);
  return response;
};

/* ACCOUNT INFO/ PASSWORD RESET*/

/**
 * Get account information of a user through ID.
 * Invalid until we get shibboleth.
 * @param user_id - int, id of the user
 * @returns data - JSONified data from account information. 400 if not valid.
 */
export const getAccountInformation = async (user_id: number) => {
  const apiURL = `/users/${user_id}`;
  const response = await GET(apiURL);

  console.log(response);
  return response;
};


/* LOOKUP USER */

/**
 * Get User by Username
 * @param username - Username of user to be recieved
 * @return data, list of 1 user, or 400 if not successful
 */
export const getUserByUsername = async (username: string): Promise<ApiResponse<UserPreview>> => {
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
export const getUserByEmail = async (email: string): Promise<ApiResponse<UserPreview>> => {
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
export const getUserFollowing = async (id: number): Promise<ApiResponse<UserPreview[]>> => {
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
}

/**
 * Follow a person for a user.
 * @param {number} id - user's id
 * @param devId - ID to be used as the current user
 * @returns 201 if successful, 400 if not
 */
export const addUserFollowing = async (id: number, devId?: number): Promise<ApiResponse<UserFollowing>> => {
  const url = `/me/followings/people/${id}${devId ? `?devId=${devId}` : ""}`;
  const response = await POST(url, {});

  if(response.error) console.log(`Error in addUserFollowing: ${response.error}`)
  console.log(response);
  return response as ApiResponse<UserFollowing>;
};

/**
 * Unfollow person for a user. Unauthorized until shibboleth.
 * @param {number} id - user id of the user.
 * @param devId - ID to be used as the current user
 */
export const deleteUserFollowing = async (id: number, devId?: number) => {
  const url = `/me/followings/people/${id}${devId ? `?devId=${devId}` : ""}`;
  const response = await DELETE(url);

  console.log(response);
  return response;
};

/* PROJECT FOLLOWINGS/VISIBILITY */
/**
 * @param devId - ID to be used as the current user
 */
export const getProjectsByUser = async (devId?: number): Promise<ApiResponse<ProjectPreview[]>> => {
  const url = `/me/projects${devId ? `?devId=${devId}` : ""}`;
  const response = await GET(url);

  console.log(response);
  return response;
};

/**
 * Get all projects the user is a member of and has set to be public for the profile page
 * @param id - user to search
 * @return - array of projects, or 400 if unsuccessful.
 */
export const getVisibleProjects = async (id: number): Promise<ApiResponse<ProjectPreview[]>> => {
  const url = `/users/${id}/projects`;
  const response = await GET(url);

  console.log(response);
  return response;
};

/**
 * Update project visibility for a project a user is a member of. Invalid until shibboleth
 * @param projectID - Id of the project
 * @param _visibility - either "public" or "private", set visibility
 * @return 201 if successful, 400 if not
 */
export const updateProjectVisibility = async (
  projectID: number,
  _visibility: string
) => {
  const url = `/projects/${projectID}/visibility`;
  const data = { visibility: _visibility }; //it's just expecting this
  const response = await PUT(url, data);

  if(response.error) console.log(`Error in updateProjectVisibility: ${response.error}`)
  console.log(response);
  return response;
};

/**
 * Get projects the user is following.
 * @param id - ID of the user.
 * @returns array of projects, or 400 if error.
 */
export const getProjectFollowing = async (id: number): Promise<ApiResponse<ProjectPreview[]>> => {
  const url = `/users/${id}/followings/projects`;
  const response = await GET(url);

  console.log(response);
  return response;
};

/**
 * Follow a project for a user.
 * @param id - user ID trying to follow a project.
 * @param devId - ID to be used as the current user
 * @returns 201 if successful, 400 if not.
 */
export const addProjectFollowing = async (id: number, devId?: number): Promise<ApiResponse<ProjectFollowing>> => {
  const url = `/me/followings/projects/${id}${devId ? `?devId=${devId}` : ""}`;
  const response = await POST(url, {});

  if(response.error) console.log(`Error in addProjectFollowing: ${response.error}`)
  console.log(response);
  return response as ApiResponse<ProjectFollowing>;
}

/**
 * Unfollow a project for a user.
 * @param id - user id
 * @param devId - ID to be used as the current user
 * @returns 200 if successful, 400 if not.
 */
export const deleteProjectFollowing = async (id: number, devId?: number): Promise<ApiResponse> => {
  const url = `/me/followings/projects/${id}${devId ? `?devId=${devId}` : ""}`;
  const response = await DELETE(url);

  console.log(response);
  return response;
};

// Get socials for the current user based on ID
/**
 * 
 * @param devId - ID to be used as the current user
 */
export const getUserSocials = async (devId?: number): Promise<ApiResponse<MySocial[]>> => {
  const url = `/me/socials${devId ? `?devId=${devId}` : ""}`;
  const response = await GET(url);

  console.log(response);
  return response;
};

// Add socials for the current user by ID
/** 
 * @param devId - ID to be used as the current user
 */
export const addUserSocials = async (data: AddUserSocialInput, devId?: number): Promise<ApiResponse<MySocial>> => {
  const apiURL = `/me/socials${devId ? `?devId=${devId}` : ""}`;
  const response = await POST(apiURL, data);

  if(response.error) console.log(`Error in addUserSocials: ${response.error}`)
  console.log(response);
  return response as ApiResponse<MySocial>;
};

// Update socials specified by the current user
/**
 * @param devId - ID to be used as the current user
 */
export const updateUserSocials = async (websiteId: number, data: UpdateUserSocialInput, devId?: number): Promise<ApiResponse<MySocial>> => {
  const apiURL = `/me/socials/${websiteId}${devId ? `?devId=${devId}` : ""}`;
  const response = await PATCH(apiURL, data);

  if(response.error) console.log(`Error in updateUserSocials: ${response.error}`)
  console.log(response);
  return response as ApiResponse<MySocial>;
};

// Delete user socials
/**
* @param devId - ID to be used as the current user
*/
export const deleteUserSocials = async (websiteId: number, devId?: number): Promise<ApiResponse> => {
  const url = `/me/socials/${websiteId}${devId ? `?devId=${devId}` : ""}`;
  const response = await DELETE(url);

  console.log(response);
  return response
}

// Get skills for the current user based on ID
/**
 * @param devId - ID to be used as the current user
 */
export const getUserSkills = async (devId?: number): Promise<ApiResponse<MySkill[]>> => {
  const url = `/me/skills${devId ? `?devId=${devId}` : ""}`;
  const response = await GET(url);

  console.log(response);
  return response;
};

// Add skills to the current user 
/** 
 * @param devId - ID to be used as the current user
 */
export const addUserSkills = async (
  data: AddUserSkillsInput,
  devId?: number
): Promise<ApiResponse<MySkill>> => {
  const url = `/me/skills${devId ? `?devId=${devId}` : ""}`;
  const response = await POST(url, data);

  if(response.error) console.log(`Error in addUserSkills: ${response.error}`)
  console.log(response);
  return response as ApiResponse<MySkill>;
}

// Updates a user skill
/** 
 * @param devId - ID to be used as the current user
*/
export const updateUserSkills = async (
  skillId: number, 
  data: UpdateUserSkillInput,
  devId?: number,
): Promise<ApiResponse<MySkill>> => {
  const url = `/me/skills/${skillId}${devId ? `?devId=${devId}` : ""}`;
  const response = await PATCH(url, data);

  if(response.error) console.log(`Error in updateUserSkills: ${response.error}`)
  console.log(response);
  return response as ApiResponse<MySkill>;
} 

// Delete a user skill
/** 
 * @param devId - ID to be used as the current user
*/
export const deleteUserSkills = async (skillId: number, devId?: number): Promise<ApiResponse<null>> => {
  const url = `/me/skills/${skillId}${devId ? `?devId=${devId}` : ""}`;
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
}

/**
 * Gets list of job titles.
 */
export const getJobTitles = async (): Promise<ApiResponse<Role[]>> => {
  const apiURL = `/datasets/roles`
  const response = await GET(apiURL);

  console.log(response);
  return response;
};

/**
 * Retrieves list of project types.
 */
export const getProjectTypes = async (): Promise<ApiResponse<Medium[]>> => {
  const apiURL = `/datasets/mediums`
  const response = await GET(apiURL);

  console.log(response);
  return response;
}

/**
 * Gets list of skills.
 */
export const getSkills = async (): Promise<ApiResponse<Skill[]>> => {
  const apiURL = `/datasets/skills`
  const response = await GET(apiURL);

  console.log(response);
  return response;
}

/**
 * Retrieves list of tags.
 */
export const getTags = async (): Promise<ApiResponse<Tag[]>> => {
  const apiURL = `/datasets/tags`
  const response = await GET(apiURL);

  console.log(response);
  return response;
}

/**
 * Gets list of socials links.
 */
export const getSocials = async (): Promise<ApiResponse<Social[]>> => {
  const apiURL = `/datasets/socials`
  const response = await GET(apiURL);

  console.log(response);
  return response;
}

export default {
  createNewUser,
  getUsers,
  getUsersById,
  editUser,
  deleteUser,
  getAccountInformation,
  getUserByUsername,
  getUserByEmail,
  getUserFollowing,
  addUserFollowing,
  deleteUserFollowing,
  getProjectsByUser,
  getVisibleProjects,
  updateProjectVisibility,
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
  getMajors,
  getJobTitles,
  getProjectTypes,
  getSkills,
  getTags,
  getSocials,
};
