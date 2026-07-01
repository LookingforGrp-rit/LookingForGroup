import type { ApiResponse, UpdateJobSkillInput } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import updateJobSkillService from '#services/projects/jobs/skills/update-job-skill.ts';

//PATCH api/projects/{id}/jobs/{jobId}/skills/{skillId}
//update a job skill
/*NOTICE: skill proficiency is not fully implemented on the frontend.
  Skill proficiency is essentially an extra label that shows how experienced you are with a skill.
  novice, expert, etc.
  SkillProficiency enum exists in the shared types, and the userSkills object has the skills, and this route exists to change them
  but we didn't implement this over there because the frontend needed more work to accomodate for it.
  This was a stretch goal but you guys can use this if you wanted to make it work
*/
const updateJobSkill = async (req: Request, res: Response) => {
  const data: UpdateJobSkillInput = req.body as UpdateJobSkillInput;
  const projectId = parseInt(req.params.id as string);
  const skillId = parseInt(req.params.skillId as string);

  //update the skills they wanna update
  const result = await updateJobSkillService(projectId, skillId, data);

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'Skill not found',
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

export default updateJobSkill;
