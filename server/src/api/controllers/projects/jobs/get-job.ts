import type { ApiResponse, ProjectJob } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import getJobService from '#services/projects/jobs/get-job.ts';

const getJobController = async (req: Request, res: Response): Promise<void> => {
  const projectId = parseInt(req.params.projectId);
  const jobId = parseInt(req.params.jobId);

  if (isNaN(projectId) || isNaN(jobId)) {
    const resBody: ApiResponse<ProjectJob> = {
      status: 400,
      error: 'Invalid project ID or job ID',
      data: null,
    };
    res.status(400).json(resBody);
    return;
  }

  const result = await getJobService(projectId, jobId);

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse<ProjectJob> = {
      status: 404,
      error: 'Job not found',
      data: null,
    };
    res.status(404).json(resBody);
    return;
  }

  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse<ProjectJob> = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };
    res.status(500).json(resBody);
    return;
  }

  const resBody: ApiResponse<ProjectJob> = {
    status: 200,
    error: null,
    data: result,
  };
  res.status(200).json(resBody);
};

export default getJobController;
