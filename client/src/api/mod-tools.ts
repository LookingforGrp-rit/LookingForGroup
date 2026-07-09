import { GET, DELETE, PATCH } from "./index";
import { ApiResponse } from "@looking-for-group/shared";
import { ProjectPreview } from "@looking-for-group/shared";

/**
 * Gets a list of all reported projects
 */
export const getPendingProjects = async (): 
Promise<ApiResponse<ProjectPreview[]>> => {
  const apiURL = "/projects/unapproved";
  const response = await GET(apiURL);

  if (response.error) console.log(`Error in getPendingProjects: ${response.error}`);
  return response;
};

/**
 * Rejects (deletes) a pending approval request for a project
 * @param projectId The project request to delete
 */
export const deleteProjectRequest = async (
    projectId: number
): Promise<ApiResponse> => {
    const apiURL = `/projects/unapproved/${projectId}`;
    const response = await DELETE(apiURL);

    if (response.error) console.log(`Error in deleteProjectRequest: ${response.error}`);
    return response;
};

/**
 * Approves a pending project approval request
 * @param projectId The project that is being approved
 * @param userId The Admin/Mod user ID that is approving the project
 */
export const approveProjectRequest = async (
    projectId: number
): Promise<ApiResponse> => {
    const apiURL = `projects/${projectId}/approve`;
    const response = await PATCH(apiURL, {});

    if (response.error) console.log(`Error in approveProjectRequest: ${response.error}`);
    return response;
};

/**
 * Gets the list of all reported projects
 */
export const getReportedProjects = async (): Promise<ApiResponse> => {
    const apiURL = `/mod/project-report`;
    const response = await GET(apiURL);

    if (response.error) console.log(`Error in getReportedProjects: ${response.error}`);
    return response;
};

/**
 * Gets the list of all reported users
 */
export const getReportedUsers = async (): Promise<ApiResponse> => {
    const apiURL = `/mod/user-report`;
    const response = await GET(apiURL);

    if (response.error) console.log(`Error in getReportedUsers: ${response.error}`);
    return response;
};

