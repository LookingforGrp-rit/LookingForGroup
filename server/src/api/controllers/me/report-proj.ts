import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import { reportProjectService } from '#services/me/report-proj.ts';

/**
 * POST api/me/projects/reports/{id}/{report}
 * Allows authenticated users to report a project
 */
const reportProjectController = async (req: AuthenticatedRequest, res: Response) => {
  const projectId = parseInt(req.params.id as string);
  const report = req.params.report as string;

  const result = await reportProjectService(req.currentUser.userId, projectId, report);

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'Project not found',
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

export { reportProjectController };
