import type { ApiResponse, ProjectJob } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import getJobService from '#services/projects/jobs/get-all-jobs.ts';

const getJobsController = async (req: Request, res: Response): Promise<void> => {
  const projectId = parseInt(req.params.id);

  if (isNaN(projectId)) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid project ID',
      data: null,
    };
    res.status(400).json(resBody);
    return;
  }

  const result = await getJobService(projectId);

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'Job not found',
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

  const resBody: ApiResponse<ProjectJob[]> = {
    status: 200,
    error: null,
    data: result,
  };
  res.status(200).json(resBody);
};

export default getJobsController;
