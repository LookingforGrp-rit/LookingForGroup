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
  UpdateMemberRequestInput,
  AddProjectSocialInput,
  UpdateProjectSocialInput,
  AddProjectTagInput,
  UpdateProjectTagInput,
  AddProjectMediumInput,
  ReorderProjectImagesInput,
  ProjectFollowers,
  ProjectJob,
  CreateProjectJobInput,
  UpdateProjectJobInput,
  UpdateProjectThumbnailInput,
  ProjectVideo,
  CreateProjectVideoInput,
  AddJobSkillInput,
  JobSkill,
  UpdateJobSkillInput,
  SendProjectInviteInput,
  RequestToJoinInput,
  MemberRequests,
  DeleteJobSkillInput,
  GetMemberRequest,
} from "@looking-for-group/shared";

//const navigate = useNavigate();
//i want to redirect to login right in here if the status returns 401 unauthorized
//so the individual components wouldn't have to check for that each time
//but i can't call useNavigate in here

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
  const response = await POST(apiURL, projectData);

  return response as ApiResponse<ProjectDetail>;
};

/**
 * sends a project to be reviewed by a moderator, required to make a project visible
 * @param projectId - ID of project to request review
 * @returns 200 if valid, 400 if not
 */
export const requestProjectReview = async (
  projectId: number,
): Promise<ApiResponse<ProjectDetail>> => {
  const apiURL = '/projects/unapproved/' + projectId;
  const response = await POST(apiURL, {});

  //console.log(response);
  return response as ApiResponse<ProjectDetail>;
}

/**
 * Sends in a report of the project-- something is wrong with it
 * @param projectId ID of project that is being reported
 * @param report The message that was sent along with the report
 * @returns 
 */
export const reportProject = async (
  projectId: number,
  report: string,
): Promise<ApiResponse> => {
  const apiURL = `/me/projects/report/${projectId}`;
  const response = await POST(apiURL, {reason: report});
  
  //if (response.error) console.log(`Error in reportProject: ${response.error}`);
  //else console.log(response);
  return response;
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
 * Retrieves a paginated list of projects.
 * @param count The maximum number of projects to return.
 * @param projectId The project ID cursor. Projects after this ID will be returned. Use 0 to start from the beginning.
 * @returns Array of project previews.
 */
export const getPaginatedProjects = async (
  count: number,
  projectId: number
): Promise<ApiResponse<ProjectPreview[]>> => {
  const apiURL = `/projects/${count}/${projectId}`;
  const response = await GET(apiURL);

  if (response.error) console.log(`Error in getPaginatedProjects: ${response.error}`);
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
 * Retrieves data of a member request associated to the data in the query
 * @param query Data for getting a member request (if requestId is provided, others are optional)
 * @returns The member request if valid, 400 if not
 */
export const getMemberRequest = async (
  query: GetMemberRequest
): Promise<ApiResponse<MemberRequests>> => {
  const apiURL = `/projects/members/requests`;
  const response = await GET(apiURL, query);

  if (response.error) {
    console.log(`Error in getMemberRequest: ${response.error}`);
    throw new Error(response.error);
  }
  return response;
};

export const getMemberRequestByProjectID = async (
  id: number
): Promise<ApiResponse<MemberRequests[]>> => {
  const apiURL = `/projects/${id}/members/requests`;
  const response = await GET(apiURL);

  if (response.error)
    console.log(`Error in getMemberRequestByProjectID: ${response.error}`);
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

  const response = await PATCH(apiURL, projectData);
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
 * Gets the videos used attached to a project
 * @param projectID - ID of the target project
 * @returns Array of video objects if valid, "400" if not
 */
export const getVideos = async (
  projectID: number
): Promise<ApiResponse<ProjectVideo[]>> => {
  const apiURL = `/projects/${projectID}/videos`;
  const response = await GET(apiURL);

  if (response.error) console.log(`Error in getVideos: ${response.error}`);
  return response;
};

/**
 * Attahces a video to a project
 * @param projectID - ID of the target project
 * @returns Response status
 */
export const addVideo = async (
  projectID: number,
  videoData: CreateProjectVideoInput
): Promise<ApiResponse<ProjectVideo>> => {
  const apiURL = `/projects/${projectID}/videos`;
  const response = await POST(apiURL, videoData);

  if (response.error) console.log(`Error in addVideo: ${response.error}`);
  return response as ApiResponse<ProjectVideo>;
};

/**
 * Deletes a video attached to a project
 * @param projectID - ID of the target project
 * @param videoId - ID of the video to delete
 * @returns Response status
 */
export const deleteVideo = async (
  projectID: number,
  videoId: number
): Promise<ApiResponse<null>> => {
  const apiURL = `/projects/${projectID}/videos/${videoId}`;
  const response = await DELETE(apiURL);

  if (response.error) console.log(`Error in deleteVideo: ${response.error}`);
  return response as ApiResponse<null>;
};

// Get project thumbnail
/**
 * @param projectID - ID of the project
 */
export const getThumb = async (
  projectID: number
): Promise<ApiResponse<ProjectImage>> => {
  const apiURL = `/projects/${projectID}/thumbnail`;
  const response = await GET(apiURL);

  if (response.error) console.log(`Error in getThumbnail: ${response.error}`);
  return response;
};

// Update project thumbnail
/**
 * @param projectID - ID of the project
 * @param thumbnail - ID of the project image to use as the thumbnail
 */
export const updateThumb = async (
  projectID: number,
  thumbnail: UpdateProjectThumbnailInput
): Promise<ApiResponse<ProjectImage>> => {
  const apiURL = `/projects/${projectID}/thumbnail`;
  const response = await PUT(apiURL, thumbnail);

  if (response.error) console.log(`Error in updateThumbnail: ${response.error}`);
  return response as ApiResponse<ProjectImage>;
};

/**
 * Removes the thumbnail from a project (does not delete the project image associated with it)
 * @param projectID - ID of the target project
 * @returns Response status
 */
export const removeThumb = async (
  projectID: number
): Promise<ApiResponse<null>> => {

  const apiURL = `/projects/${projectID}/thumbnail`;
  const response = await DELETE(apiURL);

  if (response.error) console.log(`Error in rmeoveThumb: ${response.error}`);
  return response as ApiResponse<null>;
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
 * Gets all the members in a project
 * @param projectID - ID of the target project
 * @returns Response status
 */
export const getMembers = async (
  projectID: number
): Promise<ApiResponse<ProjectMember[]>> => {
  const apiURL = `/projects/${projectID}/members`;
  const response = await GET(apiURL);

  if (response.error) console.log(`Error in getMembers: ${response.error}`);
  return response as ApiResponse<ProjectMember[]>;
};

/**
 * Adds a member to a project
 * @param projectID - ID of the target project
 * @param memberData - Data with which to add a member
 * @returns Response status
 */
export const addMember = async (
  projectID: number,
  memberData: CreateProjectMemberInput
): Promise<ApiResponse<ProjectMember>> => {
  const apiURL = `/projects/${projectID}/members`;
  const response = await POST(apiURL, memberData);

  if (response.error) console.log(`Error in addMember: ${response.error}`);
  return response as ApiResponse<ProjectMember>;
};

/**
 * Sends an invitation to a prospective member
 * @param projectID ID of the target project
 * @param memberData Data with which to add a member
 * @returns Response status
 */
export const sendInvite = async (
  projectID: number,
  memberData: SendProjectInviteInput
): Promise<ApiResponse<null>> => {
  const apiURL = `/projects/${projectID}/members/send-invite`;
  const response = await POST(apiURL, memberData);

  if (response.error) console.log(`Error in sendInvite: ${response.error}`);
  return response as ApiResponse<null>;
};

/**
 * Sends a request to join email to project owner
 * @param projectID ID of the target project
 * @param memberData Data with which to add a member
 * @returns Response status
 */
export const requestToJoin = async (
  projectID: number,
  memberData: RequestToJoinInput
): Promise<ApiResponse<null>> => {
  const apiURL = `/projects/${projectID}/members/request-to-join`;
  const response = await POST(apiURL, memberData);

  if (response.error) {
    console.log(`Error in requestToJoin: ${response.error}`);
    throw new Error(response.error);
  }
  return response as ApiResponse<null>;
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
 * Updates an existing member request
 * @param requestID - Database ID of the request
 * @param memberData - Data to update a member request
 * @returns Response status
 */
export const updateMemberRequest = async (
  requestID: number,
  memberData: UpdateMemberRequestInput
): Promise<ApiResponse<null>> => {
  const apiURL = `/projects/members/requests/${requestID}`;
  const response = await PATCH(apiURL, memberData);

  if (response.error) console.log(`Error in updatePendingMember: ${response.error}`);
  return response as ApiResponse<null>;
};

/**
 * Removes a member request from a project
 * @param requestID - Database ID of the request
 * @returns Response status
 */
export const deleteMemberRequest = async (
  requestID: number,
): Promise<ApiResponse<null>> => {
  const apiURL = `/projects/members/requests/${requestID}`;
  const response = await DELETE(apiURL);

  if (response.error) console.log(`Error in deleteMemberRequest: ${response.error}`);
  return response as ApiResponse<null>;
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
export const addProjectSocial = async (
  projectID: number,
  socialData: AddProjectSocialInput
): Promise<ApiResponse<ProjectSocial>> => {
  const apiURL = `/projects/${projectID}/socials`;
  const response = await POST(apiURL, socialData);

  if (response.error)
    console.log(`Error in addProjectSocial: ${response.error}`);
  return response as ApiResponse<ProjectSocial>;
};

// Update project socials
/**
 * @param projectID - ID of the project
 * @param socialId - ID of the social to be updated
 * @param socialData - Data with which to update the social
 */
export const updateProjectSocial = async (
  projectID: number,
  socialId: number,
  socialData: UpdateProjectSocialInput
): Promise<ApiResponse<ProjectSocial>> => {
  const apiURL = `/projects/${projectID}/socials/${socialId}`;
  const response = await PATCH(apiURL, socialData);

  if (response.error)
    console.log(`Error in updateProjectSocial: ${response.error}`);
  return response as ApiResponse<ProjectSocial>;
};

// Delete project socials
/**
 * @param projectID - ID of the project
 * @param socialId - ID of the social to be deleted
 */
export const deleteProjectSocial = async (
  projectID: number,
  socialId: number
): Promise<ApiResponse<null>> => {
  const apiURL = `/projects/${projectID}/socials/${socialId}`;
  const response = await DELETE(apiURL);

  if (response.error)
    console.log(`Error in deleteProjectSocial: ${response.error}`);
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
 * @param tagData - Data with which to add the tag
 */
export const addProjectTag = async (
  projectID: number,
  tagData: AddProjectTagInput
): Promise<ApiResponse<ProjectTag>> => {
  const apiURL = `/projects/${projectID}/tags`;
  const response = await POST(apiURL, tagData);

  if (response.error) console.log(`Error in addProjectTag: ${response.error}`);
  return response as ApiResponse<ProjectTag>;
};

// Delete project tags
/**
 * @param projectID - ID of the project
 * @param tagId - ID of the tag to be deleted
 */
export const deleteProjectTag = async (
  projectID: number,
  tagId: number
): Promise<ApiResponse<null>> => {
  const apiURL = `/projects/${projectID}/tags/${tagId}`;
  const response = await DELETE(apiURL);

  if (response.error)
    console.log(`Error in deleteProjectTag: ${response.error}`);
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
export const addProjectMedium = async (
  projectID: number,
  mediumData: AddProjectMediumInput
): Promise<ApiResponse<ProjectMedium>> => {
  const apiURL = `/projects/${projectID}/mediums`;
  const response = await POST(apiURL, mediumData);

  if (response.error)
    console.log(`Error in addProjectMedium: ${response.error}`);
  return response as ApiResponse<ProjectMedium>;
};

// Delete project mediums
/**
 * @param projectID - ID of the project
 * @param mediumId - ID of the medium to delete
 */
export const deleteProjectMedium = async (
  projectID: number,
  mediumId: number
): Promise<ApiResponse<null>> => {
  const apiURL = `/projects/${projectID}/mediums/${mediumId}`;
  const response = await DELETE(apiURL);

  if (response.error)
    console.log(`Error in deleteProjectMedium: ${response.error}`);
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
 * @param jobData - Data with which to create the job
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

//Add a job skill to a job
/**
 * @param projectID - ID of the project
 * @param jobID - ID of the job
 * @param skillData - Data with which to create the job skill
 */
export const addJobSkill = async (
  projectID: number,
  jobID: number,
  skillData: AddJobSkillInput
): Promise<ApiResponse<JobSkill>> => {
  const apiURL = `/projects/${projectID}/jobs/${jobID}/skills`;
  const response = await POST(apiURL, skillData);

  if (response.error) console.log(`Error in addJobSkill: ${response.error}`);
  return response as ApiResponse<JobSkill>;
};

//Get all skills attached to a job
/**
 * @param projectID - ID of the project
 * @param jobID - ID of the job
 * @param skillData - Data with which to create the job skill
 */
export const getJobSkills = async (
  projectID: number,
  jobID: number
): Promise<ApiResponse<JobSkill[]>> => {
  const apiURL = `/projects/${projectID}/jobs/${jobID}/skills`;
  const response = await GET(apiURL);

  if (response.error) console.log(`Error in getJobSkills: ${response.error}`);
  return response as ApiResponse<JobSkill[]>;
};

/**
 * @param projectID - ID of the project
 * @param jobID - ID of the job
 * @param skillData - Data with which to create the job skill
 */
export const updateJobSkill = async (
  projectID: number,
  jobID: number,
  skillData: UpdateJobSkillInput
): Promise<ApiResponse<JobSkill>> => {


  const apiURL = `/projects/${projectID}/jobs/${jobID}/skills/${skillData.skillId}`;
  const response = await PATCH(apiURL, skillData);

  if (response.error) console.log(`Error in updateJobSkill: ${response.error}`);
  return response as ApiResponse<JobSkill>;
};

/**
 * @param projectID - ID of the project
 * @param jobID - ID of the job
 * @param skillData - Data with which to create the job skill
 */
export const deleteJobSkill = async (
  projectID: number,
  skillData: DeleteJobSkillInput
): Promise<ApiResponse<null>> => {
  const apiURL = `/projects/${projectID}/jobs/${skillData.jobId}/skills/${skillData.skillId}`;
  const response = await DELETE(apiURL);

  if (response.error) console.log(`Error in deleteJobSkill: ${response.error}`);
  return response as ApiResponse<null>;
};


// Update a project tag
/**
 * @param projectID - ID of the project
 * @param tagId - ID of the tag to be updated
 * @param tagData - Data with which to update the tag
 */
export const updateProjectTag = async (
  projectID: number,
  tagId: number,
  tagData: UpdateProjectTagInput
): Promise<ApiResponse<ProjectTag>> => {
  const apiURL = `/projects/${projectID}/tags/${tagId}`;
  const response = await PATCH(apiURL, tagData);

  if (response.error)
    console.log(`Error in updateProjectTag: ${response.error}`);
  return response as ApiResponse<ProjectTag>;
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
  const response = await PATCH(apiURL, jobData);

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

/**
 * 
 * @param projectID - ID of the project
 * @returns if the approval request exists or not
 */
export const projectApprovalRequestExists = async (projectID: number): Promise<boolean> => {
  const apiURL = `/projects/unapproved/${projectID}`;
  const response = await GET(apiURL);

  if (response.status === 500)
    console.log(`Error in projectApprovalRequestExists: ${response.error}`);
  else if (response.status === 404) {
    console.log(`Error in projectApprovalRequestExists: ${response.error}`);
    return false;
  }
  return true;
};

/**
 * Checks if the member request 
 * @param projectID - ID of the project
 * @returns if the member request exists or not
 */
export const projectMemberRequestExists = async (projectID: number): Promise<boolean> => {
  const apiURL = `/projects/unapproved/${projectID}`;
  const response = await GET(apiURL);

  if (response.status === 500)
    console.log(`Error in projectApprovalRequestExists: ${response.error}`);
  else if (response.status === 404) {
    console.log(`Error in projectApprovalRequestExists: ${response.error}`);
    return false;
  }
  return true;
};

export default {
  createNewProject,
  requestProjectReview,
  getProjects,
  getByID,
  updateProject,
  deleteProject,
  getPics,
  addPic,
  updatePic,
  deletePic,
  addMember,
  sendInvite,
  requestToJoin,
  updateMember,
  getMemberRequest,
  getMemberRequestByProjectID,
  updateMemberRequest,
  deleteMemberRequest,
  deleteMember,
  getProjectSocials,
  addProjectSocial,
  getThumb,
  updateThumb,
  removeThumb,
  updateProjectSocial,
  deleteProjectSocial,
  getProjectTags,
  addProjectTag,
  updateProjectTag,
  deleteProjectTag,
  getProjectMediums,
  addProjectMedium,
  deleteProjectMedium,
  reorderProjectImages,
  addJobSkill,
  getJobSkills,
  updateJobSkill,
  deleteJobSkill,
  // getImageByFileName,
  projectApprovalRequestExists,
};
