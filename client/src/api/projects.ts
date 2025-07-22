import { GET, POST, PUT, DELETE } from "./index";
import type {
  ApiResponse,
  Genre,
  Tag,
  JobTitle,
  Member,
  Social,
} from "@looking-for-group/shared";

/* PROJECT CRUD */

/**
 * Creates a new project and adds it to the database. All params default to null.
 * @param _userId - ID of the user creating the project
 * @param _title - Name of the project
 * @param _hook - The short description of the project
 * @param _desc - The long description of the project
 * @param _purpose - The purpose selected for this project
 * @param _status - The status of the project
 * @param _audience - The project's intended audience
 * @param _pTypes - List of project types
 * @param _pTags - List of project tags
 * @param _jobs - List of roles being recruited for
 * @param _members  - List of project members
 * @param _socials - List of relevant social media pages
 * @returns 200 if valid, 400 if not
 */ //might need to change Array<object>
export const createNewProject = async (
  _userId: number,
  _title: string,
  _hook: string,
  _desc: string,
  _purpose: string,
  _status: string,
  _audience: string,
  _pTypes: Genre[],
  _pTags: Tag[],
  _jobs: JobTitle[],
  _members: Member[],
  _socials: Social[]
): Promise<unknown> => {
  const apiURL = `/projects`;

  const data = {
    userId: _userId,
    title: _title,
    hook: _hook,
    description: _desc,
    purpose: _purpose,
    status: _status,
    audience: _audience,
    project_types: _pTypes,
    tags: _pTags,
    jobs: _jobs,
    members: _members,
    socials: _socials,
  };

  const response = await POST(apiURL, data);
  if (response.error) {
    console.log("Error creating new project:", response.error);
    return { status: response.status, error: response.error };
  }
  console.log(`Created project named "${_title}"`);
  return { status: 200, error: null, data: response.data };
};

/**
 * Gets all projects in the database
 * @returns Array of all projects if valid, 400 if not
 */
export const getProjects = async (): Promise<ApiResponse<unknown>> => {
  const apiURL = `/projects`;

  const response = await GET(apiURL);

  if (response.error) {
    return { status: response.status, error: response.error };
  }
  return { status: 200, error: null, data: response.data };
};

/**
 * Retrieves data of a project by its ID
 * @param ID -  ID of project to retrieve
 * @returns - A project object if valid, 400 if not
 */
export const getByID = async (ID: number): Promise<ApiResponse<unknown>> => {
  const apiURL = `/projects/${ID}`;
  const response = await GET(apiURL);
  if (response.error) {
    return { status: response.status, error: response.error };
  }
  return { status: 200, error: null, data: response.data };
};

/**
 * Updates data of an existing project
 * @param ID - ID of the project to update
 * @param data - Mapped data for update
 * @returns Response status
 */
export const updateProject = async (
  ID: number,
  data: object
): Promise<ApiResponse<unknown>> => {
  const apiURL = `/projects/${ID}`;
  const response = await PUT(apiURL, data);
  if (response.error) {
    return { status: response.status, error: response.error };
  }
  return { status: 200 };
};

/**
 * Deletes an existing project
 * @param ID - ID of the project to delete
 * @returns Response status
 */
export const deleteProject = async (
  ID: number
): Promise<ApiResponse<unknown>> => {
  const apiURL = `/projects/${ID}`;
  const response = await DELETE(apiURL);
  if (response.error) {
    return { status: response.status, error: response.error };
  }
  return { status: 200 };
};

/* ASSETS */

/**
 * Updates the thumbnail image for a project
 * @param ID - ID of the project to update
 * @param _image - Image file of new thumbnail
 * @returns The filename of the thumbnail image if valid, "400" if not
 */
export const updateThumbnail = async (
  ID: number,
  _image: File
): Promise<unknown> => {
  const apiURL = `/projects/${ID}/thumbnail`;
  const data = { image: _image };
  const response = await PUT(apiURL, data);
  if (response.error) {
    return { status: response.status, error: response.error };
  }
  return { status: 200, error: null, data: response.data };
};

/**
 * Gets the pictures used in a project's carousel
 * @param ID - ID of the target project
 * @returns Array of image objects if valid, "400" if not
 */
export const getPics = async (ID: number): Promise<ApiResponse<unknown>> => {
  const apiURL = `/projects/${ID}/pictures`;
  const response = await GET(apiURL);
  if (response.error) {
    return { status: response.status, error: response.error };
  }
  return { status: 200, error: null, data: response.data };
};

/**
 * Adds a picture to a project's carousel
 * @param ID - ID of the target project
 * @param _image - Image file to be added
 * @param _position - Position of the image in the carousel
 * @returns Response status
 */
export const addPic = async (
  ID: number,
  _image: File,
  _position: number
): Promise<ApiResponse<any[]>> => {
  const apiURL = `/projects/${ID}/pictures`;
  const data = {
    image: _image,
    position: _position,
  };
  const response = await POST(apiURL, data);
  if (response.error) {
    return { status: response.status, error: response.error };
  }
  return { status: 200 };
};

/**
 * Updates position order of a project's carousel pictures
 * @param ID - ID of the target project
 * @param images - Array of objects, which contain the image "id" and new "position"
 * @returns Response status
 */
export const updatePicPositions = async (
  ID: number,
  images: Array<{ id: number; position: number }>
): Promise<ApiResponse<any[]>> => {
  const apiURL = `$/projects/${ID}/pictures`;
  const response = await PUT(apiURL, images);
  if (response.error) {
    return { status: response.status, error: response.error };
  }
  return { status: 200 };
};

/**
 * Deletes a picture in a project
 * @param ID - ID of the target project
 * @param image - Filename of the image to delete
 * @returns Response status
 */
export const deletePic = async (
  ID: number,
  image: string
): Promise<ApiResponse<any[]>> => {
  //FIX ROUTE FOR DELETING PICTURE
  //NEEDS TO SPECIFY WHAT PICTURE IS BEING DELETED BY IMAGE NAME
  //uses encode to evoid special character issues
  const apiURL = `/projects/${ID}/pictures?image=${encodeURIComponent(image)}`;
  const response = await DELETE(apiURL);
  if (response.error) {
    return { status: response.status, error: response.error };
  }
  return { status: 200 };
};

/* MEMBERS */

/**
 * Adds a member to a project
 * @param ID - ID of the target project
 * @param _userId - ID of the user to add
 * @param _titleId - ID of the user's role
 * @param _permission - The user's access level
 * @returns Response status
 */
export const addMember = async (
  ID: number,
  _userId: number,
  _titleId: number,
  _permission: number
): Promise<ApiResponse<any[]>> => {
  const apiURL = `/projects/${ID}/members`;
  const data = {
    userId: _userId,
    titleId: _titleId,
    permission: _permission,
  };
  const response = await POST(apiURL, data);
  if (response.error) {
    return { status: response.status, error: response.error };
  }
  return { status: 200 };
};

/**
 * Updates an existing member in a project
 * @param ID - ID of the target project
 * @param _userId - ID of the user to update
 * @param _titleId - ID of the user's role
 * @param _permission - The user's access level
 * @returns Response status
 */
export const updateMember = async (
  ID: number,
  _userId: number,
  _titleId: number,
  _permission: number
): Promise<ApiResponse<any[]>> => {
  const apiURL = `/projects/${ID}/members`;
  const data = {
    userId: _userId,
    titleId: _titleId,
    permission: _permission,
  };
  const response = await PUT(apiURL, data);
  if (response.error) {
    return { status: response.status, error: response.error };
  }
  return { status: 200 };
};

/**
 * Removes a member from a project
 * @param ID - ID of the target project
 * @param userId - ID of the target user
 * @returns Response status
 */
export const deleteMember = async (
  ID: number,
  userId: number
): Promise<ApiResponse<any[]>> => {
  const apiURL = `/projects/${ID}/members/${userId}`;
  const response = await DELETE(apiURL);
  if (response.error) {
    return { status: response.status, error: response.error };
  }
  return { status: 200 };
};

export default {
  createNewProject,
  getProjects,
  getByID,
  updateProject,
  deleteProject,
  updateThumbnail,
  getPics,
  addPic,
  updatePicPositions,
  deletePic,
  addMember,
  updateMember,
  deleteMember,
};
