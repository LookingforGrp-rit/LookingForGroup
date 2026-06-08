import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import type { ServiceErrorSubset, ServiceSuccessSubset } from '#services/service-outcomes.ts';
import { getBlacklistedUsersService } from '../../../services/users/blacklist/get-blacklist.ts';

type GetBlacklistServiceError = ServiceErrorSubset<'INTERNAL_ERROR' | 'NOT_FOUND'>;
type GetBlacklistServiceSuccess = ServiceSuccessSubset<'OK'>;

//GET api/users/blacklist
//Gets all blacklisted users
export const getBlacklistedUsers = async (
  req: Request,
  res: Response,
): Promise<GetBlacklistServiceSuccess | GetBlacklistServiceError> => {
  const result = await getBlacklistedUsersService();

  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };

    res.status(500).json(resBody);
    return 'INTERNAL_ERROR';
  }

  const resBody: ApiResponse<typeof result> = {
    status: 200,
    error: null,
    data: result,
  };

  res.status(200).json(resBody);
  return 'OK';
};
