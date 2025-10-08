import { GET, POST, PUT, DELETE, PATCH } from "./index";
import type {
  ApiResponse,
  User,
  UserPreview,
  UserDetail,
  ProjectPreview,
  ProjectFollowing,
  UserFollowing,
  MePrivate,
  MySocial,
  MySkill,
  Major, Skill, Role, Medium, Tag, Social
} from "@looking-for-group/shared";

/* USER CRUD */

//This probably will change with shibbolth???
/**
 * Creates a new user, and adds them to the signups table. All data params default to null.
 * NOT GOING TO NEED THIS WITH SHIBBOLETH
 * @param token - from url, security token
 * @param email - get signup email if the token is valid. Checks if a user with that email already exists.
 * @param userData - data for creating a user
 * @returns status - 200 if valid, 400 if not
 */
export const createNewUser = async (
  token: string,
  email: string,
  userData: UserPreview
): Promise<ApiResponse> => {
  //check if token is valid
  const apiURL = `/signup/${token}`;

  //token validation
  const tokenRes = await GET(apiURL);
  if (tokenRes.status === 400) {
    console.log("Token does not exist.");
    return { status: 400, error: "Token does not exist." };
  }

  const userExist = await userInDatabase(email);
  if (userExist) {
    return {
      status: 400,
      error: "User is already in database.",
    };
  }

  const response = await POST(apiURL, userData);
  if (response.status === 400) {
    console.log("Error creating a new user.");
    return { status: 400, error: "Error creating a new user." };
  }
  console.log(`User ${email} created.`);
  console.log(response);
  return response;
};

/**
 * Signup with token only, unneeded with shibboleth
 * @param token - from url, security token
 */
export const signupWithToken = async (
  token: string
): Promise<ApiResponse> => {
  // check if token is valid
  const apiURL = `/signup/${token}`;

  const response = await GET(apiURL);

  if (response.status === 400) {
    console.log("Invalid signup token.");
    return { status: 400, error: "Invalid signup token." };
  }

  return response;
};

/**
 * Signup with no token (unneeded with shibboleth?)
 * @param data - Object sent with user info 
 */
export const signUp = async (
  data: object
): Promise<ApiResponse> => {
  const apiURL = `/signup`;
  
  const response = await POST(apiURL, data);

  if (response.status === 400) {
    console.log("Error creating a new user.");
    return { status: 400, error: "Error creating a new user." };
  }
  console.log(`User created.`);

  return response;
}


/**
 * Checks if the user is logged in (shibboleth) and returns username if they are
 * @returns ApiResponse with username is logged in, 404 if guest
 */
export const getCurrentUsername = async (): Promise<ApiResponse> => {
  const apiURL = `/me/get-username`;

  try {
    //can maybe add custom headers here for dev mode
    const response = await GET(apiURL);
    if (response.status !== 200) {
      return { status: response.status, error: response.error, data: null };
    }

    return { status: 200, error: null, data: response.data };
  } catch (e) {
    console.log("Error fetching username by Shibboleth:", e);
    return { status: 500, error: "Internal error", data: null };
  }
};

/**
 * Gets all data on all public users. Does not return private ones
 * @returns result - JSONified data of all users, else if error, '400'.
 */
export const getUsers = async (): Promise<ApiResponse<UserPreview[]>> => {
  const apiURL = `/users`;
  try {
    const response = await GET(apiURL);
    return { status: 200, error: null, data: response.data as UserPreview[] };
  }
  catch (e) {
    console.log("Error fetching users: ", e);
    return { status: 500, error: "Internal error", data: null };
  }
};

/**
 * Gets all data on one specific user, specified by URL.
 * @param id - university id for user
 * @returns result - JSONified data of specified user.
 */
export const getUsersById = async (id: string): Promise<ApiResponse<UserDetail>> => {
  const apiURL = `/users/${id}`;
  try {
    const response = await GET(apiURL);
    return {status: 200, error: null, data: response.data as UserDetail};
  }
  catch (e) {
    console.log("Error fetching users with ID: ", e);
    return {status: 500, error: "Internal error", data: null};
  }
};

/**
 * Gets the current user by ID
 * @param devId - ID to be used as the current user
 */
export const getCurrentUserById = async (devId?: number): Promise<ApiResponse<MePrivate>> => {
  const apiURL = `/me${devId ? `?devId=${devId}` : ""}`;
  try {
    const response = await GET(apiURL);
    if (response.status !== 200) {
      return { status: response.status, error: response.error, data: null }
    }

    return { status: 200, error: null, data: response.data as MePrivate }
  }
  catch (e) {
    console.log("Error fetching users with ID: ", e);
    return {status: 500, error: "Internal error", data: null};
  }
}

/**
 * Edit information for one user, specified by URL.
 * @param devId - user_id for user
 * @param data - mapped(eg {data1:'value1', data2:'value2'}) data to change for user
 * @returns response data
 */
export const editUser = async (
  data: Partial<User>,
  devId?: number
): Promise<ApiResponse<MePrivate>> => {
  const apiURL = `/me${devId ? `?devId=${devId}` : ""}`;
  try {
  const response = await PATCH(apiURL, data);
  if (response.status !== 200) {
    return { status: response.status, error: response.error, data: null}
  }
  return { status: 200, error: null, data: response.data as MePrivate}
  }
  catch (e) {
    console.log("Error editing user ", e);
    return {status: 500, error: "Internal error", data: null};
  }
};

/**
 * Removes a user specified by URL.
 * @returns response data
 * @param devId - ID to be used as the current user
 */
export const deleteUser = async (devId?: number): Promise<ApiResponse> => {
  const apiURL = `/me${devId ? `?devId=${devId}` : ""}`;
  try {
    const response = await DELETE(apiURL);
    if (response.status !== 200) {
      return {status: response.status, error: response.error, data: null}
    }
    return {status: 200, error: null, data: null};
  }
  catch (e) {
    console.log("Error deleting user ", e);
    return {status: 500, error: "Internal error", data: null};
  }
};

/* USER VERIFICATION */

/**
 * Checks if a User is already within database through RIT email
 * @param email - RIT email, string
 * @returns result - boolean, true if they exist within database, false if not.
 */
export const userInDatabase = async (email: string): Promise<boolean> => {
  const apiURL = `/users/search-email/${email}`;
  const response = await GET(apiURL);

  if (response.status === 400) {
    console.log("Error fetching email.");
    return false;
  } else {
    if (!response.data) {
      console.log(response.data);
      return false;
    }
    console.log("User found with email", email);
    return true;
  }
};

//NEED TO DO//

/* PROFILE MANAGMENT */

/**
 * Update Profile Picture for a user's id.
 * @param image - file, the picture to put into the user's profile
 * @param devId - ID to be used as the current user
 * @return status, 200 if successful, 400 if not, and data. data=array[object] with the profile_image, string, name of the file
 */
export const updateProfilePicture = async (
  image: File,
  devId?: number
): Promise<ApiResponse> => {
  const apiURL = `/me${devId ? `?devId=${devId}` : ""}`;

  const formData = new FormData();
  formData.append("image", image);
  
  const response = await PUT(apiURL, formData);
  if (response.status === 400) {
    console.log("error updating profile picture.");
    return { status: 400, error: "Error updating profile picture." };
  }
  console.log("Updated Profile Picture for user.");
  return response;
};

/**
 * Update email for a user
 * @param id = user_id for the profile wishing to change email.
 * @param _email - email to change to
 * @param _confirm_email - secondary entering of email to confirm
 * @param _password - the user's current password.
 * @returns response, 200 if valid, 400 if not, 401 if emails do not match.
 */
export const updateEmail = async (
  id: number,
  _email: string,
  _confirm_email: string,
  _password: string
): Promise<ApiResponse> => {
  if (_email != _confirm_email) {
    console.log("Not the same email, try again.");
    return { status: 401, error: "Emails do not match" };
  }
  const apiURL = `/users/${id}/email`;
  const data = {
    email: _email,
    confirm: _confirm_email,
    password: _password,
  };

  const response = await PUT(apiURL, data);
  if (response.status === 400) {
    console.log("error updating email.");
    return { status: 400, error: "Error updating email." };
  }
  console.log("Updated primary email for user.");

  return response;
};

/**
 * Update username through id.
 * @param id
 * @param _username - username to change to
 * @param _confirm_user - secondary entering of username to confirm
 * @param _password - the user's current password.
 * @returns response, 200 if valid, 400 if not, 401 if users do not match.
 */
export const updateUsername = async (
  id: number,
  _username: string,
  _confirm_user: string,
  _password: string
): Promise<ApiResponse> => {
  if (_username != _confirm_user) {
    console.log("Usernames are not the same.");
    return { status: 401, error: "Usernames are not the same." };
  }
  const apiURL = `/users/${id}/username`;
  const data = {
    username: _username,
    confirm_user: _confirm_user,
    password: _password,
  };

  const response = await PUT(apiURL, data);
  if (response.status === 400) {
    console.log("error updating username.");
    return { status: 400, error: "Error updating username." };
  }
  console.log("Updated primary username for user.");
  return { status: 400, data: response.data };
};

/**
 * NEEDS TO CHNAGE FOR SHIBBOLETH
 * Update Password for user specified with user_id
 * @param id = int, user id for the user wishing to change
 * @param _newPassword = string, new password
 * @param _password_confirm - string, confirm password to be the same as the new password
 * @param _password - string, user's current password
 * @param _token
 */
// export const updatePassword = async (id: number, _newPassword: string, _password_confirm: string, _password: string, _token: string): Promise<ApiResponse> => {
//     if (!_newPassword || !_password_confirm) {
//         console.log('Missing passwords.');
//         return { status: 400, error: 'Missing passwords.' };
//     }
//     if (_newPassword != _password_confirm) {
//         console.log('Password and confirmation are not the same.');
//         return { status: 400, error: 'Password and confirmation are not the same.' };
//     }
//     console.log('Token accepted, email verified.');

//     //get email if token is valid
//     let url = `${root}/resets/password/${_token}`;
//     let authCheck = await GET(url);
//     if (!authCheck.data.email) {
//         console.log('Your token has expired.');
//         return authCheck;
//     }
//     console.log('Token accepted, email verified.');

//     //update user password
//     url = `${root}/users/${id}/password`;
//     const data = {
//     };
//     const response = await PUT(url, data);
//     if (response.status === 400) {
//         console.log('Error putting new password.');
//         return { status: 400, error: response.error };
//     }

//     console.log('User password updated successfully.');
//     return { status: 201, data: response.data };

// }

/**
 * Updates user visibility, between 0 (private) and 1 (public). just a switch.
 * @param id - user_id for the user
 * @returns 400 if error, 200 if valid
//  */
// export const updateUserVisibility = async (
//   id: number
// ): Promise<ApiResponse> => {
//   const url = `/users/${id}`;
//   const userResponse = await GET(url);
//   if (userResponse.status !== 200) {
//     return {
//       status: 400,
//       error: "Unable to fetch user data",
//     };
//   }

//   const vis = userResponse.data.visibility;
//   let data: { visibility: number };

//   if (vis == 1) {
//     data = {
//       visibility: 0,
//     };
//   } else if (vis == 0) {
//     data = {
//       visibility: 1,
//     };
//   } else {
//     return {
//       status: 400,
//       error: "Invalid visibility error.",
//     };
//   }
//   const result = await editUser(id, data);
//   if (result.status === 400) {
//     console.log("Error editing user.");
//     return { status: 400, error: "Error editing user." };
//   }
//   return {
//     status: 200,
//     error: null,
//     data: result.data,
//   };
// };

/* ACCOUNT INFO/ PASSWORD RESET*/

/**
 * Get account information of a user through ID.
 * Invalid until we get shibboleth.
 * @param user_id - int, id of the user
 * @returns data - JSONified data from account information. 400 if not valid.
 */
export const getAccountInformation = async (user_id: number) => {
  const apiURL = `/users/${user_id}/account`;
  const response = await GET(apiURL);
  //console.log(response);
  if (response.status === 401) {
    //console.log(response.error);
    return response;
  }

  //console.log("User account information recieved");
  return response;
};

//requestPasswordReset

/* LOOKUP USER */

/**
 * Get User by Username
 * @param username - Username of user to be recieved
 * @return data, list of 1 user, or 400 if not successful
 * DOES NOT NEED USERNAME, requires UID!
 */
export const getUserByUsername = async (username: string): Promise<ApiResponse<UserPreview>> => {
  const url = `/users/search-username/${username}`;
  try {
  const response = await GET(url);
  console.log(response);

  if (response.status !== 200) {
    console.log("Error getting user.");
    return { status: response.status, error: response.error, data: null };
  }

  console.log("Data recieved.");
  return { status: 200, error: null, data: response.data as UserPreview };
  }
  catch (e) {
    console.log("Error getting user: ", e);
    return {status: 500, error: "Internal error", data: null};
  }
};

/**
 * Get User by email
 * @param email - email of user to be recieved
 * @return data, list of 1 user, or 400 if not successful
 */
export const getUserByEmail = async (email: string): Promise<ApiResponse<UserPreview>> => {
  const url = `/users/search-email/${email}`;
  try {
  const response = await GET(url);

  if (response.status !== 200) {
    console.log("Error getting user.");
    return { status: response.status, error: response.error, data: null };
  }

  console.log("Data recieved.");
  return { status: 200, error: null, data: response.data as UserPreview };
  }
  catch (e) {
    console.log("Error getting user: ", e);
    return {status: 500, error: "Internal error", data: null};
  }
};

/* USER FOLLOWINGS */

/**
 * Get people that a user is following.
 * @param {number} id - id of the user that we are searching.
 * @returns array of users following, or 400 if unsuccessful.
 */
export const getUserFollowing = async (id: number): Promise<ApiResponse<UserPreview[]>> => {
  const url = `/users/${id}/followings/people`;
  try {
  const response = await GET(url);

  if (response.status !== 200) {
    console.log("Error getting users.");
    return { status: response.status, error: response.error, data: null };
  }

  console.log("Data recieved.");
  return { status: response.status, error: null, data: response.data as UserPreview[]};
  }
  catch (e) {
    console.log("Error getting users: ", e);
    return {status: 500, error: "Internal error", data: null};
  }
};

/** Get list of users that are following the specified user
* @param {number} id - id of the user that we are searching.
*/
export const getUserFollowers = async (id: number): Promise<ApiResponse> => {
  const url = `/users/${id}/followers`;
  try {
    const response = await GET(url);

    if (response.status !== 200) {
      console.log("Error getting users");
      return { status: response.status, error: response.error, data: null };
    }

  console.log("Data recieved.");
  return { status: response.status, error: null, data: response.data };
  }
  catch (e) {
    console.log("Error getting users: ", e);
    return {status: 500, error: "Internal error", data: null};
  }
}

/**
 * Follow a person for a user.
 * @param {number} id - user's id
 * @param devId - ID to be used as the current user
 * @returns 201 if successful, 400 if not
 */
export const addUserFollowing = async (id: number, devId?: number): Promise<ApiResponse<UserFollowings>> => {
  const url = `/me/followings/people/${id}${devId ? `?devId=${devId}` : ""}`;
  try {
  const response = await POST(url, {});

  if (response.status !== 201) {
    console.log("Error creating user following.");
    return { status: response.status, error: response.error, data: null };
  }

  console.log("Created user following.");
  return { status: 201, error: null, data: response.data as UserFollowings };
  }
  catch (e) {
    console.error("Error creating user following:", e);
    return { status: 500, error: "Internal error", data: null };
  }
};

/**
 * Unfollow person for a user. Unauthorized until shibboleth.
 * @param {number} id - user id of the user.
 * @param devId - ID to be used as the current user
 */
export const deleteUserFollowing = async (id: number, devId?: number) => {
  const url = `/me/followings/people/${id}${devId ? `?devId=${devId}` : ""}`;
  try {
  const response = await DELETE(url);

  if (response.status !== 200) {
    console.log("Error deleting user following.");
    return { status: response.status, error: response.error, data: null };
  }

  console.log("Deleted user following.");
  return { status: 200, error: null, data: null };
  }
  catch (e) {
    console.error("Error deleting user following:", e);
    return { status: 500, error: "Internal error", data: null };
  }
};

/* PROJECT FOLLOWINGS/VISIBILITY */
/**
 * @param devId - ID to be used as the current user
 */
export const getProjectsByUser = async (devId?: number): Promise<ApiResponse<ProjectPreview[]>> => {
  const url = `/me/projects${devId ? `?devId=${devId}` : ""}`;
  try {
  const response = await GET(url);

  if (response.status !== 200) {
    console.log("Error getting projects.");
    return { status: response.status, error: response.error, data: null };
  }

  console.log("Data received.");
  return { status: 200, error: null, data: response.data as ProjectPreview[]}
  }
  catch (e) {
    console.error("Error getting projects: ", e);
    return { status: 500, error: "Internal error", data: null };
  }
};

/**
 * Get all projects the user is a member of and has set to be public for the profile page
 * @param id - user to search
 * @return - array of projects, or 400 if unsuccessful.
 */
export const getVisibleProjects = async (id: number): Promise<ApiResponse<ProjectPreview[]>> => {
  const url = `/users/${id}/projects`;
  try {
  const response = await GET(url);

  if (response.status !== 200) {
    console.log("Error getting projects.");
    return { status: response.status, error: response.error, data: null };
  }

  console.log("Data recieved.");
  return { status: 200, error: null, data: response.data as ProjectPreview[] }
  }
  catch (e) {
    console.error("Error getting projects: ", e);
    return { status: 500, error: "Internal error", data: null };
  }
};

/**
 * Update the project visibility for a project a user is a member of. Invalid until shibboleth
 * @param userID - user's ID
 * @param projectID - Id of the project
 * @param _visibility - either "public" or "private", set visibility
 * @return 201 if successful, 400 if not
 */
export const updateProjectVisibility = async (
  userID: number,
  projectID: number,
  _visibility: string
) => {
  const url = `/users/${userID}`;
  const data = {
    projectId: projectID,
    visibility: _visibility,
  };

  const response = await PUT(url, data);
  if (response.status === 400) {
    console.log("Error editing projects.");
    return { status: 400, error: response.error };
  }
  console.log("Data edited.");
  return { status: 201, data: response.data };
};

/**
 * Get projects the user is following.
 * @param id - ID of the user.
 * @returns array of projects, or 400 if error.
 */
export const getProjectFollowing = async (id: number): Promise<ApiResponse<ProjectPreview[]>> => {
  const url = `/users/${id}/followings/projects`;
  try {
  const response = await GET(url);

  if (response.status !== 200) {
    console.log("Error getting projects.");
    return { status: response.status, error: response.error, data: null };
  }

  console.log("Data recieved.");
  return {status: 200, error: null, data: response.data as ProjectPreview[]};
  }
  catch (e) {
    console.error("Error getting projects: ", e);
    return { status: 500, error: "Internal error", data: null };
  }
};

/**
 * Follow a project for a user.
 * @param id - user ID trying to follow a project.
 * @param devId - ID to be used as the current user
 * @returns 201 if successful, 400 if not.
 */
export const addProjectFollowing = async (id: number, devId?: number): Promise<ApiResponse<ProjectFollowings>> => {
  const url = `/me/followings/projects/${id}${devId ? `?devId=${devId}` : ""}`;
  try {
  const response = await POST(url, {});

  if (response.status !== 201) {
    console.log("Error creating project following");
    return { status: response.status, error: response.error, data: null };
  }

  console.log("Created project following.");
  return { status: 201, error: null, data: response.data as ProjectFollowings};
}
catch (e) {
    console.error("Error creating project following: ", e);
    return { status: 500, error: "Internal error", data: null };
 }
}

/**
 * Unfollow a project for a user.
 * @param id - user id
 * @param devId - ID to be used as the current user
 * @returns 200 if successful, 400 if not.
 */
export const deleteProjectFollowing = async (id: number, devId?: number): Promise<ApiResponse> => {
  const url = `/me/followings/projects/${id}${devId ? `?devId=${devId}` : ""}`;
  try {
  const response = await DELETE(url);

  if (response.status !== 200) {
    console.log("Error deleting project following.");
    return { status: response.status, error: response.error, data: null };
  }

  console.log("Deleted project following.");
  return { status: 200, error: null, data: null };
  }
  catch (e) {
    console.error("Error deleting project following: ", e);
    return { status: 500, error: "Internal error", data: null };
  }
};

// Get socials for the current user based on ID
/**
 * 
 * @param devId - ID to be used as the current user
 */
export const getUserSocials = async (devId?: number): Promise<ApiResponse<MySocial[]>> => {
  const url = `/me/socials${devId ? `?devId=${devId}` : ""}`;
  try {
  const response = await GET(url);

  if (response.status !== 200) {
    console.log("Error getting socials.");
    return { status: response.status, error: response.error, data: null };
  }

  console.log("Data received.");
  return { status: 200, error: null, data: response.data as MySocial[]}
  }
  catch (e) {
    console.error("Error getting socials: ", e);
    return { status: 500, error: "Internal error", data: null };
  }
};

// Add socials for the current user by ID
/** 
 * @param devId - ID to be used as the current user
 */
export const addUserSocials = async (websiteId: number, url: string, devId?: number): Promise<ApiResponse<MySocial>> => {
  const apiURL = `/me/socials${devId ? `?devId=${devId}` : ""}`;
  try {
    const response = await POST(apiURL, { websiteId, url });

    if (response.status !== 201) {
      return { status: response.status, error: response.error, data: null };
    }

    return { status: 201, error: null, data: response.data as MySocial };
  }
  catch (e) {
    console.error("Error adding socials: ", e);
    return { status: 500, error: "Internal error", data: null };
  }
};

// Update socials specified by the current user
/**
 * @param devId - ID to be used as the current user
 */
export const updateUserSocials = async (websiteId: number, url: string, devId?: number): Promise<ApiResponse<MySocial>> => {
   const apiURL = `/me/socials/${websiteId}${devId ? `?devId=${devId}` : ""}`;
   try {
     const response = await PUT(apiURL, { websiteId, url });

     if (response.status !== 200) {
      return { status: response.status, error: response.error, data: null };
     }

     return { status: 200, error: null, data: response.data as MySocial };
   }
   catch (e) {
    console.error("Error updating socials: ", e);
    return { status: 500, error: "Internal error", data: null };
   }
};

// Delete user socials
/**
* @param devId - ID to be used as the current user
*/
export const deleteUserSocials = async (websiteId: number, devId?: number): Promise<ApiResponse> => {
  const url = `/me/socials/${websiteId}${devId ? `?devId=${devId}` : ""}`;
  try {
    const response = await DELETE(url);
    
  if (response.status !== 200) {
    console.log("Error deleting user socials");
    return { status: response.status, error: response.error, data: null };
  }

  return { status: 200, error: null, data: null };
  }
  catch (e) {
    console.error("Error deleting user socials:", e);
    return { status: 500, error: "Internal error", data: null };
  }
}

// Get skills for the current user based on ID
/**
 * @param devId - ID to be used as the current user
 */
export const getUserSkills = async (devId?: number): Promise<ApiResponse<MySkill[]>> => {
  const url = `/me/skills${devId ? `?devId=${devId}` : ""}`;
  try {
  const response = await GET(url);

  if (response.status !== 200) {
    console.log("Error getting skills.");
    return { status: response.status, error: response.error, data: null };
  }

  console.log("Data received.");
  return { status: 200, error: null, data: response.data as MySkill[]}
  }
  catch (e) {
    console.error("Error getting skills: ", e);
    return { status: 500, error: "Internal error", data: null };
  }
};

// Add skills to the current user 
/** 
 * @param devId - ID to be used as the current user
 */
export const addUserSkills = async (
  skillId: number,
  position: number, 
  proficiency: string,
  devId?: number
): Promise<ApiResponse<MySkill>> => {
  const url = `/me/skills${devId ? `?devId=${devId}` : ""}`;
  const data = [ { skillId, position, proficiency } ];
  try {
    const response = await POST(url, data);
    if (response.status !== 201) {
      return { status: response.status, error: response.error, data: null };
    }

    return { status: 201, error: null, data: response.data as MySkill };
  }
  catch (e) {
    console.error("Error adding skills: ", e);
    return { status: 500, error: "Internal error", data: null };
  }
}

// Updates a user skill
/** 
 * @param devId - ID to be used as the current user
*/
export const updateUserSkills = async (
  skillId: number, 
  position?: number, 
  proficiency?: string,
  devId?: number,
): Promise<ApiResponse<MySkill>> => {
    const url = `/me/skills/${skillId}${devId ? `?devId=${devId}` : ""}`;

    // Only include fields passed in for request body
    const data: Record<string, unknown> = {};
    if (position !== undefined) data.position = position;
    if (proficiency !== undefined) data.proficiency = proficiency;

    try {
      const response = await PATCH(url, data);
      if (response.status !== 200) {
        return { status: response.status, error: response.error, data: null };
      }
      return { status: 200, error: null, data: response.data as MySkill };
    }
    catch (e) {
    console.error("Error updating skills: ", e);
    return { status: 500, error: "Internal error", data: null };
    }
} 

// Delete many of the current user's skills
/** 
 * @param devId - ID to be used as the current user
*/
export const deleteUserSkills = async (skillId: number, skillIds: number[], devId?: number): Promise<ApiResponse<null>> => {
  const url = `/me/skills/${skillId}${devId ? `?devId=${devId}` : ""}`;
  const data = { skillIds };

  try {
   const response = await DELETE(url, data);
    if (response.status !== 200) {
      return { status: response.status, error: response.error, data: null };
    }
    return { status: 200, error: null, data: null };
  }
  catch (e) {
    console.error("Error deleting skills: ", e);
    return { status: 500, error: "Internal error", data: null };
  }
};

/* DATASETS */

/**
 * Retrieves list of majors.
 */
export const getMajors = async (): Promise<ApiResponse<Major[]>> => {
   const apiURL = `/datasets/majors`;

   try {
   const response = await GET(apiURL);
   return {status: 200, error: null, data: response.data as Major[]};
   }
   catch (e) {
    console.log("Error fetching majors", e);
    return { status: 500, error: "Internal error", data: null };
  }
}

/**
 * Gets list of job titles.
 */
export const getJobTitles = async (): Promise<ApiResponse<Role[]>> => {
  const apiURL = `/datasets/roles`

  try {
    const response = await GET(apiURL);
    return {status: 200, error: null, data: response.data as Role[]};
  } 
  catch (e) {
    console.error("Error fetching job titles", e);
    return { status: 500, error: "Internal error", data: null };
  }
};

/**
 * Retrieves list of project types.
 */
export const getProjectTypes = async (): Promise<ApiResponse<Medium[]>> => {
    const apiURL = `/datasets/mediums`

  try {
    const response = await GET(apiURL);
    return { status: 200, error: null, data: response.data as Medium[] };
  } 
  catch (e) {
    console.error("Error fetching project types", e);
    return { status: 500, error: "Internal error", data: null };
  }
}

/**
 * Gets list of skills.
 */
export const getSkills = async (): Promise<ApiResponse<Skill[]>> => {
    const apiURL = `/datasets/skills`

  try {
    const response = await GET(apiURL);
    return { status: 200, error: null, data: response.data as Skill[] };
  } 
  catch (e) {
    console.error("Error fetching skills", e);
    return { status: 500, error: "Internal error", data: null };
  }
}

/**
 * Retrieves list of tags.
 */
export const getTags = async (): Promise<ApiResponse<Tag[]>> => {
    const apiURL = `/datasets/tags`

  try {
    const response = await GET(apiURL);
    return { status: 200, error: null, data: response.data as Tag[] };
  } 
  catch (e) {
    console.error("Error fetching tags", e);
    return { status: 500, error: "Internal error", data: null };
  }
}

/**
 * Gets list of socials links.
 */
export const getSocials = async (): Promise<ApiResponse<Social[]>> => {
    const apiURL = `/datasets/socials`

  try {
    const response = await GET(apiURL);
    return { status: 200, error: null, data: response.data as Social[] };
  } 
  catch (e) {
    console.error("Error fetching socials", e);
    return { status: 500, error: "Internal error", data: null };
  }
}

//getVisibleProjects
//updateProjectVisibility
//getProjectFollowing
//addProjectFollowing
//deleteProjectFollowing

export default {
  createNewUser,
  getUsers,
  getUsersById,
  editUser,
  deleteUser,
  userInDatabase,
  updateProfilePicture,
  getAccountInformation,
  updateEmail,
  updateUsername,
  //updatePassword,
  // updateUserVisibility,
  // requestPasswordReset,
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
