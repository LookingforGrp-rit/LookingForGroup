import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import { deleteSkillFromSiteService } from '#services/admin/delete-skill.ts';

const deleteSkill = async (request: AuthenticatedRequest, response: Response): Promise<void> => {
  const res: ApiResponse = { status: 0 };
  const skillId = parseInt(request.params.id as string);
  const result = await deleteSkillFromSiteService(skillId);

  if (result === 'INTERNAL_ERROR') {
    res.status = 500;
    res.error = 'There was an internal error';
  } else {
    res.status = 204;
    res.data = result;
  }

  response.status(res.status).json(res);
};

export default deleteSkill;
