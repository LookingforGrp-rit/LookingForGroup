import type { ApiResponse } from '@looking-for-group/shared';
import type { Request, Response } from 'express';

const deleteMemberController = (req: Request, res: Response) => {
  res.status(501).json({
    status: 501,
    error: 'NOT IMPLEMENTED',
    data: null,
    memetype: 'application/json',
  } as ApiResponse);

  // const { id } = req.params;
  // const memberId = parseInt(id);
  // if (isNaN(memberId)) {
  //   const resBody: ApiResponse = {
  //     status: 400,
  //     error: 'Invalid member ID',
  //     data: null,
  //     memetype: 'application/json',
  //   };
  //   res.status(400).json(resBody);
  //   return;
  // }
  // const result = await deleteService(memberId);
  // if (result === 'NOT_FOUND') {
  //   const resBody: ApiResponse = {
  //     status: 404,
  //     error: 'Member not found',
  //     data: null,
  //     memetype: 'application/json',
  //   };
  //   res.status(404).json(resBody);
  //   return;
  // }
  // if (result === 'INTERNAL_ERROR') {
  //   const resBody: ApiResponse = {
  //     status: 500,
  //     error: 'Internal Server Error',
  //     data: null,
  //     memetype: 'application/json',
  //   };
  //   res.status(500).json(resBody);
  //   return;
  // }
  // const resBody: ApiResponse = {
  //   status: 200,
  //   error: null,
  //   data: result,
  //   memetype: 'application/json',
  // };
  // res.status(200).json(resBody);
};

export default deleteMemberController;
