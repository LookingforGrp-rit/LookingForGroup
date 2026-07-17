import type { ApiResponse, UpdateProjectSocialInput } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { updateProjectSocialService } from '#services/projects/socials/update-proj-social.ts';

//PATCH api/projects/{id}/socials/{socialId}
//updates a social associated with a project
export const updateProjectSocial = async (req: Request, res: Response): Promise<void> => {
  const projectId = parseInt(req.params.id as string);
  const socialId = parseInt(req.params.socialId as string);
  const social: UpdateProjectSocialInput = req.body as UpdateProjectSocialInput;

  if (Number.isNaN(projectId) || Number.isNaN(socialId)) {
    res.status(400).json({
      status: 400,
      error: 'Invalid request data',
      data: null,
    });
    return;
  }

  const result = await updateProjectSocialService(social, projectId, socialId);

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
