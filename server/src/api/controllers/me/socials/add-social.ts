import type {
  AddUserSocialInput,
  ApiResponse,
  AuthenticatedRequest,
} from '@looking-for-group/shared';
import type { Response } from 'express';
import { addSocialService } from '#services/me/socials/add-social.ts';

//add social to user profile
export const addSocial = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  //current user ID
  const UserId = parseInt(req.currentUser);

  const social: AddUserSocialInput = req.body as AddUserSocialInput;

  const result = await addSocialService(social, UserId);

  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };
    res.status(500).json(resBody);
    return;
  }

  const resBody: ApiResponse<typeof result> = {
    status: 200,
    error: null,
    data: result,
  };
  res.status(200).json(resBody);
};
