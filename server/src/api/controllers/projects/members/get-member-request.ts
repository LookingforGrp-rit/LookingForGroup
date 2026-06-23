import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import getMemberRequestService from '#services/projects/members/get-member-request.ts';

//GET api/projects/members/requests/:id
//gets the member request associated with the request id
const getInvitations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const requestId = parseInt(req.params.id);

  const result = await getMemberRequestService(requestId);

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
      error: 'Applications not found',
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

export default getInvitations;
