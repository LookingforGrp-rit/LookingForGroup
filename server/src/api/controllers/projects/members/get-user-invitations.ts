import type { ApiResponse, AuthenticatedRequest } from '@looking-for-group/shared';
import type { Response } from 'express';
import getInvitationsService from '#services/projects/members/get-user-invitations.ts';

//GET api/projects/members/invitations
//gets the member invitation requests associated with a user
const getInvitations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const userID = req.currentUser.userId;

  const result = await getInvitationsService(userID);

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
      error: 'Applications not found',
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

export default getInvitations;
