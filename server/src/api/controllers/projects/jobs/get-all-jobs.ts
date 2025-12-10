import type { ApiResponse, ProjectJob } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import getJobService from '#services/projects/jobs/get-all-jobs.ts';

//GET api/projects/{id}/jobs
//gets a project's jobs
const getJobsController = async (req: Request, res: Response): Promise<void> => {
  const projectId = parseInt(req.params.id);

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
