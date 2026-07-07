import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import getMemberRequestsService from '#services/projects/members/get-member-requests.ts';

//GET api/projects/{id}/members/requests
//gets the member requests associated with the project id
const getMemberRequests = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const projectId = parseInt(req.params.id as string);
  const result = await getMemberRequestsService(projectId);

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
      error: 'Requests not found',
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

export default getMemberRequests;
