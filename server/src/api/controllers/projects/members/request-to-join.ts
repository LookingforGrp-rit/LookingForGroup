import type { ApiResponse, RequestToJoinInput } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { requestToJoinService } from '#services/projects/members/request-to-join.ts';

//POST api/projects/{id}/members/request-to-join
//A user requests to join the project
const requestJoinController = async (req: Request, res: Response) => {
  const projectId = parseInt(req.params.id as string);
  const memberData: RequestToJoinInput = req.body as RequestToJoinInput;

  const result = await requestToJoinService(projectId, memberData);

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
      error: 'Request already exists',
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

export default requestJoinController;
