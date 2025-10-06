import type {
  AddUserSkillsInput,
  ApiResponse,
  AuthenticatedRequest,
} from '@looking-for-group/shared';
import type { Response } from 'express';
import addSkillService from '#services/me/skills/add-skills.ts';

//add a skill to user profile
const addSkill = async (req: AuthenticatedRequest, res: Response) => {
  const data: AddUserSkillsInput = req.body as AddUserSkillsInput;

  const skillWithUserId = {
    ...data,
    userId: parseInt(req.currentUser),
  };

  //add the skill they wanna add
  const result = await addSkillService(skillWithUserId);

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

export default addSkill;
