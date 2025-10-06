import type {
  AddUserMajorInput,
  ApiResponse,
  AuthenticatedRequest,
} from '@looking-for-group/shared';
import type { Response } from 'express';
import addUserMajorService from '#services/me/majors/add-major.ts';

//add a major to user profile
const addUserMajor = async (req: AuthenticatedRequest, res: Response) => {
  const data: AddUserMajorInput = req.body as AddUserMajorInput;

  const majorWithUserId = {
    ...data,
    userId: parseInt(req.currentUser),
  };

  //add the major they wanna add
  const result = await addUserMajorService(majorWithUserId);

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

export default addUserMajor;
