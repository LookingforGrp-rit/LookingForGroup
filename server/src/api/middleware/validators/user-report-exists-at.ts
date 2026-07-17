import type { ApiResponse } from '@looking-for-group/shared';
import { type NextFunction, type Request, type RequestHandler, type Response } from 'express';
import getUserReportByIdService from '#services/mod/get-user-report-by-id.ts';

type ParameterLocation = 'path' | 'body';

export const userReportExistsAt = (type: ParameterLocation, key: string): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    let rawUserReportId;

    switch (type) {
      case 'path':
        rawUserReportId = req.params[key] as string;
        break;
      case 'body':
        rawUserReportId = (req.body as Record<string, unknown>)[key] as string;
        break;
    }

    const reportId = parseInt(rawUserReportId);

    if (isNaN(reportId)) {
      const resBody: ApiResponse = {
        status: 400,
        error: 'Invalid user report ID',
        data: null,
      };
      res.status(400).json(resBody);
      return;
    }

    const reportQuery = await getUserReportByIdService(reportId);

    if (reportQuery === 'INTERNAL_ERROR') {
      const resBody: ApiResponse = {
        status: 500,
        error: 'Internal Server Error',
        data: null,
      };
      res.status(500).json(resBody);
      return;
    }

    if (reportQuery === 'NOT_FOUND') {
      const resBody: ApiResponse = {
        status: 404,
        error: 'User report not found',
        data: null,
      };
      res.status(404).json(resBody);
      return;
    }

    next();
  };
};
