import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { NotificationBuilder } from '#notification-templates/notification-builder.ts';
import sendNotificationService from '#services/notifications/send-notification.ts';

/**
 * Sends a notification after all other operations if all those other operations are successful.
 * @param template A notification builder that will build the notification.
 * @param isGlobal Sends the notification to everyone if it's a global notification.
 */
export const sendNotificationAfterAll = (
  template: NotificationBuilder,
  isGlobal: boolean,
): RequestHandler => {
  return async (request: Request, response: Response, next: NextFunction) => {
    next();

    if (response.statusCode !== 200) {
      return;
    }

    await sendNotificationService(template, request, isGlobal);
  };
};
