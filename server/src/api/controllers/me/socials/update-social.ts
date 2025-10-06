import type {
  ApiResponse,
  AuthenticatedRequest,
  UpdateUserSocialInput,
} from '@looking-for-group/shared';
import type { Response } from 'express';
import { updateSocialService } from '#services/me/socials/update-social.ts';

//update one of current user's social
export const updateSocial = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  //current user ID
  const UserId = parseInt(req.currentUser);

  const social: UpdateUserSocialInput = { url: req.params.url } as UpdateUserSocialInput;
  const websiteId = parseInt(req.params.websiteId);

  //check if websiteId is number
  if (isNaN(websiteId)) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid website ID',
      data: null,
    };
    res.status(400).json(resBody);
    return;
  }

  const result = await updateSocialService({ ...social, websiteId }, UserId);

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
