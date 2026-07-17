import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import getProjectReportByIdService from '#services/mod/get-project-report-by-id.ts';

//GET api/mod/project-report/{id}
//gets a project report by ID
export const getProjectReportById = async (
  req: AuthenticatedRequest,
  res: Response,
): Promise<void> => {
  const id = parseInt(req.params.id as string);
  const result = await getProjectReportByIdService(id);

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'Project report not found',
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
