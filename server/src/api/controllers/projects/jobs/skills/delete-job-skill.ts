import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { deleteJobSkillService } from '#services/projects/jobs/skills/delete-job-skill.ts';

//DELETE api/projects/{id}/jobs/{jobId}/skills/{skillId}
//deletes a job skill from a job
const deleteJobSkill = async (req: Request, res: Response) => {
  const skillId = parseInt(req.params.skillId as string);
  const jobId = parseInt(req.params.jobId as string);

  const result = await deleteJobSkillService(skillId, jobId);

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
      error: 'Tag not found',
      data: null,
    };
    res.status(404).json(resBody);
    return;
  }
  const resBody: ApiResponse = {
    status: 200,
    error: null,
    data: null,
  };
  res.status(200).json(resBody);
};

export default deleteJobSkill;
