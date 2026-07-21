import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import getBugReportByIdService from '#services/mod/get-bug-reports-by-id.ts';

//GET api/mod/bug-report/{id}
//gets all bug reports
export const getBugReportById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const reportId = parseInt(req.params.id as string);
  const result = await getBugReportByIdService(reportId);

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'Bug report not found',
      data: null,
    };
    res.status(404).json(resBody);
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
    data: result,
  };
  res.status(200).json(resBody);
};
