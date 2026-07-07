import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import { demoteModService } from '#services/admin/demote-from-mod.ts';

const demoteMod = async (request: AuthenticatedRequest, response: Response): Promise<void> => {
  type DemoteModBody = { userId: number };
  const body = request.body as DemoteModBody;
  const res: ApiResponse = { status: 0 };

  const result = await demoteModService(body.userId);

  if (result === 'INTERNAL_ERROR') {
    res.status = 500;
    res.error = 'There was an internal error.';
  } else if (result === 'CONFLICT') {
    res.status = 409;
    res.error = 'You cannot demote a standard user.';
  } else if (result === 'FORBIDDEN') {
    res.status = 403;
    res.error = 'You cannot demote an administrator.';
  } else if (result === 'NOT_FOUND') {
    res.status = 404;
    res.error = 'User not found.';
  } else {
    res.status = 200;
    res.data = 'Mod demoted successfully!';
  }

  response.status(res.status).json(res);
};

export default demoteMod;
