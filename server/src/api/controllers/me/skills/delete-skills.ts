import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import { deleteSkillService } from '#services/me/skills/delete-skills.ts';

//delete a skill from user profile
export const deleteSkill = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  //current user ID
  const userId = parseInt(req.currentUser);

  //the one you're deleting
  const skill = parseInt(req.params.id);

  const result = await deleteSkillService(skill, userId);

  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };
    res.status(500).json(resBody);
    return;
  }

  const resBody: ApiResponse<null> = {
    status: 200,
    error: null,
    data: null,
  };
  res.status(200).json(resBody);
};
