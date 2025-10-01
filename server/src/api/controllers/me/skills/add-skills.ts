import type {
  AddUserSkillsInput,
  ApiResponse,
  AuthenticatedRequest,
} from '@looking-for-group/shared';
import type { Response } from 'express';
import addSkillsService from '#services/me/skills/add-skills.ts';

//add skills to user profile
const addSkillsController = async (req: AuthenticatedRequest, res: Response) => {
  const data: AddUserSkillsInput = req.body as AddUserSkillsInput;

  //current user ID
  const UserId = parseInt(req.currentUser);

  //check if ID is number
  if (isNaN(UserId)) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid user ID',
      data: null,
    };
    res.status(400).json(resBody);
    return;
  }

  const skillsWithUserId = data.map((skill) => ({ ...skill, userId: UserId }));

  //add the skills they wanna add
  const result = await addSkillsService(skillsWithUserId);

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

export default addSkillsController;
