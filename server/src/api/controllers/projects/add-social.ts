import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { addProjectSocialService } from '#services/projects/add-social.ts';

type Social = {
  socialId: number;
  url: string;
};

export const addProjectSocial = async (req: Request, res: Response): Promise<void> => {
  const social: Social = req.body as Social;
  const id = parseInt(req.params.id);

  const result = await addProjectSocialService(social, id);

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
      error: 'No Projects for user found',
      data: null,
      memetype: 'application/json',
    };
    res.status(404).json(resBody);
    return;
  }

  const resBody: ApiResponse<typeof result> = {
    status: 200,
    error: null,
    data: result,
    memetype: 'application/json',
  };
  res.status(200).json(resBody);
};
