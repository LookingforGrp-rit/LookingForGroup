import type { SendProjectInviteInput, ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import getService from '#services/projects/members/send-invite.ts';

const parseInviteBody = (body: unknown): SendProjectInviteInput | null => {
  if (!body || typeof body !== 'object') return null;
  const data = body as Record<string, unknown>;

  const inviteeUserId = Number(data.inviteeUserId);
  const targetUserId = Number(data.targetUserId);
  const roleId = Number(data.roleId);

  if (
    Number.isInteger(inviteeUserId) &&
    Number.isInteger(targetUserId) &&
    Number.isInteger(roleId)
  ) {
    return {
      inviteeUserId,
      targetUserId,
      roleId,
    };
  }

  return null;
};

//POST api/projects/:id/members/invite
//sends an invite to a user to join a project
const sendInviteController = async (req: Request, res: Response): Promise<void> => {
  const projectId = parseInt(req.params.id);
  const memberData = parseInviteBody(req.body);

  if (!memberData) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Missing or invalid required fields',
      data: null,
    };
    res.status(400).json(resBody);
    return;
  }

  const result = await getService(projectId, memberData);

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
      error: 'User Already in Project',
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

  const resBody: ApiResponse<typeof result> = {
    status: 200,
    error: null,
    data: result,
  };
  res.status(200).json(resBody);
};

export default sendInviteController;
