import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { updateProjectSocialService } from '#services/projects/update-project-social.ts';

//updates a social associated with a project
export const updateProjectSocial = async (req: Request, res: Response): Promise<void> => {
  const social = req.params.url;
  const websiteId = parseInt(req.params.websiteId);
  const projectId = parseInt(req.params.id);

  const result = await updateProjectSocialService(social, projectId, websiteId);

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

  const resBody: ApiResponse<typeof result> = {
    status: 200,
    error: null,
    data: result,
  };
  res.status(200).json(resBody);
};
