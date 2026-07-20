import { GET, DELETE, POST, PUT, PATCH } from "./index";
import { ApiResponse, UserAccessLevel, UnapproveProjectInput } from "@looking-for-group/shared";
import { ProjectPreview, ProjectDetail, ProjectReport, UserReport, ModeratorNotificationInput, BanUserInput } from "@looking-for-group/shared";

/**
 * Gets the list of all pending projects
 * @returns List of all pending projects or an error message if the request fails
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
    const response = await DELETE(apiURL, { reason: message });

    if (response.error) console.log(`Error in deleteProjectRequest: ${response.error}`);
    return response;
};

/**
 * Approves a pending project approval request
 * @param projectId The project that is being approved
 * @param projectData The project with now approved status
 * @returns Response from the API call to approve the project
 */
export const approveProjectRequest = async (
    projectId: number,
    projectData: ProjectDetail,
): Promise<ApiResponse> => {
    const apiURL = `/projects/${projectId}/approve`;

    const response = await PATCH(apiURL, projectData);

    if (response.error) console.log(`Error in approveProjectRequest: ${response.error}`);
    return response;
};

/**
 * Unapproves a project that was previously approved. This is used when a mod/admin approves a project report and unapproves the project.
 * @param projectId Project ID of the project to unapprove
 * @param data Message to send to the project owner explaining why their project was unapproved
 * @returns Response from the API call to unapprove the project
 */
export const unapproveProject = async (projectId: number, data: UnapproveProjectInput) => {
    const apiURL = `/projects/${projectId}/unapprove`;

    const response = await PATCH(apiURL, data);

    if (response.error) console.log(`Error in unapproveProject: ${response.error}`);
    return response;
};

/**
 * Gets the list of all reported projects
 * @returns List of all reported projects or an error message if the request fails
 */
export const getReportedProjects = async (): Promise<ApiResponse<ProjectReport[]>> => {
    const apiURL = `/mod/project-report/`;
    const response = await GET(apiURL);

    if (response.error) console.log(`Error in getReportedProjects: ${response.error}`);
    return response;
};

/**
 * Gets the list of all reported users
 * @returns List of all reported users or an error message if the request fails
 */
export const getReportedUsers = async (): Promise<ApiResponse<UserReport[]>> => {
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

/**
 * Approves a project report by unapproving the project and deleting the report
 * @param reportId Report ID of the project report to delete
 * @param projectId Project ID of the project to unapprove
 * @param data Message for project owner explaining why their project was unapproved
 * @returns ApiResponse from unapproveProject and deleteProjectReport
 */
export const takeDownProject = async (
    reportId: number,
    projectId: number,
    data: UnapproveProjectInput
): Promise<{ unapprove: ApiResponse, deleteReport: ApiResponse }> => {
    const unapproveRes = await unapproveProject(projectId, data);
    const deleteRes = await deleteProjectReport(reportId);

    if (unapproveRes.error) console.log(`Error in takeDownProject(unapproveProject): ${unapproveRes.error}`);
    if (deleteRes.error) console.log(`Error in takeDownProject(deleteProjectReport): ${deleteRes.error}`);

    return {
        unapprove: unapproveRes,
        deleteReport: deleteRes,
    };
};

/**
 * Deactivates the user report and sends a notification to the user
 * @param reportId Report ID of the user report to deactivate
 * @param data Notification data
 * @returns ApiResponse from deactivateUserReport
 */
export const warnUser = async (
    reportId: number, 
    data: ModeratorNotificationInput
): Promise<{ deactivate: ApiResponse, notification: ApiResponse }> => {
    const deactivateRes = await deactivateUserReport(reportId);
    const warnRes = await sendModeratorNotification(data);

    if (deactivateRes.error) console.log(`Error in WarnUser(deactivateUserReport): ${deactivateRes.error}`);
    if (warnRes.error) console.log(`Error in WarnUser(sendModeratorNotification): ${warnRes.error}`);

    return {
        deactivate: deactivateRes,
        notification: warnRes,
    };
}

/**
 * Deactivates a user report
 * @param reportId Report ID of the user report to deactivate
 * @returns ApiResponse from the API call to deactivate the user report
 */
export const deactivateUserReport = async (reportId: number): Promise<ApiResponse> => {
    const apiURL = `/mod/user-report/${reportId}/deactivate`;
    const response = await PATCH(apiURL, {});

    if (response.error) console.log(`Error in deactivateUserReport: ${response.error}`);
    return response;
}

/**
 * Sends a moderator notifcation to a user
 * @param data Data needed for sending a moderator notification
 * @returns ApiResponse from the API call to send a moderation notification to a user
 */
export const sendModeratorNotification = async (data: ModeratorNotificationInput): Promise<ApiResponse> => {
    const apiURL = `/mod/warn-user/${data.receiverId}`;
    const res = await PUT(apiURL, data);

    if (res.error) console.log(`Error in sendModeratorNotification: ${res.error}`);
    return res;
}

/**
 * Bans a user from the site
 * @param reportId The id of the report to delete
 * @param data Data needed fro banning a user from the site
 * @returns ApiResponse from the API call to ban a user and deleteUserReport
 */
export const banUser = async (
    reportId: number, 
    data: BanUserInput
): Promise<{ ban: ApiResponse, deleteReport: ApiResponse }> => {
    const apiUrl = `/mod/ban-user/${data.userId}`;
    const res = await POST(apiUrl, data);

    const deleteReport = await deleteUserReport(reportId);

    if (res.error) console.log(`Error in banUser: ${res.error}`);
    if (deleteReport.error) console.log(`Error in banUser(deleteReport): ${res.error}`);

    return {
        ban: res,
        deleteReport: deleteReport,
    };
};

/**
 * Deletes a project report
 * @param reportId The id of the report to delete
 */
export const deleteProjectReport = async (reportId: number,): Promise<ApiResponse> => {
    const apiURL = `/mod/project-report/${reportId}`;
    const response = await DELETE(apiURL, {});

    if (response.error) console.log(`Error in deleteProjectReport: ${response.error}`);
    return response;
};

/**
 * Deletes a user report
 * @param reportId The id of the report to delete
 */
export const deleteUserReport = async (reportId: number,): Promise<ApiResponse> => {
    const apiURL = `/mod/user-report/${reportId}`;
    const response = await DELETE(apiURL, {});

    if (response.error) console.log(`Error in deleteUserReport: ${response.error}`);
    return response;
};
