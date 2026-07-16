import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import { InviteAcceptedNotificationBuilder } from '#notification-templates/invite-accepted-notification.ts';
import type { NotificationBuilder } from '#notification-templates/notification-builder.ts';
import sendNotificationService from '#services/notifications/send-notification.ts';

//POST api/mod/send-notification
//Sends a notification directly from a moderator
export const sendNotification = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const body = req.body as { builderType: string };
  const builderType = body.builderType;

  let builder: NotificationBuilder;
  //NOTE: whenever a new type of notification is created,
  // and you want a mod to be able to send it manually,
  // this switch statement MUST BE UPDATED to include that notification builder
  switch (builderType) {
    case 'InviteAcceptedNotificationBuilder':
      builder = new InviteAcceptedNotificationBuilder();
      break;
    default:
      builder = new InviteAcceptedNotificationBuilder();
      break;
  }

  const result = await sendNotificationService(builder, req);

  if (result === 'CONFLICT') {
    const resBody: ApiResponse = {
      status: 409,
      error: 'Conflict',
      data: null,
    };
    res.status(409).json(resBody);
    return;
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

  const resBody: ApiResponse = {
    status: 201,
    error: null,
    data: null,
  };
  res.status(201).json(resBody);
};
