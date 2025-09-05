import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { updateProjectSocialService } from '#services/projects/update-project-social.ts';

type Social = {
  socialId: number;
  url: string;
};

export const updateProjectSocial = async (req: Request, res: Response): Promise<void> => {
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

  const social: Social = {
    socialId: parseInt(req.params.socialId),
    url: req.params.url,
  };

  const result = await updateProjectSocialService(social, UserId);

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
