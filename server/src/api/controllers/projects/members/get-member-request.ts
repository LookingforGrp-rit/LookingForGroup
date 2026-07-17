import type {
  ApiResponse,
  AuthenticatedRequest,
  GetMemberRequest,
} from '@looking-for-group/shared';
import type { Response } from 'express';
import getMemberRequestService from '#services/projects/members/get-member-request.ts';

//GET api/projects/members/requests
//gets the member request associated with the request id and/or additional data in query
const getMemberRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const data = {
    requestId: req.query.requestId ? parseInt(req.query.requestId as string) : undefined,
    prospectiveMemberId: req.query.prospectiveMemberId
      ? parseInt(req.query.prospectiveMemberId as string)
      : undefined,
    projectId: req.query.projectId ? parseInt(req.query.projectId as string) : undefined,
    roleId: req.query.roleId ? parseInt(req.query.roleId as string) : undefined,
  } as GetMemberRequest;

  const result = await getMemberRequestService(data);

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

  const resBody: ApiResponse<typeof result> = {
    status: 200,
    error: null,
    data: result,
  };
  res.status(200).json(resBody);
};

export default getMemberRequest;
