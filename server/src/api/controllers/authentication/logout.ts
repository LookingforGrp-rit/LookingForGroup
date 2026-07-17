//logout!
//maybe there's a more proper way to do this but i'm just gonna delete the cookie bc that's how i've been manually logging out so
//we're deleting a resource so it should be DELETE right?
import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';

export const logout = (request: Request, response: Response) => {
  request.session.destroy(() => {});
  const resBody: ApiResponse = {
    status: 200,
    error: null,
    data: null,
  };
  return response.status(200).json(resBody);
};
