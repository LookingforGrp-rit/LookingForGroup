import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { deleteSkillsService } from '#services/me/delete-skills.ts';

type Skills = {
  skillIds: number[];
};

//delete multiple ksills from user profile
export const deleteSkills = async (req: Request, res: Response): Promise<void> => {
  if (req.currentUser === undefined) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid user ID',
      data: null,
      memetype: 'application/json',
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
      memetype: 'application/json',
    };
    res.status(400).json(resBody);
    return;
  }

  //the one you're deleting
  const skill = req.body as Skills;

  const result = await deleteSkillsService(skill, UserId);

  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
      memetype: 'application/json',
    };
    res.status(500).json(resBody);
    return;
  }

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'Skill not found',
      data: null,
      memetype: 'application/json',
    };
    res.status(404).json(resBody);
    return;
  }

  const resBody: ApiResponse<null> = {
    status: 200,
    error: null,
    data: null,
    memetype: 'application/json',
  };
  res.status(200).json(resBody);
};
