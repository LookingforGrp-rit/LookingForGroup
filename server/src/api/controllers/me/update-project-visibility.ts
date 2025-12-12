import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import { updateProjectVisibility } from '#services/me/update-project-visibility.ts';

/**
 * Handles PUT api/me/projects/:id/visibility requests
 * Allows authenticated users to update their project's visibility on their profile
 * Does NOT update the entire project's visibility, only toggles whether or not it's seen on the user's account
 */
const updateProjectVisibilityController = async (req: AuthenticatedRequest, res: Response) => {
  const projectId = parseInt(req.params.id);

  // Validate request body - expecting { visibility: 'private' or 'public' }
  const visibility = (req.body as { visibility: 'private' | 'public' | undefined }).visibility;

  const result = await updateProjectVisibility(projectId, req.currentUser, visibility);

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'Project not found or you are not a member of this project',
      data: null,
    };
    res.status(404).json(resBody);
    return;
  }

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

export { updateProjectVisibilityController };
