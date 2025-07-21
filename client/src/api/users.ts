import { GET, POST, PUT, DELETE } from "./index";
import type {
  ApiResponse,
  User,
  CreateUserData,
} from "@looking-for-group/shared";

/* USER CRUD */

//This probably with change with shibbolth???
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
  userData: CreateUserData
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
 * Checks if the user is logged in (shibboleth) and returns username if they are
 * @returns ApiResponse with username is logged in, 404 if guest
 */
export const getCurrentUsername = async (): Promise<ApiResponse> => {
  const apiURL = `/users/get-username`;

  try {
    //can maybe add custom headers here for dev mode
    const response = await GET(apiURL);
    return response;
  } catch (e) {
    console.log("Error fetching username by Shibboleth:", e);
    return { status: 500, error: "Internal error" };
  }
};

/**
 * Gets all data on all public users. Does not return private ones
 * @returns result - JSONified data of all users, else if error, '400'.
 */
export const getUsers = async (): Promise<ApiResponse> => {
  const apiURL = `/users`;
  const response = await GET(apiURL);
  return response;
};

/**
 * Gets all data on one specific user, specified by URL.
 * @param id - user_id for user
 * @returns result - JSONified data of specified user.
 */
export const getUsersById = async (id: number): Promise<ApiResponse> => {
  const apiURL = `/users/${id}`;
  const response = await GET(apiURL);
  return response;
};

/**
 * Edit information for one user, specified by URL.
 * @param id - user_id for user
 * @param data - mapped(eg {data1:'value1', data2:'value2'}) data to change for user
 * @returns response data
 */
export const editUser = async (
  id: number,
  data: Partial<User>
): Promise<ApiResponse> => {
  const apiURL = `/users/${id}`;
  const response = await PUT(apiURL, data);
  return response;
};

/**
 * Removes a user specified by URL.
 * @param id - user_id to be deleted
 * @returns response data
 */
export const deleteUser = async (id: number): Promise<ApiResponse> => {
  const apiURL = `/users/${id}`;
  return await DELETE(apiURL);
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
 * @param id - int, the user_id to change
 * @param image - file, the picture to put into the user's profile
 * @return status, 200 if successful, 400 if not, and data. data=array[object] with the profile_image, string, name of the file
 */
export const updateProfilePicture = async (
  id: number,
  image: File
): Promise<ApiResponse> => {
  const apiURL = `/users/${id}/profile-picture`;

  const data = { image: image };
  const response = await PUT(apiURL, data);
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
 */
export const updateUserVisibility = async (
  id: number
): Promise<ApiResponse> => {
  const url = `/users/${id}`;
  const userResponse = await GET(url);
  if (userResponse.status !== 200) {
    return {
      status: 400,
      error: "Unable to fetch user data",
    };
  }

  const vis = userResponse.data.visibility;
  let data: { visibility: number };

  if (vis == 1) {
    data = {
      visibility: 0,
    };
  } else if (vis == 0) {
    data = {
      visibility: 1,
    };
  } else {
    return {
      status: 400,
      error: "Invalid visibility error.",
    };
  }
  const result = await editUser(id, data);
  if (result.status === 400) {
    console.log("Error editing user.");
    return { status: 400, error: "Error editing user." };
  }
  return {
    status: 200,
    error: null,
    data: result.data,
  };
};

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
  console.log(response);
  if (response.status === 401) {
    console.log(response.error);
    return response;
  }

  console.log("User account information recieved");
  return response;
};

//requestPasswordReset

/* LOOKUP USER */

/**
 * Get User by Username
 * @param username - Username of user to be recieved
 * @return data, list of 1 user, or 400 if not successful
 */
export const getUserByUsername = async (username: string) => {
  const url = `/users/search-username/${username}`;
  const response = await GET(url);

  if (response.status === 400) {
    console.log("Error getting user.");
    return { status: 400, error: response.error };
  }

  //check if array is not empty
  if (!response.data) {
    console.log("No user found");
    return { status: 404, error: response.error };
  }

  console.log("Data recieved.");
  return response;
};

/**
 * Get User by email
 * @param email - email of user to be recieved
 * @return data, list of 1 user, or 400 if not successful
 */
export const getUserByEmail = async (email: string) => {
  const url = `/users/search-email/${email}`;
  const response = await GET(url);

  if (response.status === 400) {
    console.log("Error getting user.");
    return { status: 400, error: response.error };
  }

  //check if array is not empty
  if (!response.data) {
    console.log("No user found");
    return { status: 404, error: "No user found." };
  }

  console.log("Data recieved.");
  return response;
};

/* USER FOLLOWINGS */

/**
 * Get people that a user is following.
 * @param {number} id - id of the user that we are searching.
 * @returns array of users following, or 400 if unsuccessful.
 */
export const getUserFollowing = async (id: number) => {
  const url = `/users/${id}/followings/people`;
  const response = await GET(url);
  if (response.status === 400) {
    console.log("Error getting users.");
    return { status: 400, error: response.error };
  }
  console.log("Data recieved.");
  return response;
};

/**
 * Follow a person for a user.
 * @param {number} id - user's id
 * @param {number} followID - user to be followed.
 * @returns 201 if successful, 400 if not
 */
export const addUserFollowing = async (id: number, followID: number) => {
  const url = `/users/${id}/followings/people`;
  const data = {
    userId: followID,
  };
  const response = await POST(url, data);
  if (response.status === 400) {
    console.log("Error creating user following.");
    return { status: 400, error: response.error };
  }
  console.log("Created user following.");
  return { status: 201, data: response.data };
};

/**
 * Unfollow person for a user. Unauthorized until shibboleth.
 * @param {number} id - user id of the user.
 * @param {number} unfollowID - user id to be unfollowed.
 */
export const deleteUserFollowing = async (id: number, unfollowID: number) => {
  const url = `/users/${id}/followings/people`;
  const data = {
    userId: unfollowID,
  };
  const response = await DELETE(url, data);

  if (response.status === 400) {
    console.log("Error deleting user following.");
    return { status: 400, error: response.error };
  }
  console.log("Deleted user following.");
  return { status: 201, data: response.data };
};

/* PROJECT FOLLOWINGS/VISIBILITY */

/**
 * Get all projects the user is a member of and has set to be public for the profile page
 * @param id - user to search
 * @return - array of projects, or 400 if unsuccessful.
 */
export const getVisibleProjects = async (id: number) => {
  const url = `/users/${id}/projects/profile`;
  const response = await GET(url);
  if (response.status === 400) {
    console.log("Error getting projects.");
    return { status: 400, error: response.error };
  }
  console.log("Data recieved.");
  return response;
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
  const url = `/users/${userID}/projects/visibility`;
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
export const getProjectFollowing = async (id: number) => {
  const url = `/users/${id}/followings/projects`;
  const response = await GET(url);
  if (response.status === 400) {
    console.log("Error getting projects.");
    return { status: 400, error: response.error };
  }
  console.log("Data recieved.");
  return response;
};

/**
 * Follow a project for a user.
 * @param id - user ID trying to follow a project.
 * @param projectID - ID of the project trying to follow.
 * @returns 201 if successful, 400 if not.
 */
export const addProjectFollowing = async (id: number, projectID: number) => {
  const url = `/users/${id}/followings/projects`;
  const data = {
    projectId: projectID,
  };
  const response = await POST(url, data);
  if (response.status === 400) {
    console.log("Error creating project following, unauthorized.");
    return { status: 400, error: response.error };
  }
  console.log("Created project following.");
  return { status: 200, data: id };
};

/**
 * Unfollow a project for a user.
 * @param id - user id
 * @param projID - project Id to be unfollowed.
 * @returns 201 if successful, 400 if not.
 */
export const deleteProjectFollowing = async (id: number, projID: number) => {
  const url = `/users/${id}/followings/projects/${projID}`;
  const response = await DELETE(url);
  if (response.status === 400) {
    console.log("Error deleting project following.");
    return { status: 400, error: response.error };
  }
  console.log("Deleted project following.");
  return { status: 201, data: response.data };
};

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
  updateUserVisibility,
  // requestPasswordReset,
  getUserByUsername,
  getUserByEmail,
  getUserFollowing,
  addUserFollowing,
  deleteUserFollowing,
  getVisibleProjects,
  updateProjectVisibility,
  getProjectFollowing,
  addProjectFollowing,
  deleteProjectFollowing,
};
