import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import { reportBugService } from '#services/me/report-bug.ts';

/**
 * POST api/me/users/reports/{id}
 * Allows authenticated users to report a user
 */
const reportBugController = async (req: AuthenticatedRequest, res: Response) => {
  const data = req.body as { reportText: string };

  const result = await reportBugService(req.currentUser.userId, data.reportText);

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

export { reportBugController };
