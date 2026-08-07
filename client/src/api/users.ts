import { GET, POST, PUT, DELETE, PATCH } from "./index";
import type {
  ApiResponse,
  UserPreview,
  UserDetail,
  UsernameResponse,
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
  UserFollowsList,
  ProjectDetail,
  ProjectFollowsList,
  UpdateProjectProfileVisibilityInput,
  MyMember,
  SessionUserData,
  CreateUserInput,
  UpdateTagBlacklistInput,
  GalleryImage,
  GalleryVideo,
  AddGalleryImageInput,
  AddGalleryVideoInput,
} from "@looking-for-group/shared";

//#region USER CRUD/LOGIN

/**
 * Creates a new user
 * @param userData - data for creating a user
 * @returns status - 200 if valid, 400 if not
 */
export const createNewUser = async (
  userData: CreateUserInput
): Promise<ApiResponse> => {
  const apiURL = "/users";

  const response = await POST(apiURL, userData);

  if (response.error) console.log(`Error in createUser: ${response.error}`);
  return response as ApiResponse<MePrivate>;
};

export const googleLogin = async (
  credential: { credential: string }
): Promise<ApiResponse> => {
  const apiURL = '/google-login';

  return await POST(apiURL, credential);
}
export const googleLogout = async (
  userId: number,
): Promise<ApiResponse> => {
  const apiURL = '/google-login';

  return await DELETE(apiURL, { userId });
}

export const testLogin = async (): Promise<ApiResponse<SessionUserData>> => {
  const apiURL = '/google-login/test';

  return await GET(apiURL);
}

/**
 * Checks if the user is logged in (googleAuth) and returns username if they are
 * @returns ApiResponse with username is logged in, 404 if guest
 */
export const getCurrentUsername = async (): Promise<UsernameResponse> => {
  // const apiURL = `/me/get-username`;
  const apiURL = `/me`;
  const response = await GET(apiURL);

  //console.log(response);
  return {
    status: response.status,
    data:
      response.status === 200
        ? {
          userId: (response.data as MePrivate).userId,
          username: (response.data as MePrivate).username,
        }
        : undefined,
    error: response.error,
  };
};

/**
 * Gets all data on all public users. Does not return private ones
 * @returns result - JSONified data of all users, else if error, '400'.
 */
export const getUsers = async (method?: string): Promise<ApiResponse<UserPreview[]>> => {
  //NOTE: the "A-Z" is a default implementation of sorting method
  //CHANGE THIS WHEN SORTING METHOD FRONTEND IS IMPLEMENTED!!
  const apiURL = `/users/all/${method ?? 'A-Z'}`;
  const response = await GET(apiURL);
  //TODO: revisit this to make it include filters
  //but filters are a stretch goal anyway so it's not too important
  //console.log(response);
  return response;
};

/**
 * Gets all data on one specific user, specified by URL.
 * @param id - database id for user
 * @returns result - JSONified data of specified user.
 */
export const getUsersById = async (
  id: number
): Promise<ApiResponse<UserDetail>> => {
  const apiURL = `/users/${id}`;
  const response = await GET(apiURL);

  //console.log(response);
  return response;
};

//Gets the current user
export const getCurrentAccount = async (): Promise<ApiResponse<MePrivate>> => {
  const apiURL = `/me`;
  const response = await GET(apiURL);

  //console.log(response);
  return response;
};

/**
 * gets the images uploaded to a user's gallery
 * @param userId the ID of the user with the gallery
 * @returns an array of all the images from a user gallery
 */
export const getGalleryImages = async (userId: number): Promise<ApiResponse<GalleryImage[]>> => {
  const apiURL = `/me/gallery/${userId}/images`;
  const response = await GET(apiURL);

  if (response.error) console.log(`Error in addPic: ${response.error}`);
  return response;
}

/**
 * gets the videos uploaded to a user's gallery
 * @param userId the ID of the user with the gallery
 * @returns an array of all the videos from a user gallery
 */
export const getGalleryVideos = async (userId: number): Promise<ApiResponse<GalleryVideo[]>> => {
  const apiURL = `/me/gallery/${userId}/videos`;
  const response = await GET(apiURL);

  if (response.error) console.log(`Error in addPic: ${response.error}`);
  return response;
}

/**
 * adds an image to the user's gallery
 * @param userId id of the user
 * @param image information on the image to be uploaded
 * @returns response
 */
export const postGalleryImage = async (userId: number, imageData: AddGalleryImageInput): Promise<ApiResponse<GalleryImage>> => {
  const apiURL = `/me/gallery/${userId}/images`;

  const form = new FormData();
  for (const [name, value] of Object.entries(imageData)) {
    if (value !== null) form.append(name, value);
  }
  const response = await POST(apiURL, form);

  if (response.error) console.log(`Error in addPic: ${response.error}`);
  return response as ApiResponse<GalleryImage>;
}

/**
 * adds a video to the user's gallery
 * @param userId id of the user
 * @param video information on the video to be uploaded
 * @returns response
 */
export const postGalleryVideo = async (userId: number, video: AddGalleryVideoInput): Promise<ApiResponse<GalleryVideo>> => {
  const apiURL = `/me/gallery/${userId}/videos`;
  const response = await POST(apiURL, video);

  if (response.error) console.log(`Error in addPic: ${response.error}`);
  return response as ApiResponse<GalleryVideo>;
}

/**
 * removes an image from the user's gallery
 * @param userId id of the user
 * @param imageId id of the image
 * @returns response
 */
export const deleteGalleryImage = async (userId: number, imageId: number): Promise<ApiResponse<any>> => {
  const apiURL = `/me/gallery/${userId}/images/${imageId}`;
  const response = await DELETE(apiURL);

  if (response.error) console.log(`Error in addPic: ${response.error}`);
  return response;
}

/**
 * removes a video from the user's gallery
 * @param userId id of the user
 * @param videoId id of the video
 * @returns response
 */
export const deleteGalleryVideo = async (userId: number, videoId: number): Promise<ApiResponse<any>> => {
  const apiURL = `/me/gallery/${userId}/videos/${videoId}`;
  const response = await DELETE(apiURL);

  if (response.error) console.log(`Error in addPic: ${response.error}`);
  return response;
}

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
    if (value !== null) form.append(name, value as string);
    //ohhhh i see, it auto appends a string for the displayPhone because this can't take booleans for some reason...
    //this has to be a FormData to allow images so i can't change that, guess i'll have to stick with the weird parse on the backend
  }

  const response = await PATCH(apiURL, form);

  if (response.error) console.log(`Error in editUser: ${response.error}`);
  return response as ApiResponse<MePrivate>; //it would get mad at me if i didn't do this soooo
};

/**
 * Sends in a report of a user -- they did something bad!
 * @param userId ID of the user that is being reported
 * @param report The message that was sent along with the report
 * @returns 
 */
export const reportUser = async (
  userId: number,
  report: string
): Promise<ApiResponse> => {
  const apiURL = `/me/users/report/${userId}`;
  const response = await POST(apiURL, { reason: report });

  if (response.error) console.log(`Error in reportUser: ${response.error}`);
  return response;
};

//Removes a user specified by URL.
export const deleteUser = async (): Promise<ApiResponse> => {
  const apiURL = `/me`;
  const response = await DELETE(apiURL);

  //console.log(response);
  return response;
};

/**
 * Gets an array of all users the current user has blocked
 * @returns JSONified data of all users the current user has blocked
 */
export const getBlockedUsersById = async () => {
  const apiURL = `/me/blocklist`;
  const response = await GET(apiURL);
  //console.log(response);

  if (response.error) {
    console.error(response.error);
  }

  return response;
}

/**
 * Blocks a user by userID
 * @param blockedUserID The userID of the person to block
 */
export const blockUser = async (blockedUserID: number | undefined) => {
  const apiURL = `/me/blocklist`;
  const response = await POST(apiURL, { userId: blockedUserID });
  //console.log(response);

  if (response.error) {
    console.error(response.error);
  }

  return response;
}

/**
 * Unblocks a user by userID
 * @param blockedUserID The userID of the person to unblock
 */
export const unblockUser = async (blockedUserID: number | undefined) => {
  const apiURL = `/me/blocklist`;
  const response = await DELETE(apiURL, { userId: blockedUserID });
  //console.log(response);

  if (response.error) {
    console.error(response.error);
  }

  return response;
}

/* ACCOUNT INFO/ PASSWORD RESET*/

//#region USER LOOKUP

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

  //console.log(response);
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

  //console.log(response);
  return response;
};
//#endregion

//#region USER FOLLOWINGS

/**
 * Get people that a user is following.
 * @param {number} id - id of the user that we are searching.
 * @returns array of users following, or 400 if unsuccessful.
 */
export const getUserFollowing = async (
  id: number
): Promise<ApiResponse<UserFollowsList>> => {
  const url = `/users/${id}/followings/people`;
  const response = await GET(url);

  //console.log(response);
  return response;
};

/** Get list of users that are following the specified user
 * @param {number} id - id of the user that we are searching.
 */
export const getUserFollowers = async (id: number): Promise<ApiResponse> => {
  const url = `/users/${id}/followers`;
  const response = await GET(url);

  //console.log(response);
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
  //console.log(response);
  return response as ApiResponse<UserFollowing>;
};

/**
 * Unfollow person for a user. Unauthorized until googleAuth.
 * @param {number} userId - ID of the user being followed
 */
export const deleteUserFollowing = async (id: number) => {
  const url = `/me/followings/people/${id}`;
  const response = await DELETE(url);

  //console.log(response);
  return response;
};
//#endregion

//#region TAG BLACKLIST

/**
 * Get the current user's tag blacklist
 * @returns 200 if successful, 404 if not
 */
export const getTagExclusion = async (): Promise<
  ApiResponse<Tag[]>
> => {
  const url = `/me/tag-blacklist`;
  const response = await GET(url);

  return response;
};

/**
 * Update the current user's tag blacklist
 * @param {Tag[]} newBlacklist - The updated tag blacklist
 * @returns 201 if successful, 404 if not
 */
export const updateTagExclusion = async (
  newBlacklist: UpdateTagBlacklistInput
): Promise<ApiResponse<Tag[]>> => {
  const url = `/me/tag-blacklist`;
  const response = await PATCH(url, newBlacklist);

  if (response.error) console.log(`Error in updateTagBlacklist: ${response.error}`);
  //console.log(response);
  return response as ApiResponse<Tag[]>;
};

/**
 * Gets a list of all tags
 * @returns API response, data is Tag[]
 */
export const getAllTags = async () => {
  const URL = `/datasets/tags`;
  const res = await GET(URL);

  if (res.error) {
    console.log(`Error in getAllTags: ${res.error}`);
  }

  return res;
}

//#endregion

// #region PROJECT FOLLOWINGS/VISIBILITY

//Get the current user's projects
export const getProjectsByUser = async (): Promise<
  ApiResponse<ProjectDetail[]>
> => {
  const url = `/me/projects`;
  const response = await GET(url);

  //console.log(response);
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

  //console.log(response);
  return response;
};

/**
 * Update project visibility for a project a user is a member of. Invalid until googleAuth
 * @param projectID - ID of the project
 * @param _visibility - either "public" or "private", set visibility
 * @return 201 if successful, 400 if not
 */
export const updateProjectProfileVisibility = async (
  projectID: number,
  visibility: UpdateProjectProfileVisibilityInput
): Promise<ApiResponse<MyMember>> => {
  const url = `/me/projects/${projectID}/visibility`;
  const response = await PUT(url, visibility);

  if (response.error)
    console.log(`Error in updateProjectVisibility: ${response.error}`);
  return response as ApiResponse<MyMember>;
};

/**
 * Leaves a project a user is a member of
 * @param projectID - ID of the project you're leaving
 * @return 201 if successful, 400 if not
 */
export const leaveProject = async (projectID: number): Promise<ApiResponse<null>> => {
  const url = `/me/projects/${projectID}/leave`;
  const response = await DELETE(url);

  // if (response.error) //console.log(`Error in leaveProject: ${response.error}`);
  //console.log(response);
  return response as ApiResponse<null>;
};

/**
 * Get projects the user is following.
 * @param userId - ID of the user.
 * @returns array of projects, or 400 if error.
 */
export const getProjectFollowing = async (
  userId: number
): Promise<ApiResponse<ProjectFollowsList>> => {
  const url = `/users/${userId}/followings/projects`;
  const response = await GET(url);

  //console.log(response);
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
  //console.log(response);
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

  //console.log(response);
  return response;
};

//#endregion

//#region SOCIALS
// Get socials for the current user based on ID.
export const getUserSocials = async (): Promise<ApiResponse<MySocial[]>> => {
  const url = `/me/socials`;
  const response = await GET(url);

  //console.log(response);
  return response;
};

// Add socials for the current user by ID
/**
 * @param socialData - Data used to add the social
 */
export const addUserSocial = async (
  socialData: AddUserSocialInput
): Promise<ApiResponse<MySocial>> => {
  const apiURL = `/me/socials`;
  const response = await POST(apiURL, socialData);

  if (response.error) console.log(`Error in addUserSocial: ${response.error}`);
  //console.log(response);
  return response as ApiResponse<MySocial>;
};

// Update socials specified by the current user
/**
 * @param id - DB id of the social to be updated
 * @param socialData - Data used to update the social
 */
export const updateUserSocial = async (
  id: number,
  socialData: UpdateUserSocialInput
): Promise<ApiResponse<MySocial>> => {
  const apiURL = `/me/socials/${id}`;
  const response = await PATCH(apiURL, socialData);

  if (response.error)
    console.log(`Error in updateUserSocial: ${response.error}`);
  //console.log(response);
  return response as ApiResponse<MySocial>;
};

// Delete user socials
/**
 * @param id - DB id of the social to be deleted
 */
export const deleteUserSocial = async (
  id: number
): Promise<ApiResponse> => {
  const url = `/me/socials/${id}`;
  const response = await DELETE(url);

  //console.log(response);
  return response;
};
//#endregion

//#region SKILLS
// Get skills for the current user based on ID
export const getUserSkills = async (): Promise<ApiResponse<MySkill[]>> => {
  const url = `/me/skills`;
  const response = await GET(url);

  //console.log(response);
  return response;
};

// Add a skill to the current user
/**
 * @param skillData - Data with which to add a skill
 */
export const addUserSkill = async (
  skillData: AddUserSkillsInput
): Promise<ApiResponse<MySkill>> => {
  const url = `/me/skills`;
  const response = await POST(url, skillData);

  if (response.error) console.log(`Error in addUserSkill: ${response.error}`);
  //console.log(response);
  return response as ApiResponse<MySkill>;
};

// Updates a user skill
/**
 * @param skillId - ID of the skill to be updated
 * @param skillData - Data with which to update the skill
 */
export const updateUserSkill = async (
  skillId: number,
  skillData: UpdateUserSkillInput
): Promise<ApiResponse<MySkill>> => {
  const url = `/me/skills/${skillId}`;
  const response = await PATCH(url, skillData);

  if (response.error)
    console.log(`Error in updateUserSkill: ${response.error}`);
  //console.log(response);
  return response as ApiResponse<MySkill>;
};

// Delete a user skill
/**
 * @param skillId - ID of the skill
 */
export const deleteUserSkill = async (
  skillId: number
): Promise<ApiResponse<null>> => {
  const url = `/me/skills/${skillId}`;
  const response = await DELETE(url);

  //console.log(response);
  return response as ApiResponse<null>;
};

//#endregion

//#region MAJORS
// Get majors for the current user based on ID
export const getUserMajors = async (): Promise<ApiResponse<MyMajor[]>> => {
  const url = `/me/majors`;
  const response = await GET(url);

  //console.log(response);
  return response;
};

// Add a major to the current user
export const addUserMajor = async (
  majorData: AddUserMajorInput
): Promise<ApiResponse<MyMajor>> => {
  const url = `/me/majors`;
  const response = await POST(url, majorData);

  if (response.error) console.log(`Error in addUserMajor: ${response.error}`);
  //console.log(response);
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

  //console.log(response);
  return response as ApiResponse<null>;
};
//#endregion

//#region DATASETS

/**
 * Retrieves list of majors.
 */
export const getMajors = async (): Promise<ApiResponse<Major[]>> => {
  const apiURL = `/datasets/majors`;
  const response = await GET(apiURL);

  //console.log(response);
  return response;
};

/**
 * Gets list of job titles.
 */
export const getJobTitles = async (): Promise<ApiResponse<Role[]>> => {
  const apiURL = `/datasets/roles`;
  const response = await GET(apiURL);

  //console.log(response);
  return response;
};

/**
 * Retrieves list of project types.
 */
export const getProjectTypes = async (): Promise<ApiResponse<Medium[]>> => {
  const apiURL = `/datasets/mediums`;
  const response = await GET(apiURL);

  //console.log(response);
  return response;
};

/**
 * Gets list of skills.
 */
export const getSkills = async (): Promise<ApiResponse<Skill[]>> => {
  const apiURL = `/datasets/skills`;
  const response = await GET(apiURL);

  //console.log(response);
  return response;
};

/**
 * Retrieves list of tags.
 */
export const getTags = async (): Promise<ApiResponse<Tag[]>> => {
  const apiURL = `/datasets/tags`;
  const response = await GET(apiURL);

  //console.log(response);
  return response;
};

/**
 * Gets list of socials links.
 */
export const getSocials = async (): Promise<ApiResponse<Social[]>> => {
  const apiURL = `/datasets/socials`;
  const response = await GET(apiURL);

  //console.log(response);
  return response;
};
//#endregion

export default {
  createNewUser,
  getUsers,
  getUsersById,
  editUser,
  reportUser,
  deleteUser,
  getUserByUsername,
  getUserByEmail,
  getUserFollowing,
  getUserFollowers,
  addUserFollowing,
  deleteUserFollowing,
  getProjectsByUser,
  getVisibleProjects,
  updateProjectProfileVisibility,
  leaveProject,
  getProjectFollowing,
  addProjectFollowing,
  deleteProjectFollowing,
  getUserSocials,
  addUserSocial,
  updateUserSocial,
  deleteUserSocial,
  getUserSkills,
  addUserSkill,
  updateUserSkill,
  deleteUserSkill,
  getUserMajors,
  addUserMajor,
  deleteUserMajor,
  getMajors,
  getJobTitles,
  getProjectTypes,
  getSkills,
  getTags,
  getSocials,
  getCurrentAccount,
  getGalleryImages,
  getGalleryVideos,
  postGalleryImage,
  postGalleryVideo,
  deleteGalleryImage,
  deleteGalleryVideo,
};
