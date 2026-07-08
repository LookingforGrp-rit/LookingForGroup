import type {
  ApiResponse,
  AuthenticatedRequest,
  UpdateMemberRequestInput,
} from '@looking-for-group/shared';
import type { Response } from 'express';
import { InviteAcceptedNotificationBuilder } from '#notification-templates/invite-accepted-notification.ts';
import { InviteRejectedNotificationBuilder } from '#notification-templates/invite-rejected-notification.ts';
import type { NotificationBuilder } from '#notification-templates/notification-builder.ts';
import { RequestAcceptedNotificationBuilder } from '#notification-templates/request-accepted-notification.ts';
import { RequestRejectedNotificationBuilder } from '#notification-templates/request-rejected-notification.ts';
import sendNotificationService from '#services/notifications/send-notification.ts';
import updateMemberRequestStatusService from '#services/projects/members/update-member-request.ts';
import { determineMembershipRequestResponse } from './determine-member-request-response.ts';

//DELETE api/projects/members/requests/{requestId}
//adds a member to the project
const updateMemberRequest = async (req: AuthenticatedRequest, res: Response) => {
  const requestId = parseInt(req.params.id as string);
  const userId = req.currentUser.userId;

  const body = req.body as UpdateMemberRequestInput;

  const result = await updateMemberRequestStatusService(requestId, userId, body.newStatus);

  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };
    res.status(500).json(resBody);
    return;
  }

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'Request not found',
      data: null,
    };
    res.status(404).json(resBody);
    return;
  }

  if (result === 'FORBIDDEN') {
    const resBody: ApiResponse = {
      status: 403,
      error: 'Missing credentials',
      data: null,
    };
    res.status(403).json(resBody);
    return;
  }

  const resBody: ApiResponse = {
    status: 200,
    error: null,
    data: null,
  };
  res.status(200).json(resBody);

  // Sending the notification //
  let builder: NotificationBuilder;
  switch (await determineMembershipRequestResponse(req)) {
    case 'REQUEST-ACCEPTED':
      builder = new RequestAcceptedNotificationBuilder();
      break;
    case 'REQUEST-REJECTED':
      builder = new RequestRejectedNotificationBuilder();
      break;
    case 'INVITE-ACCEPTED':
      builder = new InviteAcceptedNotificationBuilder();
      break;
    case 'INVITE-REJECTED':
      builder = new InviteRejectedNotificationBuilder();
      break;
  }

  sendNotificationService(builder, req).catch(() => {});
};

export default updateMemberRequest;
