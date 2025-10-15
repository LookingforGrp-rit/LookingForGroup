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
  AddProjectSocialInput,
  UpdateProjectSocialInput,
  AddProjectTagsInput,
  AddProjectMediumsInput,
  ReorderProjectImagesInput,
  ProjectFollowers,
  ProjectJob,
  CreateProjectJobInput,
  UpdateProjectJobInput,
} from "@looking-for-group/shared";

/* PROJECT CRUD */

/**
 * Creates a new project and adds it to the database. All params default to null.
 * @param projectData - the data with which to create the project
 * @returns 200 if valid, 400 if not
 */ //might need to change Array<object>
export const createNewProject = async (
  projectData: CreateProjectInput
): Promise<ApiResponse<ProjectDetail>> => {
  const apiURL = `/projects`;
  const form = new FormData();

  for (const [name, value] of Object.entries(projectData)) {
    if (value !== null) form.append(name, value);
  }

  const response = await POST(apiURL, form);

  if (response.error)
    console.log("Error creating new project:", response.error);
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
export const getByID = async (
  projectID: number
): Promise<ApiResponse<ProjectWithFollowers>> => {
  const apiURL = `/projects/${projectID}`;
  const response = await GET(apiURL);

  if (response.error) console.log(`Error in getByID: ${response.error}`);
  return response;
};
/**
 * Retrieves data of a project by its ID
 * @param projectID -  ID of project to retrieve
 * @returns - A project object if valid, 400 if not
 */
export const getProjectFollowers = async (
  projectID: number
): Promise<ApiResponse<ProjectFollowers>> => {
  const apiURL = `/projects/${projectID}/followers`;
  const response = await GET(apiURL);

  if (response.error)
    console.log(`Error in getProjectFollowers: ${response.error}`);
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
  projectData: UpdateProjectInput
): Promise<ApiResponse<ProjectDetail>> => {
  const apiURL = `/projects/${projectID}`;

  const form = new FormData();
  for (const [name, value] of Object.entries(projectData)) {
    if (value !== null) form.append(name, value);
  }

  const response = await PATCH(apiURL, form);
  if (response.error) console.log(`Error in updateProject: ${response.error}`);
  return response as ApiResponse<ProjectDetail>;
};

/**
 * Deletes an existing project
 * @param projectID - ID of the project to delete
 * @returns Response status
 */
export const deleteProject = async (
  projectID: number
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
export const getPics = async (
  projectID: number
): Promise<ApiResponse<ProjectImage[]>> => {
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
  imageData: CreateProjectImageInput
): Promise<ApiResponse<ProjectImage>> => {
  const apiURL = `/projects/${projectID}/images`;

  const form = new FormData();
  for (const [name, value] of Object.entries(imageData)) {
    if (value !== null) form.append(name, value);
  }

  const response = await POST(apiURL, form);

  if (response.error) console.log(`Error in addPic: ${response.error}`);
  return response as ApiResponse<ProjectImage>;
};

/**
 * Updates position order of a project's carousel pictures
 * @param projectID - ID of the target project
 * @param imageData - Data with which to update the image
 * @param imageId - ID of the image to be updated
 * @returns Response status
 */
export const updatePic = async (
  projectID: number,
  imageId: number,
  imageData: UpdateProjectImageInput
): Promise<ApiResponse<ProjectImage>> => {
  const apiURL = `/projects/${projectID}/images/${imageId}`;

  const form = new FormData();
  for (const [name, value] of Object.entries(imageData)) {
    if (value !== null) form.append(name, value);
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
  imageId: number
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
 * Gets all the members in a project [GET MEMBERS ISN'T ON THIS BRANCH YET]
 * @param projectID - ID of the target project
 * @returns Response status
 */
export const getMembers = async (
  projectID: number
): Promise<ApiResponse<ProjectMember>> => {
  const apiURL = `/projects/${projectID}/members`;
  const response = await GET(apiURL);

  if (response.error) console.log(`Error in getMembers: ${response.error}`);
  return response;
};

/**
 * Adds a member to a project
 * @param projectID - ID of the target project
 * @param memberData - Data with which to add a member
 * @returns Response status
 */
export const addMember = async (
  ID: number,
  memberData: CreateProjectMemberInput
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
 * @param projectID - ID of the target project
 * @param userId - ID of the target user
 * @returns Response status
 */
export const deleteMember = async (
  projectID: number,
  userId: number
): Promise<ApiResponse<null>> => {
  const apiURL = `/projects/${projectID}/members/${userId}`;
  const response = await DELETE(apiURL);

  if (response.error) console.log(`Error in deleteMember: ${response.error}`);
  return response as ApiResponse<null>;
};

// Get a project's socials
export const getProjectSocials = async (
  projectID: number
): Promise<ApiResponse<ProjectSocial[]>> => {
  const apiURL = `/projects/${projectID}/socials`;
  const response = await GET(apiURL);

  if (response.error)
    console.log(`Error in getProjectSocials: ${response.error}`);
  return response;
};

// Add a project's socials
/**
 * @param ID - ID of the project
 * @param socialData - Data with which to create the social
 */
export const addProjectSocials = async (
  projectID: number,
  socialData: AddProjectSocialInput
): Promise<ApiResponse<ProjectSocial>> => {
  const apiURL = `/projects/${projectID}/socials`;
  const response = await POST(apiURL, socialData);

  if (response.error)
    console.log(`Error in addProjectSocials: ${response.error}`);
  return response as ApiResponse<ProjectSocial>;
};

// Update project socials
/**
 * @param projectID - ID of the project
 * @param websiteId - ID of the social to be updated
 * @param socialData - Data with which to update the social
 */
export const updateProjectSocials = async (
  projectID: number,
  websiteId: number,
  socialData: UpdateProjectSocialInput
): Promise<ApiResponse<ProjectSocial>> => {
  const apiURL = `/projects/${projectID}/socials/${websiteId}`;
  const response = await PUT(apiURL, socialData);

  if (response.error)
    console.log(`Error in updateProjectSocials: ${response.error}`);
  return response as ApiResponse<ProjectSocial>;
};

// Delete project socials
/**
 * @param projectID - ID of the project
 * @param websiteId - ID of the social to be deleted
 */
export const deleteProjectSocials = async (
  projectID: number,
  websiteId: number
): Promise<ApiResponse<null>> => {
  const apiURL = `/projects/${projectID}/socials/${websiteId}`;
  const response = await DELETE(apiURL);

  if (response.error)
    console.log(`Error in deleteProjectSocials: ${response.error}`);
  return response as ApiResponse<null>;
};

// Get project tags
/**
 * @param projectID - ID of the project
 */
export const getProjectTags = async (
  projectID: number
): Promise<ApiResponse<ProjectTag[]>> => {
  const apiURL = `/projects/${projectID}/tags`;
  const response = await GET(apiURL);

  if (response.error) console.log(`Error in getProjectTags: ${response.error}`);
  return response;
};

// Add project tags
/**
 * @param projectID - ID of the project
 * @param tagData - Data with which to add the tags
 */
export const addProjectTags = async (
  projectID: number,
  tagData: AddProjectTagsInput
): Promise<ApiResponse<ProjectTag>> => {
  const apiURL = `/projects/${projectID}/tags`;
  const response = await POST(apiURL, tagData);

  if (response.error) console.log(`Error in addProjectTags: ${response.error}`);
  return response as ApiResponse<ProjectTag>;
};

// Delete project tags
/**
 * @param projectID - ID of the project
 * @param tagId - ID of the tag to be deleted
 */
export const deleteProjectTags = async (
  projectID: number,
  tagId: number
): Promise<ApiResponse<null>> => {
  const apiURL = `/projects/${projectID}/tags${tagId}`;
  const response = await DELETE(apiURL);

  if (response.error)
    console.log(`Error in deleteProjectTags: ${response.error}`);
  return response as ApiResponse<null>;
};

// Get project mediums
export const getProjectMediums = async (
  projectID: number
): Promise<ApiResponse<ProjectMedium[]>> => {
  const apiURL = `/projects/${projectID}/mediums`;
  const response = await GET(apiURL);

  if (response.error)
    console.log(`Error in getProjectMediums: ${response.error}`);
  return response;
};

// Add project mediums
/**
 * @param projectID - ID of the project
 * @param mediumId - Data with which to add the medium
 */
export const addProjectMediums = async (
  projectID: number,
  mediumData: AddProjectMediumsInput
): Promise<ApiResponse<ProjectMedium>> => {
  const apiURL = `/projects/${projectID}/mediums`;
  const response = await POST(apiURL, mediumData);

  if (response.error)
    console.log(`Error in addProjectMediums: ${response.error}`);
  return response as ApiResponse<ProjectMedium>;
};

// Delete project mediums
/**
 * @param projectID - ID of the project
 * @param mediumId - ID of the medium to delete
 */
export const deleteProjectMediums = async (
  projectID: number,
  mediumId: number
): Promise<ApiResponse<null>> => {
  const apiURL = `/projects/${projectID}/mediums${mediumId}`;
  const response = await DELETE(apiURL);

  if (response.error)
    console.log(`Error in deleteProjectMediums: ${response.error}`);
  return response as ApiResponse<null>;
};

// Get a project's jobs
export const getProjectJobs = async (
  projectID: number
): Promise<ApiResponse<ProjectJob[]>> => {
  const apiURL = `/projects/${projectID}/jobs`;
  const response = await GET(apiURL);

  if (response.error) console.log(`Error in getProjectJobs: ${response.error}`);
  return response;
};

// Add a project job
/**
 * @param projectID - ID of the project
 * @param jobData - Data with which to create the joob
 */
export const addProjectJob = async (
  projectID: number,
  jobData: CreateProjectJobInput
): Promise<ApiResponse<ProjectJob>> => {
  const apiURL = `/projects/${projectID}/jobs`;
  const response = await POST(apiURL, jobData);

  if (response.error) console.log(`Error in addProjectJob: ${response.error}`);
  return response as ApiResponse<ProjectJob>;
};

// Update a project job
/**
 * @param projectID - ID of the project
 * @param jobId - ID of the job to be updated
 * @param jobData - Data with which to update the job
 */
export const updateProjectJob = async (
  projectID: number,
  jobId: number,
  jobData: UpdateProjectJobInput
): Promise<ApiResponse<ProjectJob>> => {
  const apiURL = `/projects/${projectID}/jobs/${jobId}`;
  const response = await PUT(apiURL, jobData);

  if (response.error)
    console.log(`Error in updateProjectJob: ${response.error}`);
  return response as ApiResponse<ProjectJob>;
};

// Delete a project job
/**
 * @param projectID - ID of the project
 * @param jobId - ID of the job to be deleted
 */
export const deleteProjectJob = async (
  projectID: number,
  jobId: number
): Promise<ApiResponse<null>> => {
  const apiURL = `/projects/${projectID}/jobs/${jobId}`;
  const response = await DELETE(apiURL);

  if (response.error)
    console.log(`Error in deleteProjectJob: ${response.error}`);
  return response as ApiResponse<null>;
};

// Re-order project images
//i really just wanna get rid of this one...
/**
 * @param projectID - ID of the project
 * @param imageOrder - The imageIds listed in their new order
 */
export const reorderProjectImages = async (
  projectID: number,
  imageOrder: ReorderProjectImagesInput
): Promise<ApiResponse<ProjectImage[]>> => {
  const apiURL = `/projects/${projectID}/images/reorder`;
  const response = await PUT(apiURL, imageOrder);

  if (response.error)
    console.log(`Error in reorderProjectImages: ${response.error}`);
  return response as ApiResponse<ProjectImage[]>;
};

// FIXME this wouldnt work bc of the way GET() works. GET /images/:imageURL doesn't return an ApiResponse object
// // Get an image by file name
// export const getImageByFileName = async (imageURL: string): Promise<ApiResponse<Blob>> => {
//   const apiURL = `/images/${imageURL}`;
//   const response = await GET(apiURL);

//   if (response.error) console.log(`Error in getImageByFileName: ${response.error}`);
//   return response;
// }

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
  // getImageByFileName,
};
