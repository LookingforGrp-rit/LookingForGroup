import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import deleteMemberRequestService from '#services/projects/members/delete-member-request.ts';

//DELETE api/projects/members/requests/{requestId}
//adds a member to the project
const deleteMemberRequestController = async (req: AuthenticatedRequest, res: Response) => {
  const requestId = parseInt(req.params.id);
  const userId = req.currentUser.userId;

  const result = await deleteMemberRequestService(requestId, userId);

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

export default deleteMemberRequestController;
