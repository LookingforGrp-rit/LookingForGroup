import type { ApiResponse, SendProjectInviteInput } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import sendNotificationService from '#services/notifications/send-notification.ts';
import sendInviteService from '#services/projects/members/send-invite.ts';
import { InviteMessageBuilder } from '../../../../notification-templates/invite-message-builder.ts';

//POST api/projects/{id}/members/send-invite
//Sends invite to join the project
const sendInviteController = async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.id as string);
  const memberData: SendProjectInviteInput = req.body as SendProjectInviteInput;

  const result = await sendInviteService(projectId, memberData);

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
      error: 'User or Role not found',
      data: null,
    };
    res.status(404).json(resBody);
    return;
  }

  if (result === 'CONFLICT') {
    const resBody: ApiResponse = {
      status: 409,
      error: 'User already a member of project',
      data: null,
    };
    res.status(409).json(resBody);
    return;
  }

  // Fire-and-forget: notify the invitee in-app, pointing them to the email.
  // Mirrors the project-approval flow; a failed notification must not fail the
  // invite (the email is the source of truth for accepting).
  sendNotificationService(new InviteMessageBuilder(), req).catch((e: unknown) => {
    console.error('Failed to send invite notification:', e);
  });

  const resBody: ApiResponse = {
    status: 200,
    error: null,
    data: null,
  };
  res.status(200).json(resBody);
};

export default sendInviteController;
