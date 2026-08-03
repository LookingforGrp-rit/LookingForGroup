import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Request, Response } from 'express';
import { getUserByGoogleService } from '#services/me/get-user-google.ts';
import { getUserProjectsService } from '#services/users/get-user-proj.ts';

//GET api/users/{id}/projects
// gets the projects of another user to view
export const getOtherUserProjects = async (req: Request, res: Response): Promise<void> => {
  //current user ID
  const UserId = parseInt(req.params.id as string);

  const authenticatedRequest = req as AuthenticatedRequest;

  if (req.session.gid) {
    const sessionUser = await getUserByGoogleService(req.session.gid);
    if (sessionUser !== 'INTERNAL_ERROR' && sessionUser !== 'NOT_FOUND') {
      authenticatedRequest.currentUser = sessionUser;
    }
  }

  const result = await getUserProjectsService(UserId, authenticatedRequest.currentUser.userId);

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
      error: 'No projects for this user or user private',
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
