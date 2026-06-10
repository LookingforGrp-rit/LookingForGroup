import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { NextFunction, Response } from 'express';
import getProjectByIdService from '#services/projects/get-proj-id.ts';

const requiresPendingProjectMember = async (
  request: AuthenticatedRequest,
  response: Response,
  next: NextFunction,
) => {
  //current user ID
  const user = request.currentUser;

  //check if ID is number

  if (isNaN(user.userId)) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid user ID',
      data: null,
    };
    response.status(400).json(resBody);
    return;
  }

  const projectId = parseInt(request.params.id);

  //check if project id is number
  if (isNaN(projectId)) {
    const resBody: ApiResponse = {
      status: 400,
      error: 'Invalid project ID',
      data: null,
    };
    response.status(400).json(resBody);
    return;
  }

  const result = await getProjectByIdService(projectId);

  if (result === 'INTERNAL_ERROR') {
    const resBody: ApiResponse = {
      status: 500,
      error: 'Internal Server Error',
      data: null,
    };
    response.status(500).json(resBody);
    return;
  }

  if (result === 'NOT_FOUND') {
    const resBody: ApiResponse = {
      status: 404,
      error: 'Project not found',
      data: null,
    };
    response.status(404).json(resBody);
    return;
  }

  const member = result.members.find((m) => m.user.userId === user.userId);

  // no member found
  if (!member) {
    const resBody: ApiResponse = {
      status: 404, // not found
      error: 'User is not a member at all',
      data: null,
    };
    response.status(404).json(resBody);
    return;
  }

  // check if user is one of the pending member of the project
  if (member.role.label.toLowerCase() !== 'pending') {
    const resBody: ApiResponse = {
      status: 409, // conflict
      error: "Member exists, but status isn't pending",
      data: null,
    };
    response.status(409).json(resBody);
    return;
  }

  next();
};

export default requiresPendingProjectMember;
