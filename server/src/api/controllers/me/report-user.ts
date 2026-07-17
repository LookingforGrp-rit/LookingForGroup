import type {
  ApiResponse,
  AuthenticatedRequest,
  AddUserReportInput,
} from '@looking-for-group/shared';
import type { Response } from 'express';
import { reportUserService } from '#services/me/report-user.ts';

/**
 * POST api/me/users/reports/{id}
 * Allows authenticated users to report a user
 */
const reportUserController = async (req: AuthenticatedRequest, res: Response) => {
  const reportedId = parseInt(req.params.id as string);
  const data = req.body as AddUserReportInput;

  const result = await reportUserService(req.currentUser.userId, reportedId, data.reason);

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'User not found',
      data: null,
    };
    res.status(404).json(resBody);
    return;
  }

  if (result === 'CONFLICT') {
    const resBody: ApiResponse = {
      status: 409,
      error: 'Report already exists',
      data: null,
    };
    res.status(409).json(resBody);
    return;
  }

  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };
    res.status(500).json(resBody);
    return;
  }

  const resBody: ApiResponse = {
    status: 200,
    error: null,
    data: null,
  };
  res.status(200).json(resBody);
};

export { reportUserController };
