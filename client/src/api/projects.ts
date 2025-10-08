import { GET, POST, PUT, DELETE, PATCH } from "./index";
import type {
  ApiResponse,
  ProjectImage,
  ProjectMedium,
  ProjectTag,
  ProjectMember,
  ProjectSocial,
  ProjectPreview,
  ProjectDetail,
  ProjectWithFollowers,
  CreateProjectInput,
  UpdateProjectInput,
  CreateProjectImageInput,
  UpdateProjectImageInput,
  CreateProjectMemberInput,
  UpdateProjectMemberInput,
} from "@looking-for-group/shared";

/* PROJECT CRUD */

/**
 * Creates a new project and adds it to the database. All params default to null.
 * @param projectData - the data with which to create the project
 * @param devId - ID to be used as the current user
 * @returns 200 if valid, 400 if not
 */ //might need to change Array<object>
export const createNewProject = async (
  projectData: CreateProjectInput,
): Promise<ApiResponse<ProjectDetail>> => {
  const apiURL = `/projects`;
  const form = new FormData();
  
  for (const [name, value] of Object.entries(projectData)){
    if(value !== null) form.append(name, value);
  }

  const response = await POST(apiURL, form);

  if (response.error) console.log("Error creating new project:", response.error);
  return response as ApiResponse<ProjectDetail>;
};

/**
 * Gets all projects in the database
 * @returns Array of all projects if valid, 400 if not
 */
export const getProjects = async (): Promise<ApiResponse<ProjectPreview[]>> => {
  const apiURL = `/projects`;
  const response = await GET(apiURL);

  if (response.error) console.log(`Error in getProjects: ${response.error}`);
  return response;
};

/**
 * Retrieves data of a project by its ID
 * @param projectID -  ID of project to retrieve
 * @returns - A project object if valid, 400 if not
 */
export const getByID = async (projectID: number): Promise<ApiResponse<ProjectWithFollowers>> => {
  const apiURL = `/projects/${projectID}`;
  const response = await GET(apiURL);

  if (response.error) console.log(`Error in getByID: ${response.error}`);
  return response;
};

/**
 * Updates data of an existing project
 * @param projectID - ID of the project to update
 * @param projectData - Data with which to update the project
 * @returns Response status
 */
export const updateProject = async (
  projectID: number,
  projectData: UpdateProjectInput,
): Promise<ApiResponse<ProjectDetail>> => {
  const apiURL = `/projects/${projectID}`;
  
  const form = new FormData();
  for (const [name, value] of Object.entries(projectData)){
    if(value !== null) form.append(name, value);
  }

  const response = await PATCH(apiURL, form);
  if (response.error) console.log(`Error in updateProject: ${response.error}`);
  return response as ApiResponse<ProjectDetail>;
};

/**
 * Deletes an existing project
 * @param projectID - ID of the project to delete
 * @param devId - ID to be used as the current user
 * @returns Response status
 */
export const deleteProject = async (
  projectID: number,
): Promise<ApiResponse<unknown>> => {
  const apiURL = `/projects/${projectID}`;
  const response = await DELETE(apiURL);

  if (response.error) console.log(`Error in deleteProject: ${response.error}`);
  return response;
};

/* ASSETS */


/**
 * Gets the pictures used in a project's carousel
 * @param projectID - ID of the target project
 * @returns Array of image objects if valid, "400" if not
 */
export const getPics = async (projectID: number): Promise<ApiResponse<ProjectImage[]>> => {
  const apiURL = `/projects/${projectID}/images`;
  const response = await GET(apiURL);

  if (response.error) console.log(`Error in getPics: ${response.error}`);
  return response;
};

/**
 * Adds a picture to a project's carousel
 * @param projectID - ID of the target project
 * @param imageData - Data with which to add the image to the project
 * @returns Response status
 */
export const addPic = async (
  projectID: number,
  imageData: CreateProjectImageInput,
): Promise<ApiResponse<ProjectImage>> => {
  const apiURL = `/projects/${projectID}/images`;
    
  const form = new FormData();
  for (const [name, value] of Object.entries(imageData)){
    if(value !== null) form.append(name, value);
  }

  const response = await POST(apiURL, form);

  if (response.error) console.log(`Error in addPic: ${response.error}`);
  return response as ApiResponse<ProjectImage>;
};

/**
 * Updates position order of a project's carousel pictures
 * @param projectID - ID of the target project
 * @param imageData - Data with which to update the image
 * @param devId - ID to be used as the current user
 * @returns Response status
 */
export const updatePic = async (
  projectID: number,
  imageId: number,
  imageData: UpdateProjectImageInput,
): Promise<ApiResponse<ProjectImage>> => {
  const apiURL = `/projects/${projectID}/images/${imageId}`;

  const form = new FormData();
  for (const [name, value] of Object.entries(imageData)){
    if(value !== null) form.append(name, value);
  }

  const response = await PATCH(apiURL, form);

  if (response.error) console.log(`Error in updatePic: ${response.error}`);
  return response as ApiResponse<ProjectImage>;
};

/**
 * Deletes a picture in a project
 * @param projectID - ID of the target project
 * @param imageId - ID of the image to delete
 * @returns Response status
 */
export const deletePic = async (
  projectID: number,
  imageId: number,
): Promise<ApiResponse<null>> => {
  //FIX ROUTE FOR DELETING PICTURE
  //NEEDS TO SPECIFY WHAT PICTURE IS BEING DELETED BY IMAGE NAME
  //uses encode to evoid special character issues
  //is this a relic of the past or does this need to be done

  const apiURL = `/projects/${projectID}/images/${imageId}`;
  const response = await DELETE(apiURL);

  if (response.error) console.log(`Error in deletePic: ${response.error}`);
  return response as ApiResponse<null>;
};

/* MEMBERS */

/**
 * Adds a member to a project
 * @param projectID - ID of the target project
 * @param memberData - Data with which to add a member
 * @param devId - ID to be used as the current user
 * @returns Response status
 */
export const addMember = async (
  ID: number,
  memberData: CreateProjectMemberInput,
): Promise<ApiResponse<ProjectMember>> => {
  const apiURL = `/projects/${ID}/members`;
  const response = await POST(apiURL, memberData);
  
  if (response.error) console.log(`Error in addMember: ${response.error}`);
  return response as ApiResponse<ProjectMember>;
};

/**
 * Updates an existing member in a project
 * @param projectID - ID of the target project
 * @param userId - database ID of the member
 * @param memberData - Data with which to add a member
 * @returns Response status
 */
export const updateMember = async (
  projectID: number,
  userId: number,
  memberData: UpdateProjectMemberInput
): Promise<ApiResponse<ProjectMember>> => {
  const apiURL = `/projects/${projectID}/members/${userId}`;
  const response = await PATCH(apiURL, memberData);

  if (response.error) console.log(`Error in updateMember: ${response.error}`);
  return response as ApiResponse<ProjectMember>;
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
