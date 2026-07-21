import type {
  ApiResponse,
  AuthenticatedRequest,
  UpdateBugReportInput,
} from '@looking-for-group/shared';
import type { Response } from 'express';
import updateBugReportService from '#services/mod/update-bug-report.ts';

//GET api/mod/bug-report/{id}
//gets all bug reports
export const updateBugReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const reportId = parseInt(req.params.id as string);
  const body = req.body as UpdateBugReportInput;
  const result = await updateBugReportService(reportId, body.isResolved, body.modNotes);

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
    data: null,
  };
  res.status(200).json(resBody);
};
