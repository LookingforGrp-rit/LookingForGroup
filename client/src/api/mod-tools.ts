import { GET, DELETE, PATCH } from "./index";
import { ApiResponse, UserAccessLevel, UnapproveProjectInput } from "@looking-for-group/shared";
import { ProjectPreview, ProjectDetail, ProjectReport } from "@looking-for-group/shared";

/**
 * Gets a list of all pending projects
 */
export const getPendingProjects = async (): Promise<ApiResponse<ProjectPreview[]>> => {
  const apiURL = "/projects/unapproved";
  const response = await GET(apiURL);

  if (response.error) console.log(`Error in getPendingProjects: ${response.error}`);
  return response;
};

/**
 * Rejects (deletes) a pending approval request for a project
 * @param projectId The project request to delete
 * @param message The message to send to the user that explains why the project request was declined
 */
export const deleteProjectRequest = async (
    projectId: number,
    message: string
): Promise<ApiResponse> => {
    const apiURL = `/projects/unapproved/${projectId}`;
    const response = await DELETE(apiURL, {message});

    if (response.error) console.log(`Error in deleteProjectRequest: ${response.error}`);
    return response;
};

/**
 * Approves a pending project approval request
 * @param projectId The project that is being approved
 * @param projectData The project with now approved status
 * @param userId The Admin/Mod user ID that is approving the project
 */
export const approveProjectRequest = async (
    projectId: number,
    projectData: ProjectDetail,
    modId: number
): Promise<ApiResponse> => {
    const apiURL = `/projects/${projectId}/approve`;
    
    const response = await PATCH(apiURL, projectData);
    console.log(response.status);

    if (response.error) console.log(`Error in approveProjectRequest: ${response.error}`);
    return response;
};

export const unapproveProject = async (projectId: number, data: UnapproveProjectInput) => {
    const apiURL = `/projects/${projectId}/unapprove`;

    const response = await PATCH(apiURL, data);

    if (response.error) console.log(`Error in unapproveProject: ${response.error}`);
    return response;
};

/**
 * Gets the list of all reported projects
 */
export const getReportedProjects = async (): Promise<ApiResponse<ProjectReport[]>> => {
    const apiURL = `/mod/project-report/`;
    const response = await GET(apiURL);

    if (response.error) console.log(`Error in getReportedProjects: ${response.error}`);
    return response;
};

/**
 * Gets the list of all reported users
 */
export const getReportedUsers = async (): Promise<ApiResponse> => {
    const apiURL = `/mod/user-report/`;
    const response = await GET(apiURL);

    if (response.error) console.log(`Error in getReportedUsers: ${response.error}`);
    return response;
};

/**
 * Gets the access level of the current user
 */
export const getUserAccessLevel = async (userId: number): Promise<ApiResponse<UserAccessLevel>> => {
    const apiURL = `/admin/status/${userId}`;
    const response = await GET(apiURL);

    if (response.error) console.log(`Error in getUserAccessLevel: ${response.error}`);
    return response;
};

export const approveProjectReport = async(
    reportId: number, 
    projectId: number, 
    data: UnapproveProjectInput
): Promise<ApiResponse> => {
    const unapproveRes = await unapproveProject(projectId, data);
    const deleteRes = await deleteProjectReport(reportId);

    if (unapproveRes.error) console.log(`Error in approveProjectReport (unapproveProject): ${unapproveRes.error}`);
    if (deleteRes.error) console.log(`Error in approveProjectReport (deleteProjectReport): ${deleteRes.error}`);

    return unapproveRes;
};

/**
 * Deletes a project report
 * @param reportId The id of the report to delete
 */
export const deleteProjectReport = async (reportId: number, ): Promise<ApiResponse> => {
    const apiURL = `/mod/project-report/${reportId}`;
    const response = await DELETE(apiURL, {});

    if (response.error) console.log(`Error in deleteProjectReport: ${response.error}`);
    return response;
};