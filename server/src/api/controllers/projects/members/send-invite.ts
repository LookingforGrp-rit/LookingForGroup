import type { SendProjectInviteInput, ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import getService from '#services/projects/members/send-invite.ts';

//POST api/projects/:id/members/invite
//sends an invite to a user to join a project
const sendInviteController = async (req: Request, res: Response): Promise<void> => {
  const projectId = parseInt(req.params.id);
  const memberData: SendProjectInviteInput = req.body as SendProjectInviteInput;

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
