import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import type { SkillProficiency } from '#prisma-models/index.js';
import addSkillsService from '#services/me/add-skills.ts';

type Skill = {
  userId: number;
  skillId: number;
  position: number;
  proficiency: SkillProficiency;
};

//add skills to user profile
const addSkillsController = async (req: Request, res: Response) => {
  const data: Skill[] = req.body as Skill[];

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

  data.forEach((skill) => {
    skill.userId = UserId;
  });

  //add the skills they wanna add
  const result = await addSkillsService(data);

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
