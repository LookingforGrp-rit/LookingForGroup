import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { deleteProjectSocialService } from '#services/projects/socials/delete-proj-social.ts';

//deletes a project's social
export const deleteProjectSocial = async (req: Request, res: Response): Promise<void> => {
  const projId = parseInt(req.params.id);
  const social = parseInt(req.params.websiteId);

  const result = await deleteProjectSocialService(social, projId);

  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };
    res.status(500).json(resBody);
    return;
  }

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'Social not found',
      data: null,
    };
    res.status(404).json(resBody);
    return;
  }

  const resBody: ApiResponse = {
    status: 200,
    error: null,
    data: null,
  };
  res.status(200).json(resBody);
};
