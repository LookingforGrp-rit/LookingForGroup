import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import getJobSkillsService from '#services/projects/jobs/skills/get-job-skills.ts';

//GET api/projects/{id}/jobs/{jobId}/skills
//get the skills associated with a job
const getJobSkills = async (req: Request, res: Response): Promise<void> => {
  const jobId = parseInt(req.params.jobId as string);

  const result = await getJobSkillsService(jobId);

  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };
    res.status(500).json(resBody);
    return;
  }

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'Project not found',
      data: null,
    };
    res.status(404).json(resBody);
    return;
  }

  const resBody: ApiResponse<typeof result> = {
    status: 200,
    error: null,
    data: result,
  };
  res.status(200).json(resBody);
};

export default getJobSkills;
