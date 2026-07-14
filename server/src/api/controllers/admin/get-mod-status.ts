import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import { getAccessLevelService } from '#services/admin/get-mod-status.ts';

//GET api/admin/status/:id
//get a user's access level (current user only currently)
export const getAccessLevel = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id: number = parseInt(req.params.id as string);
  const result = await getAccessLevelService(id);

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
      error: 'User not found',
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
