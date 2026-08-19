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
  return (request: Request, response: Response, next: NextFunction) => {
    next();

    // anything equal to or higher than 400 is an error
    if (response.statusCode >= 400) {
      return;
    }

    // this is the best solution I could think of
    // because, for some reason, this is called before the next() function is completed fully
    // ergo we need to give the database time to update.
    // If someone else figures out why, please find a better solution.
    setTimeout(() => {
      sendNotificationService(template, request, isGlobal).catch(() => {});
    }, 500);
  };
};
