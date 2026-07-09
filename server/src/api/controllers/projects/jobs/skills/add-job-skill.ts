import type { AddJobSkillInput, ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import addJobSkillService from '#services/projects/jobs/skills/add-job-skill.ts';

//POST api/projects/{id}/jobs/{jobId}/skills
//add a skill to a job
const addJobSkill = async (req: Request, res: Response) => {
  const data: AddJobSkillInput = req.body as AddJobSkillInput;
  const projectId = parseInt(req.params.id as string);
  const jobId = parseInt(req.params.jobId as string);

  //add the skill they wanna add
  const result = await addJobSkillService(projectId, jobId, data);

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

export default addJobSkill;
