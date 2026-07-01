import { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import { promoteUserToModService } from '#services/admin/promote-to-mod.ts';

const promoteUserToMod = async (
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> => {
  type PromoteToModBody = { userId: number };
  const body = request.body as PromoteToModBody;
  const res: ApiResponse = { status: 0 };

  const result = await promoteUserToModService(body.userId);

  if (result === 'INTERNAL_ERROR') {
    res.status = 500;
    res.error = 'There was an internal error.';
  } else if (result === 'CONFLICT') {
    res.status = 409;
    res.error = 'You cannot promote a moderator.';
  } else if (result === 'NOT_FOUND') {
    res.status = 404;
    res.error = 'User not found.';
  } else {
    res.status = 200;
    res.data = 'User promoted successfully!';
  }

  response.status(res.status).json(res);
};

export default promoteUserToMod;
