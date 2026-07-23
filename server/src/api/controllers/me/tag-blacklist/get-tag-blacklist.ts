import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import getTagBlacklistService from '#services/me/tag-blacklist/get-tag-blacklist.ts';

//GET api/me/tag-blacklist
//get a user's blacklisted tags
export const getTagBlacklist = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const result = await getTagBlacklistService(req.currentUser.userId);

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
      error: 'Blacklist not found',
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
