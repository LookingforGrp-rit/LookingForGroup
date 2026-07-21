import type {
  ApiResponse,
  AuthenticatedRequest,
  UpdateTagBlacklistInput,
} from '@looking-for-group/shared';
import type { Response } from 'express';
import updateTagBlacklistService from '#services/me/tag-blacklist/update-tag-blacklist.ts';

//PATCH api/me/tag-blacklist
//Update a user's blacklisted tags
export const updateTagBlacklist = async (req: AuthenticatedRequest, res: Response) => {
  const data: UpdateTagBlacklistInput = req.body as UpdateTagBlacklistInput;

  //update their blacklist
  const result = await updateTagBlacklistService(req.currentUser.userId, data);

  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };
    res.status(500).json(resBody);
    return;
  }

  const resBody: ApiResponse = {
    status: 200,
    error: null,
    data: result,
  };
  res.status(200).json(resBody);
};
