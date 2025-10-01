import type {
  ApiResponse,
  AuthenticatedRequest,
  UpdateUserSkillInput,
} from '@looking-for-group/shared';
import type { Response } from 'express';
import updateSkillsService from '#services/me/skills/update-skills.ts';

//add skills to user profile
const updateSkillsController = async (req: AuthenticatedRequest, res: Response) => {
  const data: UpdateUserSkillInput = req.body as UpdateUserSkillInput;
  const skillId = parseInt(req.params.id);

  //current user ID
  const UserId = parseInt(req.currentUser);

  //check if ID is number
  if (isNaN(UserId) || isNaN(skillId)) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid user ID or skill ID',
      data: null,
    };
    res.status(400).json(resBody);
    return;
  }

  //update the skills they wanna update
  const result = await updateSkillsService(UserId, skillId, data);

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

export default updateSkillsController;
