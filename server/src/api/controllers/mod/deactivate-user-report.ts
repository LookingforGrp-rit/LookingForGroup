import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import deactivateUserReportService from '#services/mod/deactivate-user-report.ts';

//PATCH api/mod/user-report/{id}/deactivate
//Deactivates a user report by setting the active field to false.
export const deactivateUserReport = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const id = parseInt(req.params.id as string);
  const result = await deactivateUserReportService(id);

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
    data: result,
  };
  res.status(200).json(resBody);
};
