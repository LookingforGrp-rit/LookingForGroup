import type { ApiResponse, AddProjectSocialInput } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { addProjectSocialService } from '#services/projects/socials/add-social.ts';

//adds a social to the project
export const addProjectSocial = async (req: Request, res: Response): Promise<void> => {
  const social: AddProjectSocialInput = req.body as AddProjectSocialInput;
  const id = parseInt(req.params.id);

  const result = await addProjectSocialService(social, id);

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
      error: 'No Projects for user found',
      data: null,
    };
    res.status(404).json(resBody);
    return;
  }
  if (result === 'CONFLICT') {
    const resBody: ApiResponse = {
      status: 409,
      error: 'You already have a social from thsis site',
      data: null,
    };
    res.status(409).json(resBody);
    return;
  }

  const resBody: ApiResponse<typeof result> = {
    status: 200,
    error: null,
    data: result,
  };
  res.status(200).json(resBody);
};
