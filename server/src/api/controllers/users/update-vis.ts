import type { ApiResponse } from '@looking-for-group/shared';
import type { RequestHandler } from 'express';
import { updateUserVisibilityService } from '#services/users/update-vis.ts';

export const updateVisibility: RequestHandler<
  { id: string },
  unknown,
  { visibility?: number }
> = async (req, res) => {
  const { id } = req.params;
  const { visibility: newVisibility } = req.body;

  //validate ID
  const userId = parseInt(id);
  if (isNaN(userId)) {
    res.status(400).json({ message: 'Invalid user ID' });
    return;
  }

  //validate visibility num
  if (typeof newVisibility !== 'number' || (newVisibility !== 0 && newVisibility !== 1)) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Visibility must be 0 (private) or 1(public)',
      data: null,
      memetype: 'application/json',
    };
    res.status(400).json(resBody);
    return;
  }

  //update username
  const result = await updateUserVisibilityService(userId, newVisibility);

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'User not found',
      data: null,
      memetype: 'application/json',
    };
    res.status(404).json(resBody);
    return;
  }
  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
      memetype: 'application/json',
    };
    res.status(500).json(resBody);
    return;
  }

  const resBody: ApiResponse<typeof result> = {
    status: 200,
    error: null,
    data: result,
    memetype: 'application/json',
  };
  res.status(200).json(resBody);
};
