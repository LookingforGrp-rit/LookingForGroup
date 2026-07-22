import type {
  ApiResponse,
  AuthenticatedRequest,
  ModeratorNotificationInput,
} from '@looking-for-group/shared';
import type { Response } from 'express';
import { ModGeneralNotificationBuilder } from '#notification-templates/mod-general-notification.ts';
import sendGeneralService from '#services/mod/notifications/send-general.ts';
import sendGlobalNotificationService from '#services/mod/notifications/send-global-notification.ts';
import warnUserService from '#services/mod/notifications/warn-user.ts';

//PUT api/mod/notification
//Sends a notification to a user
export const sendNotification = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  let result;
  const type = (req.body as ModeratorNotificationInput).type;

  switch (type) {
    case 'Warning':
      result = await warnUserService(req);
      break;
    case 'General':
      result = await sendGeneralService(req);
      break;
    case 'Announcement':
      result = await sendGlobalNotificationService(new ModGeneralNotificationBuilder(), req);
      break;
  }

  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };
    res.status(500).json(resBody);
    return;
  }

  if (result === 'CONFLICT') {
    const resBody: ApiResponse = {
      status: 409,
      error: 'Notification Already Exists',
      data: null,
    };
    res.status(409).json(resBody);
    return;
  }

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'User Not Found',
      data: null,
    };
    res.status(404).json(resBody);
    return;
  }

  const resBody: ApiResponse = {
    status: 201,
    error: null,
    data: result,
  };
  res.status(201).json(resBody);
};
