import { GET, PATCH, DELETE } from "./index";
import type {
  ApiResponse,
  NotificationPreview,
  NotificationDetail,
} from "@looking-for-group/shared";

/* NOTIFICATIONS
 *
 * Thin client over the existing backend notification API (see
 * server/src/api/routes/me.ts). All routes are scoped to the logged-in user,
 * so none of these take a userId — the session cookie identifies the receiver.
 */

/**
 * Get all of the current user's notifications, newest first.
 * Note: previews do NOT include the message body — fetch a single
 * notification with getNotification(id) to get its full text.
 * @returns array of notification previews, or an error response
 */
export const getNotifications = async (): Promise<
  ApiResponse<NotificationPreview[]>
> => {
  const url = `/me/notifications`;
  const response = await GET(url);

  if (response.error) console.log(`Error in getNotifications: ${response.error}`);
  return response as ApiResponse<NotificationPreview[]>;
};

/**
 * Get the full detail (including message body) of a single notification.
 * @param id - the notification's id (uuid string)
 * @returns the notification detail, or an error response
 */
export const getNotification = async (
  id: string
): Promise<ApiResponse<NotificationDetail>> => {
  const url = `/me/notifications/${id}`;
  const response = await GET(url);

  if (response.error) console.log(`Error in getNotification: ${response.error}`);
  return response as ApiResponse<NotificationDetail>;
};

/**
 * Mark a single notification as read.
 * @param id - the notification's id (uuid string)
 * @returns the updated notification, or an error response
 */
export const readNotification = async (
  id: string
): Promise<ApiResponse> => {
  const url = `/me/notifications/${id}/read`;
  const response = await PATCH(url, {});

  if (response.error) console.log(`Error in readNotification: ${response.error}`);
  return response;
};

/**
 * Delete a single notification.
 * @param id - the notification's id (uuid string)
 * @returns 200 if successful, otherwise an error response
 */
export const deleteNotification = async (
  id: string
): Promise<ApiResponse<null>> => {
  const url = `/me/notifications/${id}`;
  const response = await DELETE(url);

  if (response.error) console.log(`Error in deleteNotification: ${response.error}`);
  return response as ApiResponse<null>;
};

/**
 * Check whether the current user has any unread notifications.
 * @returns ApiResponse whose data is `true` when at least one is unread
 */
export const checkForUnreadNotifications = async (): Promise<
  ApiResponse<boolean>
> => {
  const url = `/me/notifications/checkformessages`;
  const response = await GET(url);

  if (response.error)
    console.log(`Error in checkForUnreadNotifications: ${response.error}`);
  return response as ApiResponse<boolean>;
};

export default {
  getNotifications,
  getNotification,
  readNotification,
  deleteNotification,
  checkForUnreadNotifications,
};
