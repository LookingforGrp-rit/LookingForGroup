import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import { leaveProjectService } from '#services/me/leave-project.ts';

/**
 * Handles PUT /me/projects/:id/visibility requests
 * Allows authenticated users to leave a project by setting their visibility to private
 */
const leaveProjectController = async (req: AuthenticatedRequest, res: Response) => {
  const projectId = parseInt(req.params.id);

  const result = await leaveProjectService(projectId, req.currentUser);

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'Project not found or you are not a member of this project',
      data: null,
    };
    res.status(404).json(resBody);
    return;
  }

  if (result === 'FORBIDDEN') {
    const resBody: ApiResponse = {
      status: 403,
      error: 'Project owners cannot leave their own projects',
      data: null,
    };
    res.status(403).json(resBody);
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
    data: null,
  };
  res.status(200).json(resBody);
};

export { leaveProjectController };
