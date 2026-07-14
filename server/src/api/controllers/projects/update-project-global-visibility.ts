import type { ApiResponse, AuthenticatedRequest, Visibility } from '@looking-for-group/shared';
import type { Response } from 'express';
import { updateProjectGlobalVisibilityService } from '#services/projects/update-project-global-visibility.ts';

export const updateProjectGlobalVisibility = async (
  request: AuthenticatedRequest,
  response: Response,
): Promise<void> => {
  type UpdateVisibilityBody = {
    visibility: Visibility;
  };

  const res: ApiResponse = { status: 0 };
  const projectId = parseInt(request.query.id as string);
  const visibility = (request.body as UpdateVisibilityBody).visibility;
  const result = await updateProjectGlobalVisibilityService(projectId, visibility);

  if (result === 'INTERNAL_ERROR') {
    res.status = 500;
    res.error = 'There was an internal error.';
  } else {
    res.status = 200;
    res.data = 'Project visibility updated successfully.';
  }

  response.status(res.status).json(res);
};
