import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import { deleteProjectService } from '#services/projects/delete-proj.ts';

//deletes a project (moderator action)
export const deleteProject = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const id = req.params.id; //the id of the project to be deleted

  //validate ID
  const projectId = parseInt(id);
  if (isNaN(projectId)) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid project ID',
      data: null,
    };
    res.status(400).json(resBody);
    return;
  }

  const result = await deleteProjectService(projectId);

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'Project not found',
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
    data: null,
  };
  res.status(200).json(resBody);
};
