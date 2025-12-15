import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import { deleteSocialService } from '#services/me/socials/delete-social.ts';

//DELETE api/me/socials/{websiteId}
//delete a social from user profile
export const deleteSocial = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  //the one you're deleting
  const social = parseInt(req.params.websiteId);

  const result = await deleteSocialService(social, req.currentUser);

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
