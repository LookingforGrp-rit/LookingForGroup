import { GET, POST, PUT, DELETE, PATCH } from "./index";
import type {
  ApiResponse,
  ProjectImage,
  Medium, ProjectMedium,
  Tag, ProjectTag,
  Role,
  Member, ProjectMember,
  Social, ProjectSocial,
  ProjectPreview,
  ProjectDetail,
  ProjectWithFollowers,
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
 * @param devId - ID to be used as the current user
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
  _pTypes: Medium[],
  _pTags: Tag[],
  _jobs: Role[],
  _members: Member[],
  _socials: Social[],
  devId?: number,
): Promise<ApiResponse<ProjectDetail>> => {
  const apiURL = `/projects${devId ? `?devId=${devId}` : ""}`;

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
    return { status: response.status, error: response.error, data: null };
  }
  console.log(`Created project named "${_title}"`);
  return { status: 201, error: null, data: response.data as ProjectDetail };
};

/**
 * Gets all projects in the database
 * @returns Array of all projects if valid, 400 if not
 */
export const getProjects = async (): Promise<ApiResponse<ProjectPreview[]>> => {
  const apiURL = `/projects`;
  const response = await GET(apiURL);
  if (response.error) {
    return { status: response.status, error: response.error, data: null };
  }
  return { status: 200, error: null, data: response.data as ProjectPreview[] };
};

/**
 * Retrieves data of a project by its ID
 * @param ID -  ID of project to retrieve
 * @returns - A project object if valid, 400 if not
 */
export const getByID = async (ID: number): Promise<ApiResponse<ProjectWithFollowers>> => {
  const apiURL = `/projects/${ID}`;
  const response = await GET(apiURL);
  if (response.error) {
    return { status: response.status, error: response.error, data: null };
  }
  return { status: 200, error: null, data: response.data as ProjectWithFollowers };
};

/**
 * Updates data of an existing project
 * @param ID - ID of the project to update
 * @param data - Mapped data for update
 * @param devId - ID to be used as the current user
 * @returns Response status
 */
export const updateProject = async (
  ID: number,
  data: object,
  devId?: number
): Promise<ApiResponse<ProjectDetail>> => {
  const apiURL = `/projects/${ID}${devId ? `?devId=${devId}` : ""}`;
  const response = await PATCH(apiURL, data);
  if (response.error) {
    return { status: response.status, error: response.error };
  }
  return { status: 200, data: response.data as ProjectDetail };
};

/**
 * Deletes an existing project
 * @param ID - ID of the project to delete
 * @param devId - ID to be used as the current user
 * @returns Response status
 */
export const deleteProject = async (
  ID: number,
  devId?: number,
): Promise<ApiResponse<unknown>> => {
  const apiURL = `/projects/${ID}${devId ? `?devId=${devId}` : ""}`;
  const response = await DELETE(apiURL);
  if (response.error) {
    return { status: response.status, error: response.error, data: null };
  }
  return { status: 200, error: null, data: null };
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
): Promise<ApiResponse<{ filename: string }>> => {
  const apiURL = `/projects/${ID}`;
  
  const formData = new FormData();
  formData.append("image", _image);

  const response = await PATCH(apiURL, formData);
  if (response.error) {
    return { status: response.status, error: response.error };
  }
  return { status: 200, error: null, data: response.data as { filename: string } };
};

/**
 * Gets the pictures used in a project's carousel
 * @param ID - ID of the target project
 * @returns Array of image objects if valid, "400" if not
 */
export const getPics = async (ID: number): Promise<ApiResponse<ProjectImage[]>> => {
  const apiURL = `/projects/${ID}/images`;
  const response = await GET(apiURL);
  if (response.error) {
    return { status: response.status, error: response.error, data: null };
  }
  return { status: 200, error: null, data: response.data as ProjectImage[] };
};

/**
 * Adds a picture to a project's carousel
 * @param ID - ID of the target project
 * @param _image - Image file to be added
 * @param _altText - Image alt text to be used
 * @param devId - ID to be used as the current user
 * @returns Response status
 */
export const addPic = async (
  ID: number,
  _image: File,
  _altText: string,
  devId?: number,
): Promise<ApiResponse<ProjectImage>> => {
  const apiURL = `/projects/${ID}/images${devId ? `?devId=${devId}` : ""}`;
  
  const formData = new FormData();
  formData.append("image", _image);
  formData.append("altText", _altText);

  const response = await POST(apiURL, formData);
  if (response.error) {
    return { status: response.status, error: response.error, data: null };
  }
  return { status: 200, error: null, data: response.data as ProjectImage };
};

/**
 * Updates position order of a project's carousel pictures
 * @param ID - ID of the target project
 * @param images - Array of objects, which contain the image "id" and new "position"
 * @param devId - ID to be used as the current user
 * @returns Response status
 */
export const updatePic = async (
  ID: number,
  imageId: number,
  _image?: File,
  _altText?: string,
  devId?: number,
): Promise<ApiResponse<ProjectImage>> => {
  const apiURL = `/projects/${ID}/images/${imageId}${devId ? `?devId=${devId}` : ""}`;

  const formData = new FormData();
  if (_image) {
    formData.append("image", _image);
  }
  if (_altText) {
    formData.append("altText", _altText);
  }

  const response = await PATCH(apiURL, formData);
  if (response.error) {
    return { status: response.status, error: response.error, data: null };
  }
  return { status: 200, error: null, data: response.data as ProjectImage };
};

/**
 * Deletes a picture in a project
 * @param ID - ID of the target project
 * @param imageId - ID of the image to delete
 * @param devId - ID to be used as the current user
 * @returns Response status
 */
export const deletePic = async (
  ID: number,
  imageId: number,
  devId?: number
): Promise<ApiResponse<null>> => {
  //FIX ROUTE FOR DELETING PICTURE
  //NEEDS TO SPECIFY WHAT PICTURE IS BEING DELETED BY IMAGE NAME
  //uses encode to evoid special character issues
  const apiURL = `/projects/${ID}/images/${imageId}${devId ? `?devId=${devId}` : ""}`;
  const response = await DELETE(apiURL);
  if (response.error) {
    return { status: response.status, error: response.error, data: null };
  }
  return { status: 200, error: null, data: null };
};

/* MEMBERS */

/**
 * Adds a member to a project
 * @param ID - ID of the target project
 * @param _userId - ID of the user to add
 * @param _roleId - ID of the user's role
 * @param devId - ID to be used as the current user
 * @returns Response status
 */
export const addMember = async (
  ID: number,
  _userId: number,
  _roleId?: number,
  devId?: number
): Promise<ApiResponse<ProjectMember>> => {
  const apiURL = `/projects/${ID}/members${devId ? `?devId=${devId}` : ""}`;
  const data = {
    userId: _userId,
    roleId: _roleId
  };
  const response = await POST(apiURL, data);
  if (response.error) {
    return { status: response.status, error: response.error, data: null };
  }
  return { status: 200, error: null, data: response.data as ProjectMember };
};

/**
 * Updates an existing member in a project
 * @param ID - ID of the target project
 * @param _userId - ID of the user to update
 * @param _roleId - ID of the user's role
 * @param devId - ID to be used as the current user
 * @returns Response status
 */
export const updateMember = async (
  ID: number,
  _userId: number,
  _roleId: number,
  devId?: number
): Promise<ApiResponse<ProjectMember>> => {
  const apiURL = `/projects/${ID}/members/${_userId}${devId ? `?devId=${devId}` : ""}`;
  const data = {
    roleId: _roleId,
  };
  const response = await PATCH(apiURL, data);
  if (response.error) {
    return { status: response.status, error: response.error, data: null };
  }
  return { status: 200, error: null, data: response.data as ProjectMember };
};

/**
 * Removes a member from a project
 * @param ID - ID of the target project
 * @param userId - ID of the target user
 * @param devId - ID to be used as the current user
 * @returns Response status
 */
export const deleteMember = async (
  ID: number,
  userId: number,
  devId?: number
): Promise<ApiResponse<null>> => {
  const apiURL = `/projects/${ID}/members/${userId}${devId ? `?devId=${devId}` : ""}`;
  const response = await DELETE(apiURL);
  if (response.error) {
    return { status: response.status, error: response.error, data: null };
  }
  return { status: 200, error: null, data: null };
};

// Get a project's socials
export const getProjectSocials = async (
  ID: number
): Promise<ApiResponse<ProjectSocial[]>> => {
  const apiURL = `/projects/${ID}/socials`;
  const response = await GET(apiURL);
  if (response.error || response.status !== 200) {
    return { status: response.status, error: response.error, data: null };
  }
  return { status: 200, error: null, data: response.data as ProjectSocial[] };
}

// Add a project's socials
/**
 * @param ID - ID of the project
 * @param devId - ID to be used as the current user
*/
export const addProjectSocials = async (
  ID: number,
  websiteId: number,
  url: string,
  devId?: number,
): Promise <ApiResponse<ProjectSocial>> => {
  const apiURL = `/projects/${ID}/socials${devId ? `?devId=${devId}` : ""}`;
  const data = { websiteId, url };

  const response = await POST(apiURL, data);

  if (response.error || response.status !== 200) {
    return { status: response.status, error: response.error, data: null };
  }

  return { status: 200, error: null, data: response.data as ProjectSocial };
};

// Update project socials
/**
 * @param ID - ID of the project
 * @param devId - ID to be used as the current user
*/
export const updateProjectSocials = async (
  ID: number,
  websiteId: number,
  url: string,
  devId?: number
): Promise<ApiResponse<ProjectSocial>> => {
  const apiURL = `/projects/${ID}/socials/${websiteId}${devId ? `?devId=${devId}` : ""}`;
  const data = { websiteId, url };

  const response = await PUT(apiURL, data);

  if (response.error || response.status !== 200) {
    return { status: response.status, error: response.error, data: null };
  }

  return { status: 200, error: null, data: response.data as ProjectSocial };
};

// Delete project socials
/**
 * @param ID - ID of the project
 * @param devId - ID to be used as the current user
*/
export const deleteProjectSocials = async (
  ID: number,
  websiteId: number,
  devId?: number
): Promise<ApiResponse<null>> => {
  const apiURL = `/projects/${ID}/socials/${websiteId}${devId ? `?devId=${devId}` : ""}`;

  const response = await DELETE(apiURL);

  if (response.error || response.status !== 200) {
    return { status: response.status, error: response.error, data: null };
  }

  return { status: 200, error: null, data: null };
};

// Get project tags
/**
 * @param ID - ID of the project
*/
export const getProjectTags = async (
  ID: number
): Promise<ApiResponse<ProjectTag[]>> => {
  const apiURL = `/projects/${ID}/tags`;

  const response = await GET(apiURL);

  if (response.error || response.status !== 200) {
    return { status: response.status, error: response.error, data: null };
  }

  return { status: 200, error: null, data: response.data as ProjectTag[] };
};

// Add project tags
/**
 * @param ID - ID of the project
 * @param devId - ID to be used as the current user
*/
export const addProjectTags = async (
  ID: number,
  tagIds: number[],
  devId?: number
): Promise<ApiResponse<ProjectTag>> => {
  const apiURL = `/projects/${ID}/tags${devId ? `?devId=${devId}` : ""}`;
  const data = { tagIds };

  const response = await POST(apiURL, data);

  if (response.error || response.status !== 200) {
    return { status: response.status, error: response.error, data: null };
  }

  return { status: 200, error: null, data: response.data as ProjectTag };
};

// Delete project tags
/**
 * @param ID - ID of the project
 * @param devId - ID to be used as the current user
*/
export const deleteProjectTags = async (
  ID: number,
  tagIds: number[],
  devId?: number
): Promise<ApiResponse<null>> => {
  const apiURL = `/projects/${ID}/tags${devId ? `?devId=${devId}` : ""}`;
  const data = { tagIds };

  const response = await DELETE(apiURL, data);

  if (response.error || response.status !== 200) {
    return { status: response.status, error: response.error, data: null };
  }

  return { status: 200, error: null, data: null };
};

// Get project mediums
export const getProjectMediums = async (
  ID: number
): Promise<ApiResponse<ProjectMedium[]>> => {
  const apiURL = `/projects/${ID}/mediums`;
  const response = await GET(apiURL);

  if (response.error || response.status !== 200) {
    return { status: response.status, error: response.error, data: null };
  }

  return { status: 200, error: null, data: response.data as ProjectMedium[] };
};

// Add project mediums
/**
 * @param ID - ID of the project
 * @param devId - ID to be used as the current user
*/
export const addProjectMediums = async (
  ID: number,
  mediumIds: number[],
  devId?: number
): Promise<ApiResponse<ProjectMedium>> => {
  const apiURL = `/projects/${ID}/mediums${devId ? `?devId=${devId}` : ""}`;
  const body = { mediumIds };

  const response = await POST(apiURL, body);

  if (response.error || response.status !== 200) {
    return { status: response.status, error: response.error, data: null };
  }

  return { status: 200, error: null, data: response.data as ProjectMedium };
};

// Delete project mediums
/**
 * @param ID - ID of the project
 * @param devId - ID to be used as the current user
*/
export const deleteProjectMediums = async (
  ID: number,
  mediumIds: number[],
  devId?: number
): Promise<ApiResponse<null>> => {
  const apiURL = `/projects/${ID}/mediums${devId ? `?devId=${devId}` : ""}`;
  const body = { mediumIds };

  const response = await DELETE(apiURL, body);

  if (response.error || response.status !== 200) {
    return { status: response.status, error: response.error, data: null };
  }

  return { status: 200, error: null, data: null };
};

// Re-order project images
/**
 * @param ID - ID of the project
 * @param devId - ID to be used as the current user
*/
export const reorderProjectImages = async (
  ID: number,
  imageOrder: number[],
  devId?: number
): Promise<ApiResponse<ProjectImage[]>> => {
  const apiURL = `/projects/${ID}/images/reorder${devId ? `?devId=${devId}` : ""}`;
  const body = { imageOrder };

  const response = await PUT(apiURL, body);

  if (response.error || response.status !== 200) {
    return { status: response.status, error: response.error, data: null };
  }

  return { status: 200, error: null, data: response.data as ProjectImage[] };
};

// Get an image by file name
export const getImageByFileName = async (imageURL: string): Promise<ApiResponse<Blob>> => {
  const apiURL = `/images/${imageURL}`;

  try {
    const response = await fetch(apiURL, { method: "GET", credentials: "include" });

    if (!response.ok) {
    return { status: response.status, error: response.statusText, data: null };
  };

  // return media type image/png
  const blob = await response.blob();
  return { status: 200, error: null, data: blob };
  }
  catch (e) {
    return { status: 500, error: "Internal Server Error", data: null }
  }
}

export default {
  createNewProject,
  getProjects,
  getByID,
  updateProject,
  deleteProject,
  updateThumbnail,
  getPics,
  addPic,
  updatePic,
  deletePic,
  addMember,
  updateMember,
  deleteMember,
  getProjectSocials,
  addProjectSocials,
  updateProjectSocials,
  deleteProjectSocials,
  getProjectTags,
  addProjectTags,
  deleteProjectTags,
  getProjectMediums,
  addProjectMediums,
  deleteProjectMediums,
  reorderProjectImages,
  getImageByFileName
};
