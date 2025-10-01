import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import deleteJobService from '#services/projects/jobs/delete-job.ts';

const deleteJobController = async (req: Request, res: Response): Promise<void> => {
  const projectId = parseInt(req.params.id);
  const jobId = parseInt(req.params.jobId);

  if (isNaN(projectId) || isNaN(jobId)) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid project ID or job ID',
      data: null,
    };
    res.status(400).json(resBody);
    return;
  }

  const result = await deleteJobService(projectId, jobId);

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

  const resBody: ApiResponse = {
    status: 200,
    error: null,
    data: null,
  };
  res.status(200).json(resBody);
};

export default deleteJobController;
