import type {
  ApiResponse,
  AuthenticatedRequest,
  UpdateMemberRequestInput,
} from '@looking-for-group/shared';
import type { Response } from 'express';
import updateMemberRequestStatusService from '#services/projects/members/update-member-request.ts';

//DELETE api/projects/members/requests/{requestId}
//adds a member to the project
const updateMemberRequest = async (req: AuthenticatedRequest, res: Response) => {
  const requestId = parseInt(req.params.id as string);
  const userId = req.currentUser.userId;

  const body = req.body as UpdateMemberRequestInput;

  const result = await updateMemberRequestStatusService(requestId, userId, body);

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
};

export default updateMemberRequest;
