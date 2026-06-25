import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import deleteProjectReportService from '#services/projects/delete-project-report.ts';

//DELETE api/mod/project-report/{id}
//deletes a project report (moderator action)
export const deleteProjectReport = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const reportId = parseInt(req.params.id as string);

  const result = await deleteProjectReportService(reportId);

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'Report not found',
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
