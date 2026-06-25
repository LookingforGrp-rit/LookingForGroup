import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import { requestApprovalService } from '#services/projects/approval/request-approval.ts';

//POST api/projects/unapproved
//requests a project be approved
const requestApprovalController = async (req: AuthenticatedRequest, res: Response) => {
  const projectId = parseInt(req.params.id as string);
  const result = await requestApprovalService(projectId);

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
      error: 'No such project exists',
      data: null,
    };
    res.status(404).json(resBody);
    return;
  }

  if (result === 'CONFLICT') {
    const resBody: ApiResponse = {
      status: 409,
      error: 'Project is already awaiting request',
      data: null,
    };
    res.status(409).json(resBody);
    return;
  }

  const resBody: ApiResponse = {
    status: 200,
    error: null,
    data: null,
  };
  res.status(200).json(resBody);
};

export default requestApprovalController;
