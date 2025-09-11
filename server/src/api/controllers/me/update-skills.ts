import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import type { SkillProficiency } from '#prisma-models/index.js';
import updateSkillsService from '#services/me/update-skills.ts';

type SkillInfo = {
  skillId: number;
  position?: number;
  proficiency: SkillProficiency;
};

//add skills to user profile
const updateSkillsController = async (req: Request, res: Response) => {
  const data: SkillInfo = req.body as SkillInfo;

  if (req.currentUser === undefined) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid user ID',
      data: null,
    };
    res.status(400).json(resBody);
    return;
  }

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

  //update the skills they wanna update
  const result = await updateSkillsService(UserId, data);

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
