import type { ApiResponse, SendProjectInviteInput } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import sendInviteService from '#services/projects/members/send-invite.ts';

//POST api/projects/{id}/members
//adds a member to the project
const sendInviteController = async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.id);
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

  const resBody: ApiResponse = {
    status: 201,
    error: null,
    data: null,
  };
  res.status(201).json(resBody);
};

export default sendInviteController;
